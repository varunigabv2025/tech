const db = require('../db/database');
const { getGSTData } = require('../services/gstConnector');
const { getBankData } = require('../services/aaConnector');
const { calculateTrustScore } = require('../services/trustScore');
const {
  daysOutstanding,
  getFinancingTerms,
  packageForRXIL
} = require('../services/tredsService');

function isBuyerVerified(buyerName) {
  if (!buyerName) return false;
  const name = String(buyerName).trim().toUpperCase();
  return name === 'ABC EXPORTS' || name === 'XYZ TEXTILES';
}

function getStatusFromScore(score) {
  if (score >= 90) return 'FINANCE_READY';
  if (score >= 70) return 'REVIEW';
  return 'AT_RISK';
}

function nextPrefixedId(table, prefix) {
  const allowed = {
    treds_packages: 'treds_packages',
    disbursements: 'disbursements',
    aa_consents: 'aa_consents'
  };
  const safeTable = allowed[table];
  if (!safeTable) {
    throw new Error('Unknown id table');
  }
  const row = db.prepare(`SELECT COUNT(*) as count FROM ${safeTable}`).get();
  return `${prefix}${String((row ? row.count : 0) + 1).padStart(3, '0')}`;
}

function loadScore(invoice, unit) {
  const gstData = getGSTData(unit.gst_number);
  const bankData = getBankData(unit.id);
  const buyerVerified = isBuyerVerified(invoice.buyer_name);
  const result = calculateTrustScore({
    invoice,
    gstData,
    bankData,
    buyerVerified
  });
  return {
    totalScore: result.totalScore,
    status: getStatusFromScore(result.totalScore),
    breakdown: result.breakdown,
    totalPossible: result.totalPossible,
    gstData,
    bankData,
    buyerVerified
  };
}

function getPackageRow(invoiceId) {
  return db.prepare('SELECT * FROM treds_packages WHERE invoice_id = ?').get(invoiceId);
}

function formatPackage(row) {
  if (!row) return null;
  return {
    id: row.id,
    invoiceId: row.invoice_id,
    exchange: row.exchange,
    status: row.status,
    payload: JSON.parse(row.payload),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function createOrGetPackage(invoiceId) {
  const existing = getPackageRow(invoiceId);
  if (existing) return { package: formatPackage(existing), created: false };

  const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoiceId);
  if (!invoice) {
    const err = new Error('Invoice not found');
    err.statusCode = 404;
    throw err;
  }
  if (!(invoice.verified === 1 || invoice.verified === true)) {
    const err = new Error('Invoice must be verified before TReDS packaging');
    err.statusCode = 400;
    throw err;
  }
  if (invoice.trust_score === null || invoice.trust_score === undefined) {
    const err = new Error('Invoice must have a TrustScore before TReDS packaging');
    err.statusCode = 400;
    throw err;
  }

  const unit = db.prepare('SELECT * FROM units WHERE id = ?').get(invoice.unit_id);
  if (!unit) {
    const err = new Error('Associated unit not found');
    err.statusCode = 404;
    throw err;
  }

  const order = invoice.order_id
    ? db.prepare('SELECT * FROM orders WHERE id = ?').get(invoice.order_id)
    : null;

  const score = loadScore(invoice, unit);
  const terms = getFinancingTerms(invoice.amount, score.totalScore);
  const payload = packageForRXIL({ invoice, unit, order, score, terms });
  const id = nextPrefixedId('treds_packages', 'RXIL');
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

  db.prepare(
    `INSERT INTO treds_packages (id, invoice_id, exchange, payload, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(id, invoice.id, 'RXIL', JSON.stringify(payload), 'LISTED', now, now);

  return { package: formatPackage(getPackageRow(invoice.id)), created: true };
}

function sendToTreds(req, res) {
  try {
    const { id } = req.params;
    const result = createOrGetPackage(id);
    return res.status(result.created ? 201 : 200).json({
      success: true,
      message: result.created
        ? 'Invoice packaged and listed on mock RXIL TReDS'
        : 'Invoice already listed on mock RXIL TReDS',
      tredsPackage: result.package
    });
  } catch (error) {
    console.error('Error packaging invoice for TReDS:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : 'Failed to package invoice for TReDS'
    });
  }
}

function getPackage(req, res) {
  try {
    const { id } = req.params;
    const invoice = db.prepare('SELECT id FROM invoices WHERE id = ?').get(id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    const pkg = formatPackage(getPackageRow(id));
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Invoice has not been sent to TReDS yet' });
    }
    return res.status(200).json({ success: true, tredsPackage: pkg });
  } catch (error) {
    console.error('Error fetching TReDS package:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch TReDS package' });
  }
}

function listPackages(req, res) {
  try {
    const rows = db.prepare('SELECT * FROM treds_packages ORDER BY created_at DESC').all();
    return res.status(200).json({
      success: true,
      packages: rows.map(formatPackage)
    });
  } catch (error) {
    console.error('Error listing TReDS packages:', error);
    return res.status(500).json({ success: false, message: 'Failed to list TReDS packages' });
  }
}

module.exports = {
  sendToTreds,
  getPackage,
  listPackages,
  createOrGetPackage,
  formatPackage,
  getPackageRow,
  loadScore,
  nextPrefixedId,
  isBuyerVerified,
  getStatusFromScore
};
