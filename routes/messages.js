const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Send message
router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    const message = new Message({ sender: req.userId, receiver: receiverId, text });
    await message.save();
    await message.populate('sender', 'username profilePicture');
    await message.populate('receiver', 'username profilePicture');
    res.status(201).json(message);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get conversation
router.get('/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.userId, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.userId }
      ]
    }).sort({ createdAt: 1 })
      .populate('sender', 'username profilePicture')
      .populate('receiver', 'username profilePicture');
    res.json(messages);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get chat list (unique conversations)
router.get('/', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.userId }, { receiver: req.userId }]
    }).sort({ createdAt: -1 });

    const userIds = new Set();
    messages.forEach(m => {
      const other = m.sender.toString() === req.userId ? m.receiver : m.sender;
      userIds.add(other.toString());
    });

    const users = await User.find({ _id: { $in: [...userIds] } }).select('username profilePicture');
    res.json(users);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;