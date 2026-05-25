const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: '' },
  bio: { type: String, default: '' },
  // User.js ke schema fields ke andar add karein
bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }],
starred: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });



module.exports = mongoose.model('User', userSchema);