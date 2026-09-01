const db = require('../db/database');
const { getGSTData } = require('../services/gstConnector');
const { getBankData } = require('../services/aaConnector');
const { calculateTrustScore } = require('../services/trustScore');

/**
 * Deterministically checks buyer verification for hackathon MVP demo.
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

/**
 * Idempotent Seed Function for TrustFlow Demo Data.
 */
function seed() {
  console.log('Seeding demo data...');

  const today = new Date('2026-09-01T00:00:00Z');
  const todayStr = today.toISOString().split('T')[0];

  const date35DaysAgo = new Date(today);
  date35DaysAgo.setUTCDate(date35DaysAgo.getUTCDate() - 35);
  const date35Str = date35DaysAgo.toISOString().split('T')[0];

  const date70DaysAgo = new Date(today);
  date70DaysAgo.setUTCDate(date70DaysAgo.getUTCDate() - 70);
  const date70Str = date70DaysAgo.toISOString().split('T')[0];

  const getDueDate = (invoiceDateStr) => {
    const d = new Date(invoiceDateStr + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + 45);
    return d.toISOString().split('T')[0];
  };

  const seedData = [
    {
      unit: { id: 'U001', name: 'Kumar Knitwear Works', gstNumber: '33ABCDE1234F1Z5', contact: '9876543210' },
      order: { id: 'ORD001', buyerName: 'ABC Exports', description: '5000 knitted T-shirts', amount: 482500, orderDate: todayStr },
      invoice: { id: 'INV001', invoiceDate: todayStr, dueDate: getDueDate(todayStr) }
    },
    {
      unit: { id: 'U002', name: 'Sri Lakshmi Knit Works', gstNumber: 'GST_MEDIUM_222', contact: '9876543211' },
      order: { id: 'ORD002', buyerName: 'XYZ Textiles', description: '3000 cotton garments', amount: 350000, orderDate: date35Str },
      invoice: { id: 'INV002', invoiceDate: date35Str, dueDate: getDueDate(date35Str) }
    },
    {
      unit: { id: 'U003', name: 'Murugan Garments Job Works', gstNumber: 'GST_AT_RISK_333', contact: '9876543212' },
      order: { id: 'ORD003', buyerName: 'Unknown Buyer', description: '2000 knitted garments', amount: 210000, orderDate: date70Str },
      invoice: { id: 'INV003', invoiceDate: date70Str, dueDate: getDueDate(date70Str) }
    }
  ];

  for (const item of seedData) {
    const { unit, order, invoice } = item;

    // 1. Create/reuse Unit
    const existingUnit = db.prepare('SELECT id FROM units WHERE id = ?').get(unit.id);
    if (existingUnit) {
      db.prepare('UPDATE units SET name = ?, gst_number = ?, contact = ? WHERE id = ?').run(
        unit.name, unit.gstNumber, unit.contact, unit.id
      );
    } else {
      db.prepare('INSERT INTO units (id, name, gst_number, contact) VALUES (?, ?, ?, ?)').run(
        unit.id, unit.name, unit.gstNumber, unit.contact
      );
    }

    // 2. Create/reuse Order
    const existingOrder = db.prepare('SELECT id FROM orders WHERE id = ?').get(order.id);
    if (existingOrder) {
      db.prepare(
        'UPDATE orders SET unit_id = ?, buyer_name = ?, description = ?, amount = ?, order_date = ?, delivery_status = ?, delivery_date = ? WHERE id = ?'
      ).run(unit.id, order.buyerName, order.description, order.amount, order.orderDate, 'DELIVERED', order.orderDate, order.id);
    } else {
      db.prepare(
        'INSERT INTO orders (id, unit_id, buyer_name, description, amount, order_date, delivery_status, delivery_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(order.id, unit.id, order.buyerName, order.description, order.amount, order.orderDate, 'DELIVERED', order.orderDate);
    }

    // 3. Create/reuse Invoice
    const existingInvoice = db.prepare('SELECT id FROM invoices WHERE id = ?').get(invoice.id);
    if (existingInvoice) {
      db.prepare(
        'UPDATE invoices SET order_id = ?, unit_id = ?, buyer_name = ?, amount = ?, invoice_date = ?, due_date = ?, delivered = 1, verified = 1, status = ? WHERE id = ?'
      ).run(order.id, unit.id, order.buyerName, order.amount, invoice.invoiceDate, invoice.dueDate, 'VERIFIED', invoice.id);
    } else {
      db.prepare(
        'INSERT INTO invoices (id, order_id, unit_id, buyer_name, amount, invoice_date, due_date, delivered, verified, status, trust_score) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, ?, NULL)'
      ).run(invoice.id, order.id, unit.id, order.buyerName, order.amount, invoice.invoiceDate, invoice.dueDate, 'VERIFIED');
    }

    // 4. Connectors data
    const gstData = getGSTData(unit.gstNumber);
    const bankData = getBankData(unit.id);
    const buyerVerified = isBuyerVerified(order.buyerName);

    const invObj = {
      id: invoice.id,
      unit_id: unit.id,
      buyer_name: order.buyerName,
      amount: order.amount,
      invoiceDate: invoice.invoiceDate,
      delivered: 1
    };

    // 5. Calculate TrustScore using existing engine
    const scoreResult = calculateTrustScore({
      invoice: invObj,
      gstData,
      bankData,
      buyerVerified
    });

    const totalScore = scoreResult.totalScore;
    const breakdown = scoreResult.breakdown;
    const newStatus = getStatusFromScore(totalScore);

    // 6. Save or update score in scores table
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
      const scoreId = `SCR_${invoice.id}`;
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

    // 7. Update invoice trust_score and status
    db.prepare('UPDATE invoices SET trust_score = ?, status = ? WHERE id = ?').run(
      totalScore,
      newStatus,
      invoice.id
    );

    console.log(`Seeded ${unit.id} (${unit.name}) -> Invoice ${invoice.id}: Score ${totalScore}, Status ${newStatus}`);
  }

  console.log('Seeding completed successfully.');
}

if (require.main === module) {
  seed();
}

module.exports = { seed };
