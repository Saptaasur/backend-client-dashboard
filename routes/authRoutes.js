const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const ClientAuth = require('../models/ClientAuth');
const ClientDetails = require('../models/ClientDetails');

const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// ✅ Register a new user and create ClientDetails
router.post('/register', async (req, res) => {
  const { email, password, name, companySize, preferredLanguage } = req.body;

  try {
    // Input validation
    if (!email || !password || !name || !companySize || !preferredLanguage) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await ClientAuth.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new ClientAuth user
    const newClient = new ClientAuth({ email, password: hashedPassword });
    await newClient.save();

    // ✅ Create associated ClientDetails
    const clientDetails = new ClientDetails({
      userId: newClient._id, // Link the userId to ClientAuth
      name,
      companySize,
      preferredLanguage,
      projects: [] // Initialize with an empty projects array
    });
    await clientDetails.save();

    // Generate JWT token
    const accessToken = generateAccessToken(newClient._id);

    res.json({
      message: 'Registration successful!',
      accessToken,
      user: {
        id: newClient._id,
        email: newClient.email,
        name
      }
    });

  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// ✅ Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const client = await ClientAuth.findOne({ email });
    if (!client) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, client.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const accessToken = generateAccessToken(client._id);

    // Retrieve client details
    const clientDetails = await ClientDetails.findOne({ userId: client._id });

    res.json({
      message: 'Login successful!',
      accessToken,
      user: {
        id: client._id,
        email: client.email,
        name: clientDetails?.name || '',
        companySize: clientDetails?.companySize || '',
        preferredLanguage: clientDetails?.preferredLanguage || '',
        projects: clientDetails?.projects || []
      }
    });

  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

module.exports = router;
