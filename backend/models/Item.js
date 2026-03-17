const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide item title'],
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: [true, 'Please provide item description'],
    trim: true,
    maxlength: 1000
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['food', 'clothes', 'books', 'electronics', 'furniture', 'medicines', 'toys', 'other']
  },
  condition: {
    type: String,
    enum: ['new', 'like-new', 'good', 'fair'],
    default: 'good'
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  image: {
    type: String,
    required: [true, 'Please provide an item image']
  },
  location: {
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    pincode: { type: String, trim: true }
  },
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  donorName: {
    type: String,
    required: true
  },
  donorPhone: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'collected', 'expired', 'removed'],
    default: 'available'
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  collectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  collectedAt: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for location-based search
itemSchema.index({ 'location.city': 1, category: 1, status: 1 });
itemSchema.index({ donor: 1 });
itemSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Item', itemSchema);
