const db = require('../db/database');

// Helper to format order database row to response object
const formatOrderRow = (row) => ({
  id: row.id,
  unitId: row.unit_id,
  buyerName: row.buyer_name,
  description: row.description,
  amount: row.amount,
  orderDate: row.order_date,
  deliveryStatus: row.delivery_status,
  deliveryDate: row.delivery_date,
  createdAt: row.created_at
});

// POST /api/orders
const createOrder = (req, res) => {
  try {
    const { unitId, buyerName, description, amount, orderDate } = req.body;

    if (!unitId || typeof unitId !== 'string' || unitId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'unitId is required and must not be empty'
      });
    }

    // Validate unitId exists
    const unitExists = db.prepare('SELECT id FROM units WHERE id = ?').get(unitId.trim());
    if (!unitExists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid unitId: Unit does not exist'
      });
    }

    if (!buyerName || typeof buyerName !== 'string' || buyerName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'buyerName is required and must not be empty'
      });
    }

    if (!description || typeof description !== 'string' || description.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'description is required and must not be empty'
      });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'amount must be a number greater than 0'
      });
    }

    if (!orderDate || typeof orderDate !== 'string' || orderDate.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'orderDate is required'
      });
    }

    // Generate unique order ID (e.g. ORD001)
    const countRow = db.prepare('SELECT COUNT(*) as count FROM orders').get();
    const nextNum = (countRow ? countRow.count : 0) + 1;
    const id = `ORD${String(nextNum).padStart(3, '0')}`;

    const insertStmt = db.prepare(
      'INSERT INTO orders (id, unit_id, buyer_name, description, amount, order_date, delivery_status, delivery_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    insertStmt.run(
      id,
      unitId.trim(),
      buyerName.trim(),
      description.trim(),
      numericAmount,
      orderDate.trim(),
      'PENDING',
      null
    );

    const orderRow = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);

    return res.status(201).json({
      success: true,
      order: formatOrderRow(orderRow)
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
};

// POST /api/orders/:id/deliver
const deliverOrder = (req, res) => {
  try {
    const { id } = req.params;

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.delivery_status === 'DELIVERED') {
      return res.status(400).json({
        success: false,
        message: 'Order has already been delivered'
      });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    db.prepare('UPDATE orders SET delivery_status = ?, delivery_date = ? WHERE id = ?').run(
      'DELIVERED',
      todayStr,
      id
    );

    const updatedOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);

    return res.status(200).json({
      success: true,
      order: formatOrderRow(updatedOrder)
    });
  } catch (error) {
    console.error('Error delivering order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update order delivery status'
    });
  }
};

// GET /api/orders
const getOrders = (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
    const orders = rows.map(formatOrderRow);

    return res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};

module.exports = {
  createOrder,
  deliverOrder,
  getOrders
};
