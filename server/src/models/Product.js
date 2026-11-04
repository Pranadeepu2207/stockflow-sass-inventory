const mongoose = require('mongoose');

// inventory product schema
const productSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    // keep quantity as clean integers
    quantity: {
      type: Number,
      required: [true, 'Quantity on hand is required'],
      default: 0,
      set: (v) => Math.round(Number(v) || 0),
    },
    costPrice: {
      type: Number,
      default: null,
    },
    sellingPrice: {
      type: Number,
      default: null,
    },
    // if left blank, falls back to organization.defaultLowStockThreshold
    lowStockThreshold: {
      type: Number,
      default: null,
      set: (v) => (v === '' || v === null || v === undefined ? null : Math.round(Number(v))),
    },
    // track who made the last edit or stock adjustment
    lastUpdatedBy: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// SKU must be unique within the store, but different stores can have the same SKU
productSchema.index({ organizationId: 1, sku: 1 }, { unique: true });

module.exports = mongoose.model('Product', productSchema);
