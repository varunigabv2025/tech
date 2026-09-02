const db = require('../db/database');
const { nextPrefixedId } = require('./tredsController');

const DEFAULT_PURPOSE =
  'Assess 6-month cash-flow stability for invoice discounting on TReDS (RXIL). TrustFlow uses this only to generate an explainable TrustScore — it does not move money or open a loan.';

const DEFAULT_DATA_TYPES = [
  { code: 'DEPOSIT', label: 'Savings / current account summary', reason: 'Confirm the unit is an active banking customer' },
  { code: 'TRANSACTIONS', label: 'Credit transactions (last 6 months)', reason: 'Measure inflow stability for TrustScore cash-flow factor' },
  { code: 'TRANSACTIONS_DEBIT', label: 'Debit transactions (last 6 months)', reason: 'Spot irregular outflows that weaken repayment capacity' }
];

const DEFAULT_FIPS = [
  { id: 'HDFC-FIP', name: 'HDFC Bank', accountMasked: 'XXXXXX4821' },
  { id: 'SBI-FIP', name: 'State Bank of India', accountMasked: 'XXXXXX1190' }
];

function addDays(date, days) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
}

function parseJson(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function formatConsent(row) {
  if (!row) return null;
  return {
    id: row.id,
    unitId: row.unit_id,
    unitName: row.unit_name,
    fiu: {
      name: row.fiu_name,
      role: 'Financial Information User',
      product: 'TrustFlow Invoice Readiness'
    },
    purpose: row.purpose,
    dataTypes: parseJson(row.data_types, DEFAULT_DATA_TYPES),
    fips: parseJson(row.fips, DEFAULT_FIPS),
    expiryDate: row.expiry_date,
    status: row.status,
    createdAt: row.created_at,
    approvedAt: row.approved_at,
    rejectedAt: row.rejected_at,
    consentMode: 'ACCOUNT_AGGREGATOR',
    approvalChannel: 'BANK_APP',
    notes: [
      'You can revoke this consent from your bank app at any time.',
      'TrustFlow never sees your login credentials.',
      'Only the FIU named above can use the data, and only for the stated purpose.',
      'Data access ends automatically on the expiry date.'
    ]
  };
}

function listUnits(req, res) {
  try {
    const units = db.prepare(
      'SELECT id, name, gst_number as gstNumber, contact FROM units ORDER BY id ASC'
    ).all();
    return res.status(200).json({ success: true, units });
  } catch (error) {
    console.error('Error listing units for AA consent:', error);
    return res.status(500).json({ success: false, message: 'Failed to list units' });
  }
}

function createConsent(req, res) {
  try {
    const { unitId } = req.body || {};
    if (!unitId || String(unitId).trim() === '') {
      return res.status(400).json({ success: false, message: 'unitId is required' });
    }

    const unit = db.prepare('SELECT * FROM units WHERE id = ?').get(String(unitId).trim());
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Unit not found' });
    }

    const pending = db.prepare(
      "SELECT * FROM aa_consents WHERE unit_id = ? AND status = 'PENDING' ORDER BY created_at DESC LIMIT 1"
    ).get(unit.id);
    if (pending) {
      return res.status(200).json({
        success: true,
        message: 'Existing pending consent reused',
        consent: formatConsent(pending)
      });
    }

    const id = nextPrefixedId('aa_consents', 'AA');
    const expiryDate = addDays(new Date().toISOString(), 180);

    db.prepare(
      `INSERT INTO aa_consents (
        id, unit_id, unit_name, fiu_name, purpose, data_types, fips, expiry_date, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      unit.id,
      unit.name,
      'TrustFlow',
      DEFAULT_PURPOSE,
      JSON.stringify(DEFAULT_DATA_TYPES),
      JSON.stringify(DEFAULT_FIPS),
      expiryDate,
      'PENDING'
    );

    const consent = formatConsent(db.prepare('SELECT * FROM aa_consents WHERE id = ?').get(id));
    return res.status(201).json({ success: true, consent });
  } catch (error) {
    console.error('Error creating AA consent:', error);
    return res.status(500).json({ success: false, message: 'Failed to create AA consent' });
  }
}

function getConsent(req, res) {
  try {
    const consent = db.prepare('SELECT * FROM aa_consents WHERE id = ?').get(req.params.id);
    if (!consent) {
      return res.status(404).json({ success: false, message: 'Consent request not found' });
    }
    return res.status(200).json({ success: true, consent: formatConsent(consent) });
  } catch (error) {
    console.error('Error fetching AA consent:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch AA consent' });
  }
}

function getLatestConsentForUnit(req, res) {
  try {
    const consent = db.prepare(
      'SELECT * FROM aa_consents WHERE unit_id = ? ORDER BY created_at DESC LIMIT 1'
    ).get(req.params.unitId);
    if (!consent) {
      return res.status(404).json({ success: false, message: 'No consent found for this unit' });
    }
    return res.status(200).json({ success: true, consent: formatConsent(consent) });
  } catch (error) {
    console.error('Error fetching unit AA consent:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch unit consent' });
  }
}

function approveConsent(req, res) {
  try {
    const consent = db.prepare('SELECT * FROM aa_consents WHERE id = ?').get(req.params.id);
    if (!consent) {
      return res.status(404).json({ success: false, message: 'Consent request not found' });
    }
    if (consent.status === 'APPROVED') {
      return res.status(200).json({
        success: true,
        message: 'Consent already approved on the bank app',
        consent: formatConsent(consent)
      });
    }
    if (consent.status === 'REJECTED') {
      return res.status(400).json({ success: false, message: 'Rejected consent cannot be approved' });
    }

    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    db.prepare('UPDATE aa_consents SET status = ?, approved_at = ? WHERE id = ?').run(
      'APPROVED',
      now,
      consent.id
    );

    return res.status(200).json({
      success: true,
      message: 'Consent approved on bank app. Account Aggregator data can now flow into TrustScore.',
      consent: formatConsent(db.prepare('SELECT * FROM aa_consents WHERE id = ?').get(consent.id))
    });
  } catch (error) {
    console.error('Error approving AA consent:', error);
    return res.status(500).json({ success: false, message: 'Failed to approve consent' });
  }
}

function rejectConsent(req, res) {
  try {
    const consent = db.prepare('SELECT * FROM aa_consents WHERE id = ?').get(req.params.id);
    if (!consent) {
      return res.status(404).json({ success: false, message: 'Consent request not found' });
    }
    if (consent.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Consent is already ${consent.status.toLowerCase()}`
      });
    }

    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    db.prepare('UPDATE aa_consents SET status = ?, rejected_at = ? WHERE id = ?').run(
      'REJECTED',
      now,
      consent.id
    );

    return res.status(200).json({
      success: true,
      message: 'Consent denied. TrustFlow cannot pull bank data for this unit.',
      consent: formatConsent(db.prepare('SELECT * FROM aa_consents WHERE id = ?').get(consent.id))
    });
  } catch (error) {
    console.error('Error rejecting AA consent:', error);
    return res.status(500).json({ success: false, message: 'Failed to reject consent' });
  }
}

module.exports = {
  listUnits,
  createConsent,
  getConsent,
  getLatestConsentForUnit,
  approveConsent,
  rejectConsent
};
