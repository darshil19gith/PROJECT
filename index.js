const express = require('express');
const router = express.Router();
const path = require('path');

// Page 1: Landing Page
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views', 'index.html'));
});

// Page 2: Login & Register / Onboarding Page
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../views', 'login.html'));
});

router.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../views', 'login.html'));
});

// Page 3 Placeholder: Dashboard Page (Farmer, Buyer, Service Provider)
router.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../views', 'dashboard.html'));
});

// API Endpoint: Node.js Login Handler
router.post('/api/login', (req, res) => {
  const { role, identifier, password } = req.body;
  res.json({
    success: true,
    message: 'Logged in successfully',
    role: role || 'farmer',
    redirectUrl: `/dashboard?role=${role || 'farmer'}`
  });
});

// API Endpoint: Node.js Registration & Onboarding Handler
router.post('/api/register', (req, res) => {
  const { role, name, phone, kycStatus } = req.body;
  res.json({
    success: true,
    message: 'Onboarding completed',
    user: { name, role, kycStatus: kycStatus || 'pending' },
    redirectUrl: `/dashboard?role=${role || 'farmer'}`
  });
});

module.exports = router;
