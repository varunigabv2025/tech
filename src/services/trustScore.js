// TrustScore Engine Service

/**
 * Rounds a number to 2 decimal places safely.
 */
function roundToTwo(num) {
  const val = Number(num);
  if (isNaN(val)) return 0;
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates days outstanding score based on days:
 * 0–15 days   = 20
 * 16–30 days  = 18
 * 31–45 days  = 14
 * 46–60 days  = 8
 * 61–90 days  = 4
 * 91+ days    = 0
 */
function getDaysOutstandingScore(days) {
  const safeDays = Math.max(0, Math.floor(Number(days) || 0));
  if (safeDays <= 15) return 20;
  if (safeDays <= 30) return 18;
  if (safeDays <= 45) return 14;
  if (safeDays <= 60) return 8;
  if (safeDays <= 90) return 4;
  return 0;
}

/**
 * Calculates days outstanding between current date and invoiceDate.
 */
function calculateDaysOutstanding(invoiceDate) {
  if (!invoiceDate) return 0;
  const invDateStr = String(invoiceDate).trim();
  const invDate = new Date(invDateStr.includes('T') ? invDateStr : `${invDateStr}T00:00:00Z`);
  if (isNaN(invDate.getTime())) return 0;

  const now = new Date();
  const diffTime = now.getTime() - invDate.getTime();
  const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
}

/**
 * Main TrustScore calculation function.
 * @param {object} params
 * @param {object} params.invoice - Invoice object containing delivered, invoiceDate (or daysOutstanding)
 * @param {object} params.gstData - GST data containing filingConsistency
 * @param {object} params.bankData - AA bank data containing cashFlowStability
 * @param {boolean} params.buyerVerified - Flag indicating if buyer is verified
 * @returns {object} Explainable TrustScore result object
 */
function calculateTrustScore({ invoice = {}, gstData = {}, bankData = {}, buyerVerified = false } = {}) {
  // 1. GST Consistency (Max 20)
  const filingConsistency = Math.max(0, Math.min(100, Number(gstData?.filingConsistency) || 0));
  const gstScore = roundToTwo(Math.max(0, Math.min(20, (filingConsistency / 100) * 20)));

  // 2. Buyer Verification (Max 20)
  const isBuyerVerified = Boolean(buyerVerified);
  const buyerScore = isBuyerVerified ? 20 : 0;

  // 3. Delivery Confirmed (Max 15)
  const isDelivered = Boolean(invoice && (invoice.delivered === true || invoice.delivered === 1));
  const deliveryScore = isDelivered ? 15 : 0;

  // 4. Days Outstanding (Max 20)
  let daysOutstanding = 0;
  if (invoice && invoice.daysOutstanding !== undefined && invoice.daysOutstanding !== null) {
    daysOutstanding = Math.max(0, Math.floor(Number(invoice.daysOutstanding)));
  } else if (invoice && (invoice.invoiceDate || invoice.invoice_date)) {
    daysOutstanding = calculateDaysOutstanding(invoice.invoiceDate || invoice.invoice_date);
  }
  const daysOutstandingScore = getDaysOutstandingScore(daysOutstanding);

  // 5. Cash-Flow Stability (Max 25)
  const cashFlowStability = Math.max(0, Math.min(100, Number(bankData?.cashFlowStability) || 0));
  const cashFlowScore = roundToTwo(Math.max(0, Math.min(25, (cashFlowStability / 100) * 25)));

  // Total Score Calculation (Max 100)
  const rawTotal = gstScore + buyerScore + deliveryScore + daysOutstandingScore + cashFlowScore;
  const totalScore = roundToTwo(Math.max(0, Math.min(100, rawTotal)));

  return {
    totalScore,
    totalPossible: 100,
    breakdown: {
      gstConsistency: {
        score: gstScore,
        max: 20,
        value: filingConsistency,
        explanation: `GST filing consistency is ${filingConsistency}%, contributing ${gstScore} out of 20 points.`
      },
      buyerVerification: {
        score: buyerScore,
        max: 20,
        value: isBuyerVerified,
        explanation: isBuyerVerified
          ? 'Buyer verification was successful, contributing 20 out of 20 points.'
          : 'Buyer verification was not confirmed, contributing 0 out of 20 points.'
      },
      deliveryConfirmed: {
        score: deliveryScore,
        max: 15,
        value: isDelivered,
        explanation: isDelivered
          ? 'Delivery has been confirmed, contributing 15 out of 15 points.'
          : 'Delivery has not been confirmed, contributing 0 out of 15 points.'
      },
      daysOutstanding: {
        score: daysOutstandingScore,
        max: 20,
        value: daysOutstanding,
        explanation: `The invoice has been outstanding for ${daysOutstanding} days, contributing ${daysOutstandingScore} out of 20 points.`
      },
      cashFlowStability: {
        score: cashFlowScore,
        max: 25,
        value: cashFlowStability,
        explanation: `Cash-flow stability is ${cashFlowStability}%, contributing ${cashFlowScore} out of 25 points.`
      }
    }
  };
}

module.exports = {
  calculateTrustScore
};
