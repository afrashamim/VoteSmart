const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Environment variables
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/votesmart';

// MongoDB connection
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
  createDefaultAdmin(); // Create default admin user
}).catch((err) => console.error('MongoDB connection error:', err));

// Import models
const User = require('./models/user');

// Create default admin user
async function createDefaultAdmin() {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const admin = new User({
        username: 'admin',
        password: 'admin123',
        role: 'admin'
      });
      await admin.save();
      // Admin created silently
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'VoteSmart API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('API Documentation:');
  console.log('- POST /api/auth/admin/login - Admin login');
  console.log('- POST /api/auth/user/login - User login');
  console.log('- POST /api/auth/user/register - User registration');
  console.log('- GET /api/auth/me - Get current user info');
  console.log('- POST /api/nominees - Add nominee (Admin)');
  console.log('- DELETE /api/nominees/:id - Delete nominee (Admin)');
  console.log('- GET /api/nominees - Get nominees (User)');
  console.log('- POST /api/nominees/:id/vote - Vote for nominee (User)');
  console.log('- GET /api/user/vote-status - Get vote status (User)');
  console.log('- GET /api/admin/nominees - Get nominees with votes (Admin)');
  console.log('- GET /api/admin/statistics - Get voting statistics (Admin)');
});
