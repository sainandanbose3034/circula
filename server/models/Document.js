const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 2000,
    default: ''
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  originalFileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['pdf', 'docx', 'pptx', 'image'],
    default: 'pdf'
  },
  pageCount: {
    type: Number,
    default: 1
  },
  fileSize: {
    type: Number,
    default: 0
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  confidenceScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  circuBitsAwarded: {
    type: Number,
    default: 0
  },
  isBountySubmission: {
    type: Boolean,
    default: false
  },
  bountyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bounty',
    default: null
  },
  totalViews: {
    type: Number,
    default: 0
  },
  totalReports: {
    type: Number,
    default: 0
  },
  likes: [{ // Array of User IDs who liked the document
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  ratings: [{ // Array of user ratings (1-5)
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    value: { type: Number, min: 1, max: 5 },
    createdAt: { type: Date, default: Date.now }
  }],
  comments: [{ // Array of text comments
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Index for search
documentSchema.index({ title: 'text', description: 'text', subject: 'text', tags: 'text' });

module.exports = mongoose.model('Document', documentSchema);
