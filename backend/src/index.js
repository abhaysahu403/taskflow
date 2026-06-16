require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, initDB } = require('./config/database');
const { connectRedis } = require('./config/redis');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'TaskFlow API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/login', require('./routes/login'));
app.use('/api/products', require('./routes/products'));
app.use('/api/tasks', require('./routes/tasks'));

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// Start server
const start = async () => {
  try {
    await connectDB();
    await initDB();
    await connectRedis();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 TaskFlow API running on port ${PORT}`);
      console.log(`📡 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API base: http://localhost:${PORT}/api\n`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();
