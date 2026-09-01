const express = require('express');
const cors = require('cors');
const db = require('./db/database');

const unitRoutes = require('./routes/unitRoutes');
const orderRoutes = require('./routes/orderRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/units', unitRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/invoices', invoiceRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'TrustFlow backend is running'
  });
});

app.listen(PORT, () => {
  console.log(`TrustFlow backend server running on port ${PORT}`);
});

module.exports = app;
