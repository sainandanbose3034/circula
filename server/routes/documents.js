const express = require('express');
const path = require('path');
const fs = require('fs');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const sharp = require('sharp');
const upload = require('../middleware/upload');
const { auth, requirePremium } = require('../middleware/auth');
const Document = require('../models/Document');
const ConfidenceScorer = require('../services/confidenceScorer');
const TokenService = require('../services/tokenService');

const router = express.Router();

/**
 * Convert images to a single PDF
 */
async function imagesToPdf(imagePaths) {
  const pdfDoc = await PDFDocument.create();

  for (const imgPath of imagePaths) {
    const imgBuffer = fs.readFileSync(imgPath);
    const ext = path.extname(imgPath).toLowerCase();

    let image;
    if (ext === '.png' || ext === '.webp') {
      // Convert to PNG if webp
      const pngBuffer = ext === '.webp'
        ? await sharp(imgBuffer).png().toBuffer()
        : imgBuffer;
      image = await pdfDoc.embedPng(pngBuffer);
    } else {
      // JPEG/JPG/GIF → convert to JPEG
      const jpgBuffer = await sharp(imgBuffer).jpeg().toBuffer();
      image = await pdfDoc.embedJpg(jpgBuffer);
    }

    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  }

  return pdfDoc;
}

// POST /api/documents/upload — Upload a document (single file or multiple images)
router.post('/upload', auth, upload.array('files', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const { title, description, subject, tags, isPremium } = req.body;

    if (!title || !subject) {
      return res.status(400).json({ error: 'Title and subject are required' });
    }

    let finalPdfPath;
    let originalFileName = req.files[0].originalname;
    let fileType = 'pdf';
    let pageCount = 1;

    const isImageUpload = req.files.every(f =>
      f.mimetype.startsWith('image/')
    );

    if (isImageUpload && req.files.length >= 1) {
      // Convert images to PDF
      const imagePaths = req.files.map(f => f.path);
      const pdfDoc = await imagesToPdf(imagePaths);
      const pdfBytes = await pdfDoc.save();

      finalPdfPath = path.join(__dirname, '..', 'uploads', `converted-${Date.now()}.pdf`);
      fs.writeFileSync(finalPdfPath, pdfBytes);

      pageCount = pdfDoc.getPageCount();
      fileType = 'image';
      originalFileName = req.files.length > 1
        ? `${req.files.length} images combined`
        : originalFileName;

      // Clean up original image files
      imagePaths.forEach(p => {
        try { fs.unlinkSync(p); } catch {}
      });
    } else if (req.files.length === 1) {
      const file = req.files[0];
      const ext = path.extname(file.originalname).toLowerCase();

      if (ext === '.pdf') {
        finalPdfPath = file.path;
        try {
          const pdfDoc = await PDFDocument.load(fs.readFileSync(file.path), { ignoreEncryption: true });
          pageCount = pdfDoc.getPageCount();
        } catch { pageCount = 1; }
      } else if (ext === '.docx' || ext === '.doc') {
        // For now, store as-is (conversion would require libreoffice/docx library)
        finalPdfPath = file.path;
        fileType = 'docx';
      } else if (ext === '.pptx' || ext === '.ppt') {
        finalPdfPath = file.path;
        fileType = 'pptx';
      } else {
        finalPdfPath = file.path;
      }
    } else {
      return res.status(400).json({ error: 'Multiple files must all be images for combining into PDF' });
    }

    const parsedTags = tags ? (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags) : [];

    // Run confidence scoring
    const scoreResult = await ConfidenceScorer.scoreDocument(finalPdfPath, {
      title, description, subject, tags: parsedTags
    });

    const circuBitsReward = ConfidenceScorer.calculateReward(scoreResult.totalScore);
    const verificationStatus = scoreResult.totalScore >= 40 ? 'verified' : 'pending';

    const document = new Document({
      title,
      description: description || '',
      subject,
      tags: parsedTags,
      uploadedBy: req.user._id,
      filePath: finalPdfPath,
      originalFileName,
      fileType,
      pageCount,
      fileSize: fs.statSync(finalPdfPath).size,
      isPremium: isPremium === 'true' || isPremium === true,
      confidenceScore: scoreResult.totalScore,
      verificationStatus,
      circuBitsAwarded: circuBitsReward
    });

    await document.save();

    // Award CircuBits if score is high enough
    if (circuBitsReward > 0) {
      await TokenService.awardTokens(
        req.user._id,
        circuBitsReward,
        'upload_reward',
        document._id,
        'Document',
        `Earned ${circuBitsReward} CircuBits for uploading "${title}" (Score: ${scoreResult.totalScore})`
      );
    }

    // Update user stats
    req.user.totalUploads += 1;
    await req.user.save();

    res.status(201).json({
      message: 'Document uploaded successfully',
      document,
      scoring: scoreResult,
      circuBitsEarned: circuBitsReward,
      newBalance: (await TokenService.getBalance(req.user._id))
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed: ' + error.message });
  }
});

// GET /api/documents — List documents
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 12, search, subject, premium, sort = 'newest' } = req.query;
    const query = { verificationStatus: { $in: ['verified', 'pending'] }, isBountySubmission: { $ne: true } };

    if (search) {
      query.$text = { $search: search };
    }
    if (subject) {
      query.subject = new RegExp(subject, 'i');
    }
    if (premium === 'true') {
      query.isPremium = true;
    } else if (premium === 'false') {
      query.isPremium = false;
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'popular') sortOption = { totalViews: -1 };
    if (sort === 'score') sortOption = { confidenceScore: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const documents = await Document.find(query)
      .populate('uploadedBy', 'name email reputation')
      .sort(sortOption)
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await Document.countDocuments(query);

    res.json({
      documents,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('List documents error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// GET /api/documents/:id — Get single document
router.get('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('uploadedBy', 'name email reputation')
      .populate('comments.user', 'name reputation')
      .populate('ratings.user', 'name');

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({ document });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// GET /api/documents/:id/view — Secure document viewing (stream PDF)
router.get('/:id/view', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check premium access
    if (document.isPremium && req.user.role === 'free') {
      return res.status(403).json({
        error: 'Premium content requires subscription or CircuBits',
        circuBitsCost: TokenService.PRICES.PREMIUM_DOC_ACCESS
      });
    }

    // Increment view count
    document.totalViews += 1;
    await document.save();

    // Stream the file
    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    // Prevent download headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

    const stream = fs.createReadStream(document.filePath);
    stream.pipe(res);
  } catch (error) {
    console.error('View error:', error);
    res.status(500).json({ error: 'Failed to load document' });
  }
});

// GET /api/documents/:id/company-view — Secure document viewing for companies
router.get('/:id/company-view', async (req, res) => {
  try {
    // Cannot use the standard companyAuth middleware easily for a direct browser GET request. We expect `?token=...` in the query string.
    const token = req.query.token;
    if (!token) return res.status(401).json({ error: 'Authentication required' });

    const jwt = require('jsonwebtoken');
    const Company = require('../models/Company');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const company = await Company.findById(decoded.companyId);
    
    if (!company || !company.isApproved) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Stream the file for the company to review
    const fs = require('fs');
    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${document.originalFileName || 'document.pdf'}"`);
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    
    fs.createReadStream(document.filePath).pipe(res);

  } catch (error) {
    res.status(500).json({ error: 'Failed to access document for review' });
  }
});

// POST /api/documents/:id/unlock — Unlock premium doc with CircuBits
router.post('/:id/unlock', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (!document.isPremium) {
      return res.json({ message: 'Document is already free to access' });
    }

    const cost = TokenService.PRICES.PREMIUM_DOC_ACCESS;

    await TokenService.spendTokens(
      req.user._id,
      cost,
      'premium_access_spend',
      document._id,
      'Document',
      `Spent ${cost} CircuBits to unlock "${document.title}"`
    );

    res.json({
      message: 'Document unlocked successfully',
      circuBitsSpent: cost,
      newBalance: await TokenService.getBalance(req.user._id)
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/documents/user/uploads — Get current user's uploads
router.get('/user/uploads', auth, async (req, res) => {
  try {
    const documents = await Document.find({ uploadedBy: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ documents });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch uploads' });
  }
});

// POST /api/documents/:id/like — Toggle Like
router.post('/:id/like', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ error: 'Document not found' });
    
    const userId = req.user._id;
    const hasLiked = document.likes.includes(userId);
    
    if (hasLiked) {
      document.likes.pull(userId);
    } else {
      document.likes.push(userId);
    }
    await document.save();
    res.json({ message: hasLiked ? 'Unliked' : 'Liked', likes: document.likes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update like status' });
  }
});

// POST /api/documents/:id/rate — Add or Update Star Rating
router.post('/:id/rate', auth, async (req, res) => {
  try {
    const { value } = req.body;
    if (!value || value < 1 || value > 5) return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ error: 'Document not found' });
    
    const existingIndex = document.ratings.findIndex(r => r.user.toString() === req.user._id.toString());
    if (existingIndex > -1) {
      document.ratings[existingIndex].value = value;
      document.ratings[existingIndex].createdAt = Date.now();
    } else {
      document.ratings.push({ user: req.user._id, value });
    }
    await document.save();
    
    const updatedDoc = await Document.findById(req.params.id).populate('ratings.user', 'name');
    res.json({ message: 'Rating saved', ratings: updatedDoc.ratings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit rating' });
  }
});

// POST /api/documents/:id/comment — Add a text comment
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim().length === 0) return res.status(400).json({ error: 'Comment cannot be empty' });
    
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ error: 'Document not found' });
    
    document.comments.push({ user: req.user._id, text: text.trim() });
    await document.save();
    
    const updatedDoc = await Document.findById(req.params.id).populate('comments.user', 'name reputation');
    res.json({ message: 'Comment added', comments: updatedDoc.comments });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

module.exports = router;
