const mongoose = require('mongoose');

// metadata shapes per activity_type:
// LOGIN: { ip: String, user_agent: String }
// MESSAGE: { message_id: ObjectId, group_id: ObjectId }
// INTERACTION: { subtype: String, target_id: ObjectId, detail: String }

const ActivityLogSchema = new mongoose.Schema(
  {
    event_id: {
      type: String,
      required: true,
      unique: true, // deduplication for async events
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    activity_type: {
      type: String,
      enum: ['LOGIN', 'MESSAGE', 'INTERACTION'],
      required: true,
    },
    activity_subtype: {
      type: String,
      default: null, // e.g., 'RESOURCE_VIEW', 'POLL_RESPONSE', 'QUIZ_SUBMIT'
    },
    group_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      default: null, // null for LOGIN events
    },
    source_timestamp: {
      type: Date,
      default: null, // original event time from source module
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now, // ingestion time
      required: true,
    },
  },
  {
    timestamps: false,
  }
);

// User activity timeline
ActivityLogSchema.index({ user_id: 1, timestamp: -1 });

// Group-level analytics
ActivityLogSchema.index({ group_id: 1, timestamp: -1 });

// Classification engine type filtering
ActivityLogSchema.index({ activity_type: 1 });

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
