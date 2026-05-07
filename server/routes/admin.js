const express = require('express');
const { auth, requireRole } = require('../middleware/auth');
const Revenue = require('../models/Revenue');
const User = require('../models/User');
const Bounty = require('../models/Bounty');
const Subscription = require('../models/Subscription');

const router = express.Router();

// GET /api/admin/revenue-stats — Get platform revenue overview
router.get('/revenue-stats', auth, requireRole('admin'), async (req, res) => {
  try {
    const revenueEntries = await Revenue.find().sort({ createdAt: -1 }).lean();
    
    const totalRevenue = revenueEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const bountyCommissions = revenueEntries
      .filter(e => e.type === 'bounty_commission')
      .reduce((sum, entry) => sum + entry.amount, 0);
    const subscriptionRevenue = revenueEntries
      .filter(e => e.type === 'subscription')
      .reduce((sum, entry) => sum + entry.amount, 0);

    // Get some general stats
    const totalUsers = await User.countDocuments();
    const premiumUsers = await User.countDocuments({ role: 'premium' });
    const totalBounties = await Bounty.countDocuments();
    const fulfilledBounties = await Bounty.countDocuments({ status: 'fulfilled' });

    res.json({
      summary: {
        totalRevenue,
        bountyCommissions,
        subscriptionRevenue,
        totalUsers,
        premiumUsers,
        totalBounties,
        fulfilledBounties
      },
      recentTransactions: revenueEntries.slice(0, 10)
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue statistics' });
  }
});

module.exports = router;
