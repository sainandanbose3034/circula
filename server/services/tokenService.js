const User = require('../models/User');
const TokenLedger = require('../models/TokenLedger');

/**
 * Token Service — manages all CircuBits transactions
 */
class TokenService {
  
  /**
   * Award CircuBits to a user (e.g., after document verification)
   */
  static async awardTokens(userId, amount, type, referenceId, referenceModel, description) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    user.circuBits += amount;
    await user.save();

    const ledgerEntry = new TokenLedger({
      userId,
      amount,
      type,
      referenceId,
      referenceModel,
      description,
      balanceAfter: user.circuBits
    });
    await ledgerEntry.save();

    return { newBalance: user.circuBits, ledgerEntry };
  }

  /**
   * Spend CircuBits (e.g., unlock premium doc, extend subscription)
   */
  static async spendTokens(userId, amount, type, referenceId, referenceModel, description) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    if (user.circuBits < amount) {
      throw new Error(`Insufficient CircuBits. You have ${user.circuBits}, need ${amount}.`);
    }

    user.circuBits -= amount;
    await user.save();

    const ledgerEntry = new TokenLedger({
      userId,
      amount: -amount,
      type,
      referenceId,
      referenceModel,
      description,
      balanceAfter: user.circuBits
    });
    await ledgerEntry.save();

    return { newBalance: user.circuBits, ledgerEntry };
  }

  /**
   * Get user's CircuBits balance
   */
  static async getBalance(userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    return user.circuBits;
  }

  /**
   * Get transaction history for a user
   */
  static async getTransactionHistory(userId, limit = 20, skip = 0) {
    const transactions = await TokenLedger.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await TokenLedger.countDocuments({ userId });

    return { transactions, total };
  }

  /**
   * Pricing for CircuBits-based actions
   */
  static get PRICES() {
    return {
      PREMIUM_DOC_ACCESS: 3,
      SUBSCRIPTION_EXTEND_1_DAY: 10,
      SUBSCRIPTION_EXTEND_3_DAYS: 25,
      SUBSCRIPTION_EXTEND_5_DAYS: 40,
    };
  }
}

module.exports = TokenService;
