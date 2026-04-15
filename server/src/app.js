const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ✅ Allowed origins (safe + flexible)
const allowedOrigins = [
  'http://localhost:3000',
  process.env.CLIENT_URL, // your main Vercel domain
];

// Middleware
app.use(helmet());

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (Postman, mobile apps)
    if (!origin) return callback(null, true);

    // ✅ Allow localhost + exact match
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // ✅ Allow ALL Vercel preview URLs automatically
    if (origin.includes('vercel.app')) {
      return callback(null, true);
    }

    // ❌ Block everything else
    return callback(new Error('Not allowed by CORS: ' + origin));
  },
  credentials: true,
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', routes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Flipkart Clone API',
    version: '1.0.0',
    docs: '/api/health',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

// Error handler
app.use(errorHandler);

module.exports = app;