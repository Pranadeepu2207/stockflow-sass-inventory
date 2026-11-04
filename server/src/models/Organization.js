const mongoose = require('mongoose');

// represents a tenant store/business
const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
    },
    // store-wide threshold used when individual products don't specify one
    defaultLowStockThreshold: {
      type: Number,
      default: 5,
      min: [0, 'Default threshold cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Organization', organizationSchema);
