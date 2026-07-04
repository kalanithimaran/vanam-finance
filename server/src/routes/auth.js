const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

router.post('/register', async (req, res) => {
  const { name, phone, pin } = req.body;
  try {
    const existing = await prisma.household.findUnique({ where: { phone } });
    if (existing) {
      return res.status(400).json({ error: 'Phone number already registered' });
    }
    const pinHash = await bcrypt.hash(pin, 10);
    const household = await prisma.household.create({
      data: { name, phone, pin_hash: pinHash }
    });
    // Add default sources and plans...
    res.json({ message: 'Registered successfully', householdId: household.id });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { phone, pin } = req.body;
  try {
    const household = await prisma.household.findUnique({ where: { phone } });
    if (!household) {
      return res.status(400).json({ error: 'Invalid phone or PIN' });
    }
    const isValid = await bcrypt.compare(pin, household.pin_hash);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid phone or PIN' });
    }
    const token = jwt.sign({ householdId: household.id }, process.env.JWT_SECRET || 'your_jwt_secret_key');
    
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('token', token, { 
      httpOnly: true, 
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax'
    });
    
    res.json({ token, household: { id: household.id, name: household.name } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

module.exports = router;
