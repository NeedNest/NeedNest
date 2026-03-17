const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Item = require('../models/Item');
const Notification = require('../models/Notification');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Admin
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeUsers = await User.countDocuments({ role: 'user', isActive: true });
    const totalItems = await Item.countDocuments();
    const availableItems = await Item.countDocuments({ status: 'available' });
    const collectedItems = await Item.countDocuments({ status: 'collected' });
    const removedItems = await Item.countDocuments({ status: 'removed' });

    // Category breakdown
    const categoryStats = await Item.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Recent items
    const recentItems = await Item.find()
      .populate('donor', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent users
    const recentUsers = await User.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('-password');

    res.json({
      totalUsers,
      activeUsers,
      totalItems,
      availableItems,
      collectedItems,
      removedItems,
      categoryStats,
      recentItems,
      recentUsers
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Admin
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;

    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(query);

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      users,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id/toggle-status
// @desc    Activate/Deactivate user
// @access  Admin
router.put('/users/:id/toggle-status', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot modify admin user status' });
    }

    user.isActive = !user.isActive;
    await user.save();

    // If deactivated, also mark their items as removed
    if (!user.isActive) {
      await Item.updateMany(
        { donor: user._id, status: 'available' },
        { status: 'removed' }
      );
    }

    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Admin
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin user' });
    }

    // Remove all their items
    await Item.deleteMany({ donor: user._id });
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User and their items deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/items
// @desc    Get all items (admin view)
// @access  Admin
router.get('/items', protect, adminOnly, async (req, res) => {
  try {
    const { status, category, search, page = 1, limit = 20 } = req.query;

    let query = {};
    if (status && status !== 'all') query.status = status;
    if (category && category !== 'all') query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { donorName: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Item.countDocuments(query);

    const items = await Item.find(query)
      .populate('donor', 'name email')
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
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/items/:id/approve
// @desc    Approve/Disapprove item
// @access  Admin
router.put('/items/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    item.isApproved = !item.isApproved;
    await item.save();

    // Notify donor
    await Notification.create({
      user: item.donor,
      title: item.isApproved ? 'Item Approved' : 'Item Disapproved',
      message: item.isApproved
        ? `Your item "${item.title}" has been approved and is now visible.`
        : `Your item "${item.title}" has been disapproved by admin.`,
      type: 'item_approved',
      relatedItem: item._id
    });

    res.json({ message: `Item ${item.isApproved ? 'approved' : 'disapproved'} successfully`, item });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/items/:id/remove
// @desc    Remove item (mark as removed)
// @access  Admin
router.put('/items/:id/remove', protect, adminOnly, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    item.status = 'removed';
    item.isApproved = false;
    await item.save();

    // Notify donor
    await Notification.create({
      user: item.donor,
      title: 'Item Removed',
      message: `Your item "${item.title}" has been removed by admin for policy violation.`,
      type: 'item_removed',
      relatedItem: item._id
    });

    res.json({ message: 'Item removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
