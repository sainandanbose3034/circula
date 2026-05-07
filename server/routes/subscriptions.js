const express = require('express');
const { auth } = require('../middleware/auth');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const Revenue = require('../models/Revenue'); // Added for platform tracking
const TokenService = require('../services/tokenService');

const router = express.Router();

// Pricing table (amounts in INR)
const PRICING = {
  monthly: { tenure: 30, amount: 299, label: 'Monthly' },
  '1day': { tenure: 1, amount: 29, label: '1 Day' },
  '3days': { tenure: 3, amount: 69, label: '3 Days' },
  '5days': { tenure: 5, amount: 99, label: '5 Days' },
  '10days': { tenure: 10, amount: 179, label: '10 Days' },
  '15days': { tenure: 15, amount: 229, label: '15 Days' },
};

// GET /api/subscriptions/plans — Get available plans
router.get('/plans', (req, res) => {
  res.json({ plans: PRICING });
});

// POST /api/subscriptions/create — Create a subscription (mock payment)
router.post('/create', auth, async (req, res) => {
  try {
    const { planKey } = req.body;

    if (!PRICING[planKey]) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    const plan = PRICING[planKey];
    const now = new Date();
    const endDate = new Date(now.getTime() + plan.tenure * 24 * 60 * 60 * 1000);

    // If user already has active subscription, extend it
    let startDate = now;
    if (req.user.subscription.isActive && req.user.subscription.endDate > now) {
      startDate = req.user.subscription.endDate;
      endDate.setTime(startDate.getTime() + plan.tenure * 24 * 60 * 60 * 1000);
    }

    const subscription = new Subscription({
      userId: req.user._id,
      plan: planKey === 'monthly' ? 'monthly' : 'custom',
      tenure: plan.tenure,
      amount: plan.amount,
      paymentId: `MOCK_PAY_${Date.now()}`,
      paymentMethod: 'mock',
      startDate,
      endDate,
      isActive: true
    });

    await subscription.save();

    // 1. Log Platform Revenue (Subscription)
    await Revenue.create({
      type: 'subscription',
      amount: plan.amount,
      currency: 'INR',
      sourceId: subscription._id,
      sourceModel: 'Subscription',
      metadata: {
        planKey,
        userId: req.user._id
      }
    });

    // Update user
    req.user.subscription = {
      plan: planKey === 'monthly' ? 'monthly' : 'custom',
      startDate,
      endDate,
      isActive: true
    };
    req.user.role = 'premium';
    await req.user.save();

    res.status(201).json({
      message: 'Subscription activated successfully!',
      subscription,
      user: req.user.toJSON()
    });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// POST /api/subscriptions/extend — Extend subscription with CircuBits
router.post('/extend', auth, async (req, res) => {
  try {
    const { days } = req.body;
    const allowedDays = [1, 3, 5];
    
    if (!allowedDays.includes(days)) {
      return res.status(400).json({ error: 'Can extend by 1, 3, or 5 days using CircuBits' });
    }

    const costMap = {
      1: TokenService.PRICES.SUBSCRIPTION_EXTEND_1_DAY,
      3: TokenService.PRICES.SUBSCRIPTION_EXTEND_3_DAYS,
      5: TokenService.PRICES.SUBSCRIPTION_EXTEND_5_DAYS,
    };
    const cost = costMap[days];

    // Check if user has active subscription
    if (!req.user.subscription.isActive) {
      return res.status(400).json({ error: 'You need an active subscription to extend' });
    }

    await TokenService.spendTokens(
      req.user._id,
      cost,
      'subscription_extend',
      null,
      'Subscription',
      `Extended subscription by ${days} day(s) for ${cost} CircuBits`
    );

    const newEndDate = new Date(req.user.subscription.endDate.getTime() + days * 24 * 60 * 60 * 1000);
    req.user.subscription.endDate = newEndDate;
    await req.user.save();

    res.json({
      message: `Subscription extended by ${days} day(s)!`,
      newEndDate,
      circuBitsSpent: cost,
      newBalance: await TokenService.getBalance(req.user._id)
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/subscriptions/active — Check active subscription
router.get('/active', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      userId: req.user._id,
      isActive: true,
      endDate: { $gt: new Date() }
    }).sort({ endDate: -1 });

    res.json({
      hasActive: !!subscription,
      subscription: subscription || null,
      userRole: req.user.role
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check subscription' });
  }
});

// POST /api/subscriptions/debug/remove — Remove active subscription
router.post('/debug/remove', auth, async (req, res) => {
  try {
    await Subscription.updateMany(
      { userId: req.user._id, isActive: true },
      { isActive: false, endDate: new Date() }
    );

    req.user.subscription = {
      plan: 'none',
      isActive: false
    };
    if (req.user.role === 'premium') {
      req.user.role = 'free';
    }
    await req.user.save();

    res.json({ message: 'Debug: Subscription removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove subscription' });
  }
});

module.exports = router;
