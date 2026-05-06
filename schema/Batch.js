const mongoose = require('mongoose');

const BatchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // ADMIN only
      required: true,
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

// Unique batch names (excluding deleted)
BatchSchema.index(
  { name: 1 },
  { unique: true, partialFilterExpression: { deleted_at: null } }
);

// Soft-delete middleware
BatchSchema.pre(/^find/, function (next) {
  if (!this.getOptions().includeDeleted) {
    this.where({ deleted_at: null });
  }
  next();
});

module.exports = mongoose.model('Batch', BatchSchema);
