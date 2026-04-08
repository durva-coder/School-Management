require('dotenv').config();
const express = require('express');
const { testConnection } = require('./database/config');
const schoolRoutes = require('./routes/schoolRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test database connection on startup
testConnection().catch((err) => {
  console.error('Failed to connect to database:', err.message);
  process.exit(1);
});

// Routes
app.use('/api', schoolRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'School Management API is running',
    endpoints: {
      addSchool: 'POST /api/addSchool',
      listSchools: 'GET /api/listSchools?latitude={lat}&longitude={lon}'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API Documentation:`);
  console.log(`  - POST /api/addSchool`);
  console.log(`  - GET  /api/listSchools?latitude={lat}&longitude={lon}`);
});

module.exports = app;
