const express = require('express');
const { auth } = require('../middleware/auth');
const TokenService = require('../services/tokenService');

const router = express.Router();

// GET /api/tokens/balance — Get CircuBits balance
router.get('/balance', auth, async (req, res) => {
  try {
    const balance = await TokenService.getBalance(req.user._id);
    res.json({ balance, currency: 'CircuBits' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get balance' });
  }
});

// GET /api/tokens/history — Get transaction history
router.get('/history', auth, async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const result = await TokenService.getTransactionHistory(
      req.user._id,
      parseInt(limit),
      skip
    );

    res.json({
      transactions: result.transactions,
      total: result.total,
      totalPages: Math.ceil(result.total / parseInt(limit)),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get transaction history' });
  }
});

// GET /api/tokens/prices — Get CircuBits pricing
router.get('/prices', (req, res) => {
  res.json({ prices: TokenService.PRICES });
});

module.exports = router;
