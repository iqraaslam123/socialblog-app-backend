// models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Blog Author
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },   // Action karne wala user
  type: { type: String, enum: ['like', 'comment', 'share', 'bookmark', 'star'], required: true },
  blog: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true }, // 💡 Note: Aapki file ka naam Post hai, isliye ref 'Post' kiya hai
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);