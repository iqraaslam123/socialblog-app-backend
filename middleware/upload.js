// const multer = require('multer');
// const path = require('path');

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, 'uploads/'),
//   filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
// });

// const fileFilter = (req, file, cb) => {
//   const allowed = /jpeg|jpg|png|gif|webp/;
//   cb(null, allowed.test(file.mimetype));
// };

// module.exports = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary Storage Settings
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'social_blog_app', // Cloudinary par is naam ka folder ban jayega
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  cb(null, allowed.test(file.mimetype));
};

module.exports = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });