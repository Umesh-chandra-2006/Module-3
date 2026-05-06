const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    batch_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: true,
    },
    manager_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null = unassigned
    },
    members: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      validate: {
        validator: (arr) => arr.length <= 7,
        message: 'A group cannot have more than 7 members',
      },
    },
    is_archived: {
      type: Boolean,
      default: false,
    },
    archived_at: {
      type: Date,
      default: null,
    },
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

// Unique group names within a batch (excluding deleted)
GroupSchema.index(
  { batch_id: 1, name: 1 },
  { unique: true, partialFilterExpression: { deleted_at: null } }
);

// For unassigned groups queries
GroupSchema.index({ manager_id: 1 }, { sparse: true });

// For user → group lookup
GroupSchema.index({ members: 1 });

// Soft-delete middleware
GroupSchema.pre(/^find/, function (next) {
  if (!this.getOptions().includeDeleted) {
    this.where({ deleted_at: null });
  }
  next();
});

module.exports = mongoose.model('Group', GroupSchema);
