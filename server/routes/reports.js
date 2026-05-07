const express = require('express');
const { auth, requireRole } = require('../middleware/auth');
const Report = require('../models/Report');
const Document = require('../models/Document');

const router = express.Router();

// POST /api/reports — Submit a report
router.post('/', auth, async (req, res) => {
  try {
    const { documentId, type, description } = req.body;

    if (!documentId || !type || !description) {
      return res.status(400).json({ error: 'Document ID, type, and description are required' });
    }

    const document = await Document.findById(documentId);
    if (!document) return res.status(404).json({ error: 'Document not found' });

    // Check for duplicate report
    const existing = await Report.findOne({
      documentId,
      reportedBy: req.user._id,
      status: { $in: ['pending', 'reviewed'] }
    });
    if (existing) return res.status(400).json({ error: 'You already have an active report for this document' });

    const report = new Report({
      documentId,
      reportedBy: req.user._id,
      type,
      description
    });
    await report.save();

    // Increment report count on document
    document.totalReports += 1;
    await document.save();

    res.status(201).json({ message: 'Report submitted', report });
  } catch (error) {
    console.error('Report error:', error);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

// GET /api/reports — Get all reports (admin only)
router.get('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    const reports = await Report.find({ status })
      .populate('documentId', 'title subject')
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ reports });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// PUT /api/reports/:id — Update report status (admin only)
router.put('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const report = await Report.findById(req.params.id);
    
    if (!report) return res.status(404).json({ error: 'Report not found' });

    report.status = status;
    if (adminNotes) report.adminNotes = adminNotes;
    await report.save();

    res.json({ message: 'Report updated', report });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update report' });
  }
});

module.exports = router;
