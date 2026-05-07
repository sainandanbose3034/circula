const mongoose = require('mongoose');

const tokenLedgerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true // positive = credit, negative = debit
  },
  type: {
    type: String,
    enum: ['upload_reward', 'premium_access_spend', 'subscription_extend', 'bounty_reward', 'admin_grant'],
    required: true
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'referenceModel'
  },
  referenceModel: {
    type: String,
    enum: ['Document', 'Bounty', 'Subscription']
  },
  description: {
    type: String,
    default: ''
  },
  balanceAfter: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TokenLedger', tokenLedgerSchema);
