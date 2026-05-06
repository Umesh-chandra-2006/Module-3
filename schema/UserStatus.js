const mongoose = require('mongoose');

const UserStatusSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    group_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      default: null, // nullable for group transitions
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      required: true,
    },
    last_active_at: {
      type: Date,
      required: true,
    },
    evaluated_at: {
      type: Date,
      default: Date.now,
    },
    threshold_hours: {
      type: Number,
      default: 48, // configurable from env
    },
    status_changed_at: {
      type: Date,
      default: null, // tracks transition time
    },
    transition_count: {
      type: Number,
      default: 0, // lightweight engagement signal
    },
  },
  {
    timestamps: false,
  }
);

// Dashboard active/inactive filtering
UserStatusSchema.index({ status: 1 });

module.exports = mongoose.model('UserStatus', UserStatusSchema);
