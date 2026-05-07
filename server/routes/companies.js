const express = require('express');
const jwt = require('jsonwebtoken');
const Company = require('../models/Company');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// POST /api/companies/register — Register a new company (pending admin approval)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, description, website, industry } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = await Company.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Company email already registered' });
    }

    const company = new Company({
      name,
      email,
      passwordHash: password,
      description: description || '',
      website: website || '',
      industry: industry || ''
    });
    await company.save();

    res.status(201).json({
      message: 'Registration submitted. Awaiting admin approval.',
      company: company.toJSON()
    });
    } catch (error) {
    console.error('Company register error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/companies/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const company = await Company.findOne({ email });
    
    if (!company) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await company.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!company.isApproved) {
      return res.status(403).json({
        error: 'Your registration is pending admin approval',
        status: company.status
      });
    }

    const token = jwt.sign(
      { companyId: company._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      company: company.toJSON()
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/companies/pending — List pending companies (admin only)
router.get('/pending', auth, requireRole('admin'), async (req, res) => {
  try {
    const companies = await Company.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.json({ companies });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pending companies' });
  }
});

// PUT /api/companies/:id/approve — Approve/reject company (admin only)
router.put('/:id/approve', auth, requireRole('admin'), async (req, res) => {
  try {
    const { approved } = req.body;
    const company = await Company.findById(req.params.id);
    
    if (!company) return res.status(404).json({ error: 'Company not found' });

    company.isApproved = approved;
    company.status = approved ? 'approved' : 'rejected';
    await company.save();

    res.json({
      message: `Company ${approved ? 'approved' : 'rejected'}`,
      company: company.toJSON()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update company status' });
  }
});

module.exports = router;
