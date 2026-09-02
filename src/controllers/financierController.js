const db = require('../db/database');
const {
  daysOutstanding,
  getFinancingTerms
} = require('../services/tredsService');
const {
  createOrGetPackage,
  formatPackage,
  getPackageRow,
  loadScore,
  nextPrefixedId
} = require('./tredsController');

function formatDisbursement(row) {
  if (!row) return null;
  return {
    id: row.id,
    invoiceId: row.invoice_id,
    packageId: row.package_id,
    invoiceAmount: row.invoice_amount,
    advanceRate: row.advance_rate,
    advancePercent: Math.round(Number(row.advance_rate) * 100),
    disbursedAmount: row.disbursed_amount,
    holdbackAmount: row.holdback_amount,
    discountRate: row.discount_rate,
    discountPercent: Number(row.discount_rate) ? Math.round(Number(row.discount_rate) * 10000) / 100 : 0,
    discountFee: row.discount_fee,
    financierName: row.financier_name,
    disbursedAt: row.disbursed_at,
    settledAt: row.settled_at,
    settlementAmount: row.settlement_amount,
    status: row.status,
    remainingToFinancier: row.status === 'SETTLED' ? 0 : row.holdback_amount,
    unitAlreadyPaid: row.disbursed_amount,
    buyerPaysFinancier: row.invoice_amount
  };
}

function assembleInvoice(invoice) {
  const unit = db.prepare('SELECT * FROM units WHERE id = ?').get(invoice.unit_id);
  const order = invoice.order_id
    ? db.prepare('SELECT * FROM orders WHERE id = ?').get(invoice.order_id)
    : null;
  const score = unit ? loadScore(invoice, unit) : null;
  const pkg = formatPackage(getPackageRow(invoice.id));
  const disbursementRow = db.prepare('SELECT * FROM disbursements WHERE invoice_id = ?').get(invoice.id);
  const financing = getFinancingTerms(invoice.amount, score ? score.totalScore : invoice.trust_score);
  const outstanding = daysOutstanding(invoice.invoice_date);

  return {
    id: invoice.id,
    orderId: invoice.order_id,
    unitId: invoice.unit_id,
    unitName: unit ? unit.name : null,
    gstNumber: unit ? unit.gst_number : null,
    contact: unit ? unit.contact : null,
    buyerName: invoice.buyer_name,
    description: order ? order.description : null,
    amount: invoice.amount,
    invoiceDate: invoice.invoice_date,
    dueDate: invoice.due_date,
    delivered: Boolean(invoice.delivered),
    verified: Boolean(invoice.verified),
    trustScore: score ? score.totalScore : invoice.trust_score,
    trustStatus: score ? score.status : invoice.status,
    daysOutstanding: outstanding,
    financing,
    score,
    tredsPackage: pkg,
    tredsStatus: pkg ? pkg.status : null,
    disbursement: formatDisbursement(disbursementRow)
  };
}

function listFinancierInvoices(req, res) {
  try {
    const rows = db.prepare(
      `SELECT * FROM invoices
       WHERE verified = 1 AND trust_score IS NOT NULL
       ORDER BY created_at DESC`
    ).all();

    const invoices = rows.map(assembleInvoice);

    const summary = {
      total: invoices.length,
      financeReady: invoices.filter((i) => i.trustStatus === 'FINANCE_READY').length,
      review: invoices.filter((i) => i.trustStatus === 'REVIEW').length,
      atRisk: invoices.filter((i) => i.trustStatus === 'AT_RISK').length,
      listed: invoices.filter((i) => i.tredsStatus === 'LISTED').length,
      disbursed: invoices.filter((i) => i.disbursement && i.disbursement.status === 'DISBURSED').length,
      settled: invoices.filter((i) => i.disbursement && i.disbursement.status === 'SETTLED').length
    };

    return res.status(200).json({ success: true, summary, invoices });
  } catch (error) {
    console.error('Error listing financier invoices:', error);
    return res.status(500).json({ success: false, message: 'Failed to list financier invoices' });
  }
}

function getFinancierInvoice(req, res) {
  try {
    const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    return res.status(200).json({ success: true, invoice: assembleInvoice(invoice) });
  } catch (error) {
    console.error('Error fetching financier invoice:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch financier invoice' });
  }
}

function acceptInvoice(req, res) {
  try {
    const { id } = req.params;
    const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    if (!(invoice.verified === 1 || invoice.verified === true) || invoice.trust_score === null) {
      return res.status(400).json({
        success: false,
        message: 'Only scored, verified invoices can be accepted'
      });
    }

    const existing = db.prepare('SELECT * FROM disbursements WHERE invoice_id = ?').get(id);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Invoice has already been accepted and disbursed',
        disbursement: formatDisbursement(existing)
      });
    }

    const pkgResult = createOrGetPackage(id);
    const unit = db.prepare('SELECT * FROM units WHERE id = ?').get(invoice.unit_id);
    const score = loadScore(invoice, unit);
    const terms = getFinancingTerms(invoice.amount, score.totalScore);
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const disbursementId = nextPrefixedId('disbursements', 'DIS');

    db.prepare(
      `INSERT INTO disbursements (
        id, invoice_id, package_id, invoice_amount, advance_rate,
        disbursed_amount, holdback_amount, discount_rate, discount_fee,
        financier_name, disbursed_at, settled_at, settlement_amount, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?)`
    ).run(
      disbursementId,
      invoice.id,
      pkgResult.package.id,
      terms.invoiceAmount,
      terms.advanceRate,
      terms.disbursedAmount,
      terms.holdbackAmount,
      terms.discountRate,
      terms.discountFee,
      'Alchemy Finance Partners',
      now,
      'DISBURSED'
    );

    db.prepare(
      'UPDATE treds_packages SET status = ?, updated_at = ? WHERE invoice_id = ?'
    ).run('DISBURSED', now, invoice.id);

    const disbursement = formatDisbursement(
      db.prepare('SELECT * FROM disbursements WHERE id = ?').get(disbursementId)
    );

    return res.status(200).json({
      success: true,
      message: `Accepted. ${Math.round(terms.advanceRate * 100)}% disbursed to the unit now. Buyer will pay the financier at term.`,
      invoice: assembleInvoice(db.prepare('SELECT * FROM invoices WHERE id = ?').get(id)),
      disbursement
    });
  } catch (error) {
    console.error('Error accepting invoice:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : 'Failed to accept invoice'
    });
  }
}

function settleInvoice(req, res) {
  try {
    const { id } = req.params;
    const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const disbursement = db.prepare('SELECT * FROM disbursements WHERE invoice_id = ?').get(id);
    if (!disbursement) {
      return res.status(400).json({
        success: false,
        message: 'Invoice has not been accepted yet. Disburse 90% first.'
      });
    }
    if (disbursement.status === 'SETTLED') {
      return res.status(400).json({
        success: false,
        message: 'Buyer payment already settled to the financier',
        disbursement: formatDisbursement(disbursement)
      });
    }

    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    db.prepare(
      `UPDATE disbursements
       SET status = ?, settled_at = ?, settlement_amount = ?
       WHERE invoice_id = ?`
    ).run('SETTLED', now, disbursement.invoice_amount, id);

    db.prepare(
      'UPDATE treds_packages SET status = ?, updated_at = ? WHERE invoice_id = ?'
    ).run('SETTLED', now, id);

    const updated = formatDisbursement(
      db.prepare('SELECT * FROM disbursements WHERE invoice_id = ?').get(id)
    );

    return res.status(200).json({
      success: true,
      message: 'Buyer paid the financier in full. The unit does not receive the remaining 10% — that is the financier spread.',
      invoice: assembleInvoice(db.prepare('SELECT * FROM invoices WHERE id = ?').get(id)),
      disbursement: updated
    });
  } catch (error) {
    console.error('Error settling invoice:', error);
    return res.status(500).json({ success: false, message: 'Failed to settle buyer payment' });
  }
}

function declineInvoice(req, res) {
  try {
    const { id } = req.params;
    const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const existingDisbursement = db.prepare('SELECT id FROM disbursements WHERE invoice_id = ?').get(id);
    if (existingDisbursement) {
      return res.status(400).json({
        success: false,
        message: 'Cannot decline an invoice that has already been disbursed'
      });
    }

    const pkg = getPackageRow(id);
    if (!pkg) {
      createOrGetPackage(id);
    }

    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    db.prepare(
      'UPDATE treds_packages SET status = ?, updated_at = ? WHERE invoice_id = ?'
    ).run('DECLINED', now, id);

    return res.status(200).json({
      success: true,
      message: 'Financier declined this invoice on the mock TReDS board',
      invoice: assembleInvoice(db.prepare('SELECT * FROM invoices WHERE id = ?').get(id))
    });
  } catch (error) {
    console.error('Error declining invoice:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : 'Failed to decline invoice'
    });
  }
}

module.exports = {
  listFinancierInvoices,
  getFinancierInvoice,
  acceptInvoice,
  settleInvoice,
  declineInvoice
};
