const mongoose = require('mongoose');

const bountySchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Bounty title is required'],
    trim: true,
    maxlength: 300
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 5000
  },
  requirements: {
    type: String,
    maxlength: 3000,
    default: ''
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  reward: {
    type: Number,
    required: true,
    min: 1
  },
  rewardType: {
    type: String,
    enum: ['circubits', 'currency'],
    default: 'currency' // Defaulting to real Rupees
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'fulfilled', 'closed'],
    default: 'open'
  },
  deadline: {
    type: Date,
    required: true
  },
  submissions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document'
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    feedback: {
      type: String,
      default: ''
    }
  }],
  maxSubmissions: {
    type: Number,
    default: 10
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Bounty', bountySchema);
