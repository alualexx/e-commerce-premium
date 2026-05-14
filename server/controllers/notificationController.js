const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    
    const unreadCount = await Notification.countDocuments({ 
      recipient: req.user._id, 
      read: false 
    });

    res.json({ notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { new: true }
    );
    res.json(notification);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get latest global promotion (public)
// @route   GET /api/notifications/latest-promotion
const getLatestPromotion = async (req, res, next) => {
  try {
    // Find the single most recent notification of type 'promotion'
    const promotion = await Notification.findOne({ type: 'promotion' })
      .sort({ createdAt: -1 });
    
    res.json(promotion);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllRead,
  getLatestPromotion
};
