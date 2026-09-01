const db = require('../db/database');
const { getGSTData } = require('../services/gstConnector');
const { getBankData } = require('../services/aaConnector');
const { calculateTrustScore } = require('../services/trustScore');

/**
 * Deterministically checks buyer verification for hackathon MVP demo.
 * "ABC Exports" -> true
 * "XYZ Textiles" -> true
 * Any other buyer -> false
 */
function isBuyerVerified(buyerName) {
  if (!buyerName) return false;
  const name = String(buyerName).trim().toUpperCase();
  return name === 'ABC EXPORTS' || name === 'XYZ TEXTILES';
}

/**
 * Maps final score to status string:
 * 90–100   : FINANCE_READY
 * 70–89.99 : REVIEW
 * 0–69.99  : AT_RISK
 */
function getStatusFromScore(score) {
  if (score >= 90) return 'FINANCE_READY';
  if (score >= 70) return 'REVIEW';
  return 'AT_RISK';
}

// GET /api/invoices/:id/score
const calculateScore = (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find invoice by ID
    const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // 2. Check invoice.verified is true / 1
    if (!(invoice.verified === 1 || invoice.verified === true)) {
      return res.status(400).json({
        success: false,
        message: 'Invoice must be verified before calculating TrustScore'
      });
    }

    // 3. Find associated unit
    const unit = db.prepare('SELECT * FROM units WHERE id = ?').get(invoice.unit_id);
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Associated unit not found'
      });
    }

    // 4. Get GST Data
    const gstData = getGSTData(unit.gst_number);

    // 5. Get Bank Data
    const bankData = getBankData(unit.id);

    // 6. Determine buyer verification
    const buyerVerified = isBuyerVerified(invoice.buyer_name);

    // 7. Calculate TrustScore
    const scoreResult = calculateTrustScore({
      invoice,
      gstData,
      bankData,
      buyerVerified
    });

    const totalScore = scoreResult.totalScore;
    const breakdown = scoreResult.breakdown;
    const newStatus = getStatusFromScore(totalScore);

    // 8. Save or update score in scores table
    const existingScore = db.prepare('SELECT id FROM scores WHERE invoice_id = ?').get(invoice.id);

    if (existingScore) {
      db.prepare(`
        UPDATE scores SET
          total_score = ?,
          gst_consistency_score = ?,
          buyer_verification_score = ?,
          delivery_confirmed_score = ?,
          days_outstanding_score = ?,
          cash_flow_stability_score = ?
        WHERE invoice_id = ?
      `).run(
        totalScore,
        breakdown.gstConsistency.score,
        breakdown.buyerVerification.score,
        breakdown.deliveryConfirmed.score,
        breakdown.daysOutstanding.score,
        breakdown.cashFlowStability.score,
        invoice.id
      );
    } else {
      const countRow = db.prepare('SELECT COUNT(*) as count FROM scores').get();
      const scoreId = `SCR${String((countRow ? countRow.count : 0) + 1).padStart(3, '0')}`;

      db.prepare(`
        INSERT INTO scores (
          id, invoice_id, total_score, gst_consistency_score,
          buyer_verification_score, delivery_confirmed_score,
          days_outstanding_score, cash_flow_stability_score
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        scoreId,
        invoice.id,
        totalScore,
        breakdown.gstConsistency.score,
        breakdown.buyerVerification.score,
        breakdown.deliveryConfirmed.score,
        breakdown.daysOutstanding.score,
        breakdown.cashFlowStability.score
      );
    }

    // 9 & 10. Update invoices table: trust_score & status
    db.prepare('UPDATE invoices SET trust_score = ?, status = ? WHERE id = ?').run(
      totalScore,
      newStatus,
      invoice.id
    );

    // Return response
    return res.status(200).json({
      success: true,
      invoiceId: invoice.id,
      trustScore: totalScore,
      status: newStatus,
      breakdown: breakdown,
      totalPossible: 100
    });
  } catch (error) {
    console.error('Error calculating TrustScore for invoice:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate TrustScore'
    });
  }
};

module.exports = {
  calculateScore
};
