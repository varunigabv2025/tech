/**
 * TReDS packaging layer — maps a scored TrustFlow invoice into an
 * RXIL-style factoring submission. Mock format for the hackathon demo.
 * TrustFlow never holds funds; it only packages finance-ready receivables.
 */

const ADVANCE_RATE = 0.9;

function round2(num) {
  return Math.round((Number(num) + Number.EPSILON) * 100) / 100;
}

function daysBetween(fromDate, toDate) {
  const from = new Date(String(fromDate).includes('T') ? fromDate : `${fromDate}T00:00:00Z`);
  const to = new Date(String(toDate).includes('T') ? toDate : `${toDate}T00:00:00Z`);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return 0;
  return Math.max(0, Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)));
}

function daysOutstanding(invoiceDate, asOf = new Date()) {
  if (!invoiceDate) return 0;
  const inv = new Date(String(invoiceDate).includes('T') ? invoiceDate : `${invoiceDate}T00:00:00Z`);
  if (Number.isNaN(inv.getTime())) return 0;
  return Math.max(0, Math.floor((asOf.getTime() - inv.getTime()) / (1000 * 60 * 60 * 24)));
}

/**
 * Illustrative TReDS discount (financier yield), not a live RXIL quote.
 * Higher TrustScore → tighter discount.
 */
function getDiscountRate(trustScore) {
  const score = Number(trustScore) || 0;
  if (score >= 90) return 0.0175;
  if (score >= 70) return 0.0325;
  return 0.065;
}

function getFinancingTerms(amount, trustScore) {
  const invoiceAmount = round2(Number(amount) || 0);
  const discountRate = getDiscountRate(trustScore);
  const disbursedAmount = round2(invoiceAmount * ADVANCE_RATE);
  const holdbackAmount = round2(invoiceAmount - disbursedAmount);
  const discountFee = round2(invoiceAmount * discountRate);

  return {
    currency: 'INR',
    invoiceAmount,
    advanceRate: ADVANCE_RATE,
    advancePercent: 90,
    disbursedAmount,
    holdbackAmount,
    discountRate,
    discountPercent: round2(discountRate * 100),
    discountFee,
    unitReceivesNow: disbursedAmount,
    financierReceivesAtTerm: invoiceAmount,
    financierSpreadAtTerm: holdbackAmount
  };
}

/**
 * Build an RXIL-style TReDS factoring package from invoice + unit + score.
 */
function packageForRXIL({ invoice, unit, order, score, terms }) {
  const invoiceDate = invoice.invoice_date || invoice.invoiceDate;
  const dueDate = invoice.due_date || invoice.dueDate;
  const tenorDays = daysBetween(invoiceDate, dueDate);

  return {
    exchange: 'RXIL',
    platform: 'TReDS',
    instrumentType: 'FACTORING',
    recourse: 'WITHOUT_RECOURSE_TO_SELLER',
    submissionSource: 'TrustFlow',
    seller: {
      unitId: unit.id,
      name: unit.name,
      gstin: unit.gst_number || unit.gstNumber,
      contact: unit.contact || null,
      msmeCategory: 'JOB_WORK_KNITWEAR',
      cluster: 'Tirupur'
    },
    buyer: {
      name: invoice.buyer_name || invoice.buyerName,
      verified: Boolean(score?.breakdown?.buyerVerification?.value)
    },
    invoice: {
      number: invoice.id,
      orderId: invoice.order_id || invoice.orderId,
      date: invoiceDate,
      dueDate,
      tenorDays,
      amount: Number(invoice.amount),
      currency: 'INR',
      description: order ? order.description : null,
      delivered: Boolean(invoice.delivered),
      verified: Boolean(invoice.verified)
    },
    trustSignal: {
      engine: 'TrustFlow-RuleBased-v1',
      trustScore: score ? score.totalScore : Number(invoice.trust_score || invoice.trustScore),
      status: score ? score.status : invoice.status,
      totalPossible: 100,
      notABlackBox: true,
      breakdown: score ? score.breakdown : null
    },
    financingRequest: {
      requestedOn: new Date().toISOString().split('T')[0],
      ...terms
    },
    declarations: [
      'Goods/services against this invoice have been delivered.',
      'Invoice is generated from a verified job-work order.',
      'GST and Account Aggregator data pulled with unit consent.',
      'TrustFlow does not lend, hold funds, or take credit risk.'
    ]
  };
}

module.exports = {
  ADVANCE_RATE,
  round2,
  daysOutstanding,
  daysBetween,
  getDiscountRate,
  getFinancingTerms,
  packageForRXIL
};
