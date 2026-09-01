const db = require('../db/database');

// POST /api/units
const createUnit = (req, res) => {
  try {
    const { name, gstNumber, contact } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Name is required and must not be empty'
      });
    }

    if (!gstNumber || typeof gstNumber !== 'string' || gstNumber.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'gstNumber is required and must not be empty'
      });
    }

    // Generate unique unit ID (e.g. U001)
    const countRow = db.prepare('SELECT COUNT(*) as count FROM units').get();
    const nextNum = (countRow ? countRow.count : 0) + 1;
    const id = `U${String(nextNum).padStart(3, '0')}`;

    const insertStmt = db.prepare(
      'INSERT INTO units (id, name, gst_number, contact) VALUES (?, ?, ?, ?)'
    );
    insertStmt.run(id, name.trim(), gstNumber.trim(), contact && typeof contact === 'string' ? contact.trim() : (contact || null));

    const unitRow = db.prepare('SELECT * FROM units WHERE id = ?').get(id);

    return res.status(201).json({
      success: true,
      unit: {
        id: unitRow.id,
        name: unitRow.name,
        gstNumber: unitRow.gst_number,
        contact: unitRow.contact
      }
    });
  } catch (error) {
    console.error('Error creating unit:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create unit'
    });
  }
};

module.exports = {
  createUnit
};
