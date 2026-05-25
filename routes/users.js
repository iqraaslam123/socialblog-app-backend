// const express = require('express');
// const User = require('../models/User');
// const Post = require('../models/Post');
// const auth = require('../middleware/auth');
// const upload = require('../middleware/upload');
// const router = express.Router();

// // Get current user
// router.get('/me', auth, async (req, res) => {
//   try {
//     const user = await User.findById(req.userId).select('-password');
//     res.json(user);
//   } catch {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Search users
// router.get('/search', auth, async (req, res) => {
//   try {
//     const { q } = req.query;
//     const users = await User.find({ username: { $regex: q, $options: 'i' }, _id: { $ne: req.userId } })
//       .select('username profilePicture bio');
//     res.json(users);
//   } catch {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Get user by ID
// router.get('/:id', auth, async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id).select('-password')
//       .populate('followers', 'username profilePicture')
//       .populate('following', 'username profilePicture');
//     if (!user) return res.status(404).json({ message: 'User not found' });
//     res.json(user);
//   } catch {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Get user posts
// router.get('/:id/posts', auth, async (req, res) => {
//   try {
//     const posts = await Post.find({ author: req.params.id })
//       .sort({ createdAt: -1 })
//       .populate('author', 'username profilePicture')
//       .populate({ path: 'comments', populate: { path: 'author', select: 'username profilePicture' } });
//     res.json(posts);
//   } catch {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Update profile
// router.put('/me', auth, upload.single('profilePicture'), async (req, res) => {
//   try {
//     const { bio, username } = req.body;
//     const update = {};
//     if (bio !== undefined) update.bio = bio;
//     if (username) update.username = username;
//     if (req.file) update.profilePicture = `/uploads/${req.file.filename}`;
//     const user = await User.findByIdAndUpdate(req.userId, update, { new: true }).select('-password');
//     res.json(user);
//   } catch {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Follow / Unfollow
// router.post('/:id/follow', auth, async (req, res) => {
//   try {
//     if (req.params.id === req.userId) return res.status(400).json({ message: "Can't follow yourself" });
//     const target = await User.findById(req.params.id);
//     const me = await User.findById(req.userId);
//     if (!target) return res.status(404).json({ message: 'User not found' });
//     const isFollowing = me.following.includes(req.params.id);
//     if (isFollowing) {
//       me.following.pull(req.params.id);
//       target.followers.pull(req.userId);
//     } else {
//       me.following.push(req.params.id);
//       target.followers.push(req.userId);
//     }
//     await me.save();
//     await target.save();
//     res.json({ following: me.following, followers: target.followers });
//   } catch {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// module.exports = router;


const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// ⚡ NEW: Get all users for sidebar community list
router.get('/all-users', auth, async (req, res) => {
  try {
    // Database se tamam users ke username, email, profilePicture aur createdAt fetch karein
    const users = await User.find({}, 'username email profilePicture createdAt')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch {
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

// Search users
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    const users = await User.find({ username: { $regex: q, $options: 'i' }, _id: { $ne: req.userId } })
      .select('username profilePicture bio');
    res.json(users);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
      .populate('followers', 'username profilePicture')
      .populate('following', 'username profilePicture');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user posts
router.get('/:id/posts', auth, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.id })
      .sort({ createdAt: -1 })
      .populate('author', 'username profilePicture')
      .populate({ path: 'comments', populate: { path: 'author', select: 'username profilePicture' } });
    res.json(posts);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile
// router.put('/me', auth, upload.single('profilePicture'), async (req, res) => {
//   try {
//     const { bio, username } = req.body;
//     const update = {};
//     if (bio !== undefined) update.bio = bio;
//     if (username) update.username = username;
//     if (req.file) update.profilePicture = `/uploads/${req.file.filename}`;
//     const user = await User.findByIdAndUpdate(req.userId, update, { new: true }).select('-password');
//     res.json(user);
//   } catch {
//     res.status(500).json({ message: 'Server error' });
//   }
// });
// Update profile
router.put('/me', auth, upload.single('profilePicture'), async (req, res) => {
  try {
    // profilePicUrl ko req.body se extract kiya jo frontend se aayega
    const { bio, username, profilePicUrl } = req.body;
    const update = {};
    
    if (bio !== undefined) update.bio = bio;
    if (username) update.username = username;
    
    // Check karein ke image file aayi hai ya direct URL link
    if (req.file) {
      // Option 1: Agar user ne device se file select karke bheji hai
      update.profilePicture = `/uploads/${req.file.filename}`;
    } else if (profilePicUrl) {
      // Option 2: Agar user ne DiceBear / AI URL select kiya hai
      update.profilePicture = profilePicUrl;
    }

    const user = await User.findByIdAndUpdate(req.userId, update, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Follow / Unfollow
router.post('/:id/follow', auth, async (req, res) => {
  try {
    if (req.params.id === req.userId) return res.status(400).json({ message: "Can't follow yourself" });
    const target = await User.findById(req.params.id);
    const me = await User.findById(req.userId);
    if (!target) return res.status(404).json({ message: 'User not found' });
    const isFollowing = me.following.includes(req.params.id);
    if (isFollowing) {
      me.following.pull(req.params.id);
      target.followers.pull(req.userId);
    } else {
      me.following.push(req.params.id);
      target.followers.push(req.userId);
    }
    await me.save();
    await target.save();
    res.json({ following: me.following, followers: target.followers });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;