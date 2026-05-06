const mongoose = require('mongoose');

const TokenBlacklistSchema = new mongoose.Schema(
  {
    jti: {
      type: String,
      required: true,
      unique: true, // JWT ID claim
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    invalidated_at: {
      type: Date,
      default: Date.now,
    },
    expires_at: {
      type: Date,
      required: true, // mirrors JWT exp claim
    },
  },
  {
    timestamps: false,
  }
);

// TTL index: auto-delete after token expiry
TokenBlacklistSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('TokenBlacklist', TokenBlacklistSchema);
