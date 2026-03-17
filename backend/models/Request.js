const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'collected'],
    default: 'pending'
  },
  responseMessage: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  respondedAt: {
    type: Date,
    default: null
  },
  collectedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Prevent duplicate requests from same receiver for same item
requestSchema.index({ item: 1, receiver: 1 }, { unique: true });
requestSchema.index({ donor: 1, status: 1 });
requestSchema.index({ receiver: 1, status: 1 });

module.exports = mongoose.model('Request', requestSchema);
