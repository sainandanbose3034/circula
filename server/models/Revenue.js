const mongoose = require('mongoose');

const revenueSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['bounty_commission', 'subscription'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
    // This will point to Bounty ID for commission or Subscription ID
  },
  sourceModel: {
    type: String,
    enum: ['Bounty', 'Subscription'],
    required: true
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Revenue', revenueSchema);
