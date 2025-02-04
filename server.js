const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const clientRoutes = require('./routes/clientRoutes');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'https://frontend-client-dashboard.vercel.app', // Replace with your actual frontend URL
}));

app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Register Routes
app.use('/api', clientRoutes);  // Ensure this line is correct to handle '/api/client-info'
app.use('/auth', authRoutes);  // Ensure '/auth' routes are registered
app.use('/api', taskRoutes);

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
