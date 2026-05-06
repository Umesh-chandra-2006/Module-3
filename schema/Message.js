const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    group_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    sent_at: {
      type: Date,
      default: Date.now, // native Date, not string
    },
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: false, // sent_at is the canonical timestamp
  }
);

// Chat history and analytics queries
MessageSchema.index({ group_id: 1, sent_at: -1 });

// Soft-delete middleware
MessageSchema.pre(/^find/, function (next) {
  if (!this.getOptions().includeDeleted) {
    this.where({ deleted_at: null });
  }
  next();
});

module.exports = mongoose.model('Message', MessageSchema);
