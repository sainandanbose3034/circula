const express = require('express');
const path = require('path');
const fs = require('fs');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const Bounty = require('../models/Bounty');
const Company = require('../models/Company');
const Document = require('../models/Document');
const User = require('../models/User');
const Revenue = require('../models/Revenue');
const TokenService = require('../services/tokenService');
const ConfidenceScorer = require('../services/confidenceScorer');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Platform commission rate (35%)
const COMMISSION_RATE = 0.35;

// Company auth middleware
const companyAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Authentication required' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const company = await Company.findById(decoded.companyId);
    if (!company) return res.status(401).json({ error: 'Company not found' });
    if (!company.isApproved) return res.status(403).json({ error: 'Company not yet approved by admin' });

    req.company = company;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// GET /api/bounties — List open bounties (for users)
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, subject, status = 'open' } = req.query;
    const query = { status };

    if (subject) query.subject = new RegExp(subject, 'i');

    const bounties = await Bounty.find(query)
      .populate('companyId', 'name industry')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    // Add post-commission userReward to each bounty
    const bountiesWithUserReward = bounties.map(b => ({
      ...b,
      userReward: Math.round(b.reward * (1 - COMMISSION_RATE))
    }));

    const total = await Bounty.countDocuments(query);

    res.json({
      bounties: bountiesWithUserReward,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bounties' });
  }
});

// GET /api/bounties/company/me — List all bounties belonging to the logged-in company
router.get('/company/me', companyAuth, async (req, res) => {
  try {
    const bounties = await Bounty.find({ companyId: req.company._id })
      .populate({
        path: 'submissions.userId',
        select: 'name email reputation'
      })
      .populate({
        path: 'submissions.documentId',
        select: 'title description confidenceScore createdAt originalFileName fileType'
      })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ bounties });
  } catch (error) {
    console.error('Company bounties error:', error);
    res.status(500).json({ error: 'Failed to fetch company bounties' });
  }
});

// GET /api/bounties/:id — Get single bounty
router.get('/:id', auth, async (req, res) => {
  try {
    const bounty = await Bounty.findById(req.params.id)
      .populate('companyId', 'name industry website')
      .populate('submissions.userId', 'name email')
      .lean();

    if (!bounty) return res.status(404).json({ error: 'Bounty not found' });

    // Add post-commission userReward
    bounty.userReward = Math.round(bounty.reward * (1 - COMMISSION_RATE));

    res.json({ bounty });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bounty' });
  }
});

// POST /api/bounties — Create bounty (company only)
router.post('/', companyAuth, async (req, res) => {
  try {
    const { title, description, requirements, subject, reward, rewardType, deadline, maxSubmissions } = req.body;

    if (!title || !description || !subject || !reward || !deadline) {
      return res.status(400).json({ error: 'Title, description, subject, reward, and deadline are required' });
    }

    const bounty = new Bounty({
      companyId: req.company._id,
      title,
      description,
      requirements: requirements || '',
      subject,
      reward,
      rewardType: rewardType || 'currency',
      deadline: new Date(deadline),
      maxSubmissions: maxSubmissions || 10
    });

    await bounty.save();

    req.company.totalBounties += 1;
    await req.company.save();

    res.status(201).json({ message: 'Bounty created', bounty });
  } catch (error) {
    console.error('Create bounty error:', error);
    res.status(500).json({ error: 'Failed to create bounty' });
  }
});

// POST /api/bounties/:id/submit — Upload a document directly for a bounty
// Document goes to the company ONLY (not the public database)
router.post('/:id/submit', auth, upload.array('files', 20), async (req, res) => {
  try {
    const bounty = await Bounty.findById(req.params.id);

    if (!bounty) return res.status(404).json({ error: 'Bounty not found' });
    if (bounty.status !== 'open') return res.status(400).json({ error: 'Bounty is no longer open' });
    if (new Date() > bounty.deadline) return res.status(400).json({ error: 'Bounty deadline has passed' });

    // Check if user already submitted
    const alreadySubmitted = bounty.submissions.some(
      s => s.userId.toString() === req.user._id.toString()
    );
    if (alreadySubmitted) return res.status(400).json({ error: 'You already submitted to this bounty' });

    // Require files
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const { title, description, subject } = req.body;
    if (!title || !subject) {
      return res.status(400).json({ error: 'Title and subject are required' });
    }

    // DUPLICATE CHECK: Ensure this document doesn't already exist in the public database
    const existingDoc = await Document.findOne({
      title: { $regex: new RegExp(`^${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      subject: { $regex: new RegExp(`^${subject.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      isBountySubmission: { $ne: true }
    });

    if (existingDoc) {
      // Clean up uploaded files
      req.files.forEach(f => { try { fs.unlinkSync(f.path); } catch {} });
      return res.status(409).json({
        error: 'A document with this title and subject already exists in the database. Bounty submissions must be unique documents not already present in Circula.'
      });
    }

    // Use the first file as the submission document
    const file = req.files[0];
    const filePath = file.path;

    // Run confidence scoring
    const scoreResult = await ConfidenceScorer.scoreDocument(filePath, {
      title, description: description || '', subject, tags: []
    });

    // Create document marked as bounty submission (NOT public)
    const document = new Document({
      title,
      description: description || '',
      subject,
      tags: [],
      uploadedBy: req.user._id,
      filePath,
      originalFileName: file.originalname,
      fileType: path.extname(file.originalname).toLowerCase().replace('.', '') || 'pdf',
      pageCount: 1,
      fileSize: fs.statSync(filePath).size,
      isPremium: false,
      confidenceScore: scoreResult.totalScore,
      verificationStatus: 'pending',
      circuBitsAwarded: 0,
      isBountySubmission: true,
      bountyId: bounty._id
    });

    await document.save();

    // Clean up extra files if multiple were uploaded
    req.files.slice(1).forEach(f => { try { fs.unlinkSync(f.path); } catch {} });

    // Add submission to bounty
    bounty.submissions.push({
      userId: req.user._id,
      documentId: document._id,
      status: 'pending'
    });

    if (bounty.submissions.length >= bounty.maxSubmissions) {
      bounty.status = 'in_progress';
    }

    await bounty.save();

    res.json({
      message: 'Submission uploaded successfully! Your document has been sent to the company for review.',
      bounty,
      document: {
        _id: document._id,
        title: document.title,
        confidenceScore: document.confidenceScore
      }
    });
  } catch (error) {
    console.error('Bounty submission error:', error);
    res.status(500).json({ error: 'Failed to submit to bounty' });
  }
});

// PUT /api/bounties/:id/review — Review a submission (company only)
router.put('/:id/review', companyAuth, async (req, res) => {
  try {
    const { submissionIndex, status, feedback } = req.body;
    const bounty = await Bounty.findById(req.params.id);

    if (!bounty) return res.status(404).json({ error: 'Bounty not found' });
    if (bounty.companyId.toString() !== req.company._id.toString()) {
      return res.status(403).json({ error: 'Not your bounty' });
    }

    if (!bounty.submissions[submissionIndex]) {
      return res.status(400).json({ error: 'Invalid submission index' });
    }

    bounty.submissions[submissionIndex].status = status;
    bounty.submissions[submissionIndex].feedback = feedback || '';

    // IF ACCEPTED: HANDLE REWARD DISTRIBUTION
    if (status === 'accepted') {
      const submission = bounty.submissions[submissionIndex];
      
      // MONETARY FIAT PAYOUT (₹)
      const totalReward = bounty.reward;
      const platformCommission = totalReward * 0.35; // 35% hardcoded commission
      const userPayout = totalReward - platformCommission; // 65% for the hunter

      // 1. Credit the User
      await User.findByIdAndUpdate(submission.userId, { 
        $inc: { fiatBalance: userPayout } 
      });

      // 2. Log Platform Revenue (Commission)
      await Revenue.create({
        type: 'bounty_commission',
        amount: platformCommission,
        currency: 'INR',
        sourceId: bounty._id,
        sourceModel: 'Bounty',
        metadata: {
          totalBounty: totalReward,
          userPayout: userPayout,
          userId: submission.userId
        }
      });

      bounty.status = 'fulfilled';
    }

    await bounty.save();
    res.json({ message: 'Submission reviewed', bounty });
  } catch (error) {
    res.status(500).json({ error: 'Failed to review submission' });
  }
});

// DELETE /api/bounties/:id — Delete a bounty (company only)
router.delete('/:id', companyAuth, async (req, res) => {
  try {
    const bounty = await Bounty.findById(req.params.id);
    if (!bounty) return res.status(404).json({ error: 'Bounty not found' });
    
    if (bounty.companyId.toString() !== req.company._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this bounty' });
    }

    await Bounty.findByIdAndDelete(req.params.id);
    
    // Decrement company's total bounties
    if (req.company.totalBounties > 0) {
      req.company.totalBounties -= 1;
      await req.company.save();
    }

    res.json({ message: 'Bounty deleted successfully' });
  } catch (error) {
    console.error('Delete bounty error:', error);
    res.status(500).json({ error: 'Failed to delete bounty' });
  }
});

module.exports = router;
