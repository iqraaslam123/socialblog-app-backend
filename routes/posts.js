const express = require('express');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification'); // 🟢 Added Notification Model
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const fs = require('fs');
const router = express.Router();

// Create post
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { text } = req.body;
    // const image = req.file ? `/uploads/${req.file.filename}` : '';
    // Create post
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { text } = req.body;
    // 🟢 CHANGED: req.file.path ab direct Cloudinary ka secure URL dega
    // const image = req.file ? req.file.path : ''; 
// Edit post
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.userId) return res.status(403).json({ message: 'Unauthorized' });
    if (req.body.text !== undefined) post.text = req.body.text;
    
    // 🟢 CHANGED: Local path ki jagah Cloudinary URL save hoga
    if (req.file) post.image = req.file.path; 
    
    await post.save();
    await post.populate('author', 'username profilePicture');
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'server errorss' });
  }
});
    
    const post = new Post({ author: req.userId, text, image });
    await post.save();
    await post.populate('author', 'username profilePicture');
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'server errorss' });
  }
});
    
    const post = new Post({ author: req.userId, text, image });
    await post.save();
    await post.populate('author', 'username profilePicture');
    res.status(201).json(post);
  } catch {
    res.status(500).json({ message: 'server errors' });
  }
});

// Get all posts (feed)
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('author', 'username profilePicture')
      .populate({ path: 'comments', populate: { path: 'author', select: 'username profilePicture' } });
    res.json(posts);
  } catch {
    res.status(500).json({ message: 'server errors' });
  }
});

// Get single post
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username profilePicture')
      .populate({ path: 'comments', populate: { path: 'author', select: 'username profilePicture' } });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch {
    res.status(500).json({ message: 'server errors' });
  }
});

// Delete post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.userId) return res.status(403).json({ message: 'Unauthorized' });
    if (post.image) {
      const filePath = `.${post.image}`;
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await Post.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ post: req.params.id });
    res.json({ message: 'Post deleted' });
  } catch {
    res.status(500).json({ message: 'server errors' });
  }
});

// Edit post
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.userId) return res.status(403).json({ message: 'Unauthorized' });
    if (req.body.text !== undefined) post.text = req.body.text;
    if (req.file) post.image = `/uploads/${req.file.filename}`;
    await post.save();
    await post.populate('author', 'username profilePicture');
    res.json(post);
  } catch {
    res.status(500).json({ message: 'server errors' });
  }
});

// Like / Unlike with Notification Trigger
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    const liked = post.likes.includes(req.userId);
    if (liked) {
      post.likes.pull(req.userId);
    } else {
      post.likes.push(req.userId);
      
      // 🟢 Like Notification (Sirf tab banegi agar apna hi post na ho)
      if (post.author.toString() !== req.userId) {
        await Notification.create({
          receiver: post.author,
          sender: req.userId,
          type: 'like',
          blog: post._id
        });
      }
    }
    await post.save();
    res.json({ likes: post.likes });
  } catch {
    res.status(500).json({ message: 'server errors' });
  }
});

// Add comment with Notification Trigger
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    const comment = new Comment({ post: req.params.id, author: req.userId, text: req.body.text });
    await comment.save();
    post.comments.push(comment._id);
    await post.save();
    
    // 🟢 Comment Notification
    if (post.author.toString() !== req.userId) {
      await Notification.create({
        receiver: post.author,
        sender: req.userId,
        type: 'comment',
        blog: post._id
      });
    }

    await comment.populate('author', 'username profilePicture');
    res.status(201).json(comment);
  } catch {
    res.status(500).json({ message: 'server errors' });
  }
});

// Get comments
router.get('/:id/comments', auth, async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate('author', 'username profilePicture')
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch {
    res.status(500).json({ message: 'server errors' });
  }
});

// 🟢 NEW: Share Text Trigger Notification
router.post('/:id/share-trigger', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.author.toString() !== req.userId) {
      await Notification.create({
        receiver: post.author,
        sender: req.userId,
        type: 'share',
        blog: post._id
      });
    }
    res.json({ message: 'Share tracked successfully' });
  } catch {
    res.status(500).json({ message: 'server errors' });
  }
});

// 🟢 NEW: Bookmark Toggle Action Notification
router.post('/:id/bookmark-trigger', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.author.toString() !== req.userId) {
      await Notification.create({
        receiver: post.author,
        sender: req.userId,
        type: 'bookmark',
        blog: post._id
      });
    }
    res.json({ message: 'Bookmark notification generated' });
  } catch {
    res.status(500).json({ message: 'server errors' });
  }
});

// 🟢 NEW: Star Toggle Action Notification
router.post('/:id/star-trigger', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.author.toString() !== req.userId) {
      await Notification.create({
        receiver: post.author,
        sender: req.userId,
        type: 'star',
        blog: post._id
      });
    }
    res.json({ message: 'Star notification generated' });
  } catch {
    res.status(500).json({ message: 'server errors' });
  }
});

module.exports = router;