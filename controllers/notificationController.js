// controllers/notificationController.js
const Notification = require('../models/Notification');

// User ki saari notifications get karne ke liye
const getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({ receiver: userId })
      .populate('sender', 'username') // Sender ka sirf username chahiye
      .populate('blog', 'text')      // 💡 Note: Aapke Post model me text field hai title ki jagah, toh 'text' populate hoga
      .sort({ createdAt: -1 });      // Newest first

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Saari notifications ko read mark karne ke liye
const markNotificationsAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    await Notification.updateMany({ receiver: userId, isRead: false }, { isRead: true });
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  getNotifications,
  markNotificationsAsRead
};