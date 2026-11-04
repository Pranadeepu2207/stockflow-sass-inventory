const mongoose = require('mongoose');

// user account belonging to an organization
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    // hashed with bcrypt before saving
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    // links the user to their store (single tenant owner in MVP)
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
