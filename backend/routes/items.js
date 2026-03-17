const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Item = require('../models/Item');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// @route   POST /api/items
// @desc    Create/Donate a new item
// @access  Private
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, condition, quantity, location, expiresAt, expiryDate } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Item image is required' });
    }

    if (['food', 'medicines'].includes(category)) {
      if (!expiresAt && !expiryDate) {
        return res.status(400).json({ message: `Expiry date is required for ${category}` });
      }
    }

    let parsedLocation;
    if (typeof location === 'string') {
      parsedLocation = JSON.parse(location);
    } else {
      parsedLocation = location;
    }

    if (!parsedLocation || !parsedLocation.city || !parsedLocation.state) {
      return res.status(400).json({ message: 'City and state are required for item location' });
    }

    const item = await Item.create({
      title,
      description,
      category,
      condition: condition || 'good',
      quantity: quantity || 1,
      image: `/uploads/${req.file.filename}`,
      location: {
        city: parsedLocation.city,
        state: parsedLocation.state,
        address: parsedLocation.address || '',
        pincode: parsedLocation.pincode || ''
      },
      donor: req.user._id,
      donorName: req.user.name,
      donorPhone: req.user.phone,
      expiresAt: expiryDate || expiresAt || null
    });

    // Update donor's donation count
    await User.findByIdAndUpdate(req.user._id, { $inc: { itemsDonated: 1 } });

    // Notify admin about new item
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        title: 'New Item Donated',
        message: `${req.user.name} donated "${title}" in ${parsedLocation.city}`,
        type: 'new_item',
        relatedItem: item._id
      });
    }

    res.status(201).json(item);
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ message: error.message || 'Server error creating item' });
  }
});

// @route   GET /api/items
// @desc    Get all available items (with filters)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, city, state, search, page = 1, limit = 12 } = req.query;

    let query = { status: 'available', isApproved: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (city) {
      query['location.city'] = { $regex: city, $options: 'i' };
    }

    if (state) {
      query['location.state'] = { $regex: state, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Item.countDocuments(query);

    const items = await Item.find(query)
      .populate('donor', 'name location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      items,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ message: 'Server error fetching items' });
  }
});

// @route   GET /api/items/my-donations
// @desc    Get items donated by current user
// @access  Private
router.get('/my-donations', protect, async (req, res) => {
  try {
    const items = await Item.find({ donor: req.user._id })
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/items/:id
// @desc    Get single item details
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('donor', 'name email phone location')
      .populate('collectedBy', 'name');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/items/:id
// @desc    Update an item
// @access  Private (owner only)
router.put('/:id', protect, upload.single('image'), async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.donor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }

    const { title, description, category, condition, quantity, location, status, expiresAt } = req.body;

    let parsedLocation;
    if (location) {
      parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
    }

    if (title) item.title = title;
    if (description) item.description = description;
    if (category) item.category = category;
    if (condition) item.condition = condition;
    if (quantity) item.quantity = quantity;
    if (parsedLocation) {
      item.location = {
        city: parsedLocation.city || item.location.city,
        state: parsedLocation.state || item.location.state,
        address: parsedLocation.address || item.location.address,
        pincode: parsedLocation.pincode || item.location.pincode
      };
    }
    if (status) item.status = status;
    if (expiresAt) item.expiresAt = expiresAt;
    if (req.file) item.image = `/uploads/${req.file.filename}`;

    const updatedItem = await item.save();
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating item' });
  }
});

// @route   PUT /api/items/:id/collect
// @desc    Mark item as collected
// @access  Private
router.put('/:id/collect', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.status !== 'available') {
      return res.status(400).json({ message: 'Item is no longer available' });
    }

    item.status = 'collected';
    item.collectedBy = req.user._id;
    item.collectedAt = new Date();

    await item.save();

    // Update receiver's received count
    await User.findByIdAndUpdate(req.user._id, { $inc: { itemsReceived: 1 } });

    // Notify donor
    await Notification.create({
      user: item.donor,
      title: 'Item Collected',
      message: `"${item.title}" has been collected by ${req.user.name}`,
      type: 'item_collected',
      relatedItem: item._id
    });

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/items/:id
// @desc    Delete an item
// @access  Private (owner or admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.donor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    await Item.findByIdAndDelete(req.params.id);

    // Decrement donor count
    await User.findByIdAndUpdate(item.donor, { $inc: { itemsDonated: -1 } });

    res.json({ message: 'Item removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
