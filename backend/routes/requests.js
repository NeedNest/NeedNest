const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const Item = require('../models/Item');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// @route   POST /api/requests
// @desc    Receiver sends a request for an item
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { itemId, message } = req.body;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.status !== 'available') {
      return res.status(400).json({ message: 'Item is no longer available' });
    }

    // Cannot request your own item
    if (item.donor.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot request your own item' });
    }

    // Check for existing request
    const existingRequest = await Request.findOne({
      item: itemId,
      receiver: req.user._id
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'You have already requested this item' });
    }

    const request = await Request.create({
      item: itemId,
      receiver: req.user._id,
      donor: item.donor,
      message: message || ''
    });

    // Notify donor
    await Notification.create({
      user: item.donor,
      title: 'New Item Request',
      message: `${req.user.name} has requested "${item.title}"`,
      type: 'item_request',
      relatedItem: item._id
    });

    const populatedRequest = await Request.findById(request._id)
      .populate('item', 'title category image location')
      .populate('receiver', 'name email phone location')
      .populate('donor', 'name email phone');

    res.status(201).json(populatedRequest);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already requested this item' });
    }
    console.error('Create request error:', error);
    res.status(500).json({ message: 'Server error creating request' });
  }
});

// @route   GET /api/requests/my-requests
// @desc    Get requests made by current user (receiver view)
// @access  Private
router.get('/my-requests', protect, async (req, res) => {
  try {
    const { status } = req.query;
    let query = { receiver: req.user._id };
    if (status && status !== 'all') {
      query.status = status;
    }

    const requests = await Request.find(query)
      .populate('item', 'title category image location status condition quantity')
      .populate('donor', 'name email phone location')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/requests/donor-requests
// @desc    Get requests received by current user (donor view)
// @access  Private
router.get('/donor-requests', protect, async (req, res) => {
  try {
    const { status } = req.query;
    let query = { donor: req.user._id };
    if (status && status !== 'all') {
      query.status = status;
    }

    const requests = await Request.find(query)
      .populate('item', 'title category image location status condition quantity')
      .populate('receiver', 'name email phone location')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/requests/:id/approve
// @desc    Donor approves a request
// @access  Private (donor only)
router.put('/:id/approve', protect, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request has already been processed' });
    }

    request.status = 'approved';
    request.responseMessage = req.body.responseMessage || '';
    request.respondedAt = new Date();
    await request.save();

    // Notify receiver
    const item = await Item.findById(request.item);
    await Notification.create({
      user: request.receiver,
      title: 'Request Approved! 🎉',
      message: `Your request for "${item?.title}" has been approved. Contact the donor to collect it.`,
      type: 'request_approved',
      relatedItem: request.item
    });

    const populated = await Request.findById(request._id)
      .populate('item', 'title category image location status')
      .populate('receiver', 'name email phone location');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/requests/:id/reject
// @desc    Donor rejects a request
// @access  Private (donor only)
router.put('/:id/reject', protect, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request has already been processed' });
    }

    request.status = 'rejected';
    request.responseMessage = req.body.responseMessage || '';
    request.respondedAt = new Date();
    await request.save();

    // Notify receiver
    const item = await Item.findById(request.item);
    await Notification.create({
      user: request.receiver,
      title: 'Request Declined',
      message: `Your request for "${item?.title}" was not approved.`,
      type: 'request_rejected',
      relatedItem: request.item
    });

    const populated = await Request.findById(request._id)
      .populate('item', 'title category image location status')
      .populate('receiver', 'name email phone location');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/requests/:id/mark-collected
// @desc    Donor marks an approved request as collected
// @access  Private (donor only)
router.put('/:id/mark-collected', protect, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (request.status !== 'approved') {
      return res.status(400).json({ message: 'Only approved requests can be marked as collected' });
    }

    request.status = 'collected';
    request.collectedAt = new Date();
    await request.save();

    // Update item status
    await Item.findByIdAndUpdate(request.item, {
      status: 'collected',
      collectedBy: request.receiver,
      collectedAt: new Date()
    });

    // Update user counts
    await User.findByIdAndUpdate(request.receiver, { $inc: { itemsReceived: 1 } });

    // Reject all other pending requests for the same item
    await Request.updateMany(
      { item: request.item, _id: { $ne: request._id }, status: 'pending' },
      { status: 'rejected', responseMessage: 'Item has been collected by another user', respondedAt: new Date() }
    );

    // Notify receiver
    const item = await Item.findById(request.item);
    await Notification.create({
      user: request.receiver,
      title: 'Item Collected ✅',
      message: `"${item?.title}" has been marked as collected. Thank you!`,
      type: 'item_collected',
      relatedItem: request.item
    });

    const populated = await Request.findById(request._id)
      .populate('item', 'title category image location status')
      .populate('receiver', 'name email phone location');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/requests/check/:itemId
// @desc    Check if current user already requested an item
// @access  Private
router.get('/check/:itemId', protect, async (req, res) => {
  try {
    const request = await Request.findOne({
      item: req.params.itemId,
      receiver: req.user._id
    });
    res.json({ hasRequested: !!request, request: request || null });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
