const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');
const subscriptionRoutes = require('./routes/subscriptions');
const bountyRoutes = require('./routes/bounties');
const companyRoutes = require('./routes/companies');
const tokenRoutes = require('./routes/tokens');
const reportRoutes = require('./routes/reports');
const adminRoutes = require('./routes/admin'); // Added for platform stats

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads (served securely through routes, not directly)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/bounties', bountyRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes); // Added for platform stats

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// JSON error handler for missing API routes (404)
app.use((req, res, next) => {
  res.status(404).json({ error: `Not Found: ${req.originalUrl}` });
});

// Global JSON Error Handler (Catches Multer size limits, etc.)
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message || err);
  
  if (err.code === 'LIMIT_FILE_SIZE' || err.name === 'MulterError') {
    return res.status(413).json({ error: 'File is too large. Maximum size allowed is 50MB.' });
  }

  res.status(err.status || 500).json({ 
    error: err.message || 'Internal Server Error' 
  });
});

// MongoDB Connection — uses in-memory DB if local MongoDB is unavailable
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/circula';

async function startServer() {
  const PORT = process.env.PORT || 5000;

  try {
    // Try connecting to local/configured MongoDB first
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 });
    console.log('✅ MongoDB connected (local)');
  } catch (err) {
    console.log('⚠️  Local MongoDB unavailable, starting in-memory database...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      await mongoose.connect(memUri);
      console.log('✅ MongoDB connected (in-memory)');
      console.log('   ⚠️  Data will be lost on server restart');
    } catch (memErr) {
      console.error('❌ Could not start any MongoDB instance:', memErr.message);
      process.exit(1);
    }
  }

  app.listen(PORT, () => {
    console.log(`🚀 Circula API running on port ${PORT}`);
  });
}

startServer();

module.exports = app;
