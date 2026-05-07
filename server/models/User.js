const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['free', 'premium', 'admin'],
    default: 'free'
  },
  circuBits: {
    type: Number,
    default: 0,
    min: 0
  },
  fiatBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  totalUploads: {
    type: Number,
    default: 0
  },
  reputation: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  subscription: {
    plan: {
      type: String,
      enum: ['none', 'monthly', 'custom'],
      default: 'none'
    },
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: false
    }
  },
  avatar: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Hash password before saving (skip if already hashed)
userSchema.pre('save', async function() {
  if (!this.isModified('passwordHash')) return;
  // Skip if already a bcrypt hash
  if (this.passwordHash.startsWith('$2a$') || this.passwordHash.startsWith('$2b$')) return;
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Remove sensitive fields from JSON
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
