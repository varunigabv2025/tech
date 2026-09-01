const db = require('../db/database');
const { getGSTData } = require('../services/gstConnector');
const { getBankData } = require('../services/aaConnector');

const formatInvoiceRow = (row) => ({
  id: row.id,
  orderId: row.order_id,
  unitId: row.unit_id,
  buyerName: row.buyer_name,
  amount: row.amount,
  invoiceDate: row.invoice_date,
  dueDate: row.due_date,
  delivered: Boolean(row.delivered),
  verified: Boolean(row.verified),
  status: row.status,
  trustScore: row.trust_score !== null && row.trust_score !== undefined ? row.trust_score : null
});

// POST /api/invoices
const createInvoice = (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId || typeof orderId !== 'string' || orderId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'orderId is required'
      });
    }

    const trimmedOrderId = orderId.trim();

    // 1. Find the order in SQLite
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(trimmedOrderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // 2. Check delivery_status
    if (order.delivery_status !== 'DELIVERED') {
      return res.status(400).json({
        success: false,
        message: 'Order has not been delivered yet'
      });
    }

    // 3. Prevent duplicate invoices for the same order
    const existingInvoice = db.prepare('SELECT id FROM invoices WHERE order_id = ?').get(trimmedOrderId);
    if (existingInvoice) {
      return res.status(400).json({
        success: false,
        message: 'An invoice already exists for this order'
      });
    }

    // 4. Generate unique invoice ID (e.g. INV001)
    const countRow = db.prepare('SELECT COUNT(*) as count FROM invoices').get();
    const nextNum = (countRow ? countRow.count : 0) + 1;
    const id = `INV${String(nextNum).padStart(3, '0')}`;

    // 5. Dates calculation
    const today = new Date();
    const invoiceDate = today.toISOString().split('T')[0];

    const dueDateObj = new Date(invoiceDate + 'T00:00:00Z');
    dueDateObj.setUTCDate(dueDateObj.getUTCDate() + 45);
    const dueDate = dueDateObj.toISOString().split('T')[0];

    // 6. Insert into SQLite
    const insertStmt = db.prepare(
      `INSERT INTO invoices (
        id, order_id, unit_id, buyer_name, amount, 
        invoice_date, due_date, delivered, verified, status, trust_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    insertStmt.run(
      id,
      trimmedOrderId,
      order.unit_id,
      order.buyer_name,
      order.amount,
      invoiceDate,
      dueDate,
      1, // delivered
      0, // verified
      'PENDING_VERIFICATION',
      null // trust_score
    );

    const invoiceRow = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);

    return res.status(201).json({
      success: true,
      invoice: formatInvoiceRow(invoiceRow)
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create invoice'
    });
  }
};

// GET /api/invoices
const getInvoices = (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM invoices ORDER BY created_at DESC').all();
    const invoices = rows.map(formatInvoiceRow);

    return res.status(200).json({
      success: true,
      invoices
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch invoices'
    });
  }
};

// GET /api/invoices/:id
const getInvoiceById = (req, res) => {
  try {
    const { id } = req.params;
    const invoiceRow = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);

    if (!invoiceRow) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    return res.status(200).json({
      success: true,
      invoice: formatInvoiceRow(invoiceRow)
    });
  } catch (error) {
    console.error('Error fetching invoice by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch invoice'
    });
  }
};

// POST /api/invoices/:id/verify
const verifyInvoice = (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find invoice
    const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // 2. Find unit
    const unit = db.prepare('SELECT * FROM units WHERE id = ?').get(invoice.unit_id);
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Associated unit not found'
      });
    }

    // 3. Connectors data
    const gstData = getGSTData(unit.gst_number);
    const bankData = getBankData(unit.id);

    // 4. Verification rules
    const isGstValid = Boolean(gstData && gstData.gstActive === true);
    const isDelivered = Boolean(invoice.delivered === 1 || invoice.delivered === true);
    const isBankValid = Boolean(bankData);

    const isVerified = isGstValid && isDelivered && isBankValid;

    if (isVerified) {
      db.prepare('UPDATE invoices SET verified = 1, status = ? WHERE id = ?').run('VERIFIED', id);
      const updatedInvoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);

      return res.status(200).json({
        success: true,
        message: 'Invoice verified successfully',
        invoice: formatInvoiceRow(updatedInvoice),
        verification: {
          gst: gstData,
          accountAggregator: bankData
        }
      });
    } else {
      db.prepare('UPDATE invoices SET verified = 0, status = ? WHERE id = ?').run('VERIFICATION_FAILED', id);
      const updatedInvoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);

      return res.status(400).json({
        success: false,
        message: 'Invoice verification failed',
        invoice: formatInvoiceRow(updatedInvoice),
        verification: {
          gst: gstData,
          accountAggregator: bankData
        }
      });
    }
  } catch (error) {
    console.error('Error verifying invoice:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify invoice'
    });
  }
};

module.exports = {
  createInvoice,
  getInvoices,
  getInvoiceById,
  verifyInvoice
};
