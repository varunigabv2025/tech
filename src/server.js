const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const db = require('./db/database');

const unitRoutes = require('./routes/unitRoutes');
const orderRoutes = require('./routes/orderRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const authRoutes = require('./routes/authRoutes');
const registerPerson3 = require('./person3Register');

const app = express();
const PORT = process.env.PORT || 5000;

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Prevent breaking Next.js hot-reloading & dev scripts
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// Cookie Parser Middleware
app.use(cookieParser());

// CORS Configuration with Credentials support
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.CLIENT_URL,
  process.env.FINANCIER_URL
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Allow dev origins dynamically
    },
    credentials: true
  })
);

// Body parser
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/invoices', invoiceRoutes);
registerPerson3(app);

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

