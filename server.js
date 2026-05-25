
// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');
const fs = require('fs');

// Environment Setup Configuration
dotenv.config();

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');
const notificationRoutes = require('./routes/notificationRoutes'); // 🟢 Fixed: Changed from import to require
const { socketManager } = require('./socket/socketManager');

const app = express();
const server = http.createServer(app);

// PERFECTED SOCKET CONNECTIONS CORNERSTONE WITH FALLBACK PROTOCOLS
const io = socketio(server, {
  cors: { 
    cors: { 
  origin: [
    'https://socialblog-app-frontend.vercel.app', // Live Frontend URL
    'http://localhost:5173'                        // Local Frontend URL
  ], 
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"] // Baki methods bhi handle ho jayein ge
}
  },
  transports: ['polling', 'websocket'], // Step 1: Handshake, Step 2: Instant Upgrade
  allowEIO3: true // Backward compatibility support frameworks
});

// Uploads Production Workspace Sync
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Global Middlewares Pipeline
app.use(cors({ 
  origin: process.env.CLIENT_URL || 'http://localhost:5173', 
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

// Application API Endpoints Matrix
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes); // 🟢 Notification Route Registered

// Root Diagnostics Node Vector (Optional but great for checking server status)
app.get('/', (req, res) => {
  res.json({ message: "MERN Stack Core Server Ecosystem Active 🚀" });
});

// Real-time Event Management Pipeline Execution
socketManager(io);

// Database Authentication Engine Node
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('🎯 MongoDB Connected Successfully'))
  .catch(err => console.error('❌ MongoDB Connection Handshake Error:', err));

// Port Initialization Stream
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`📡 Production Stream running smoothly on port: ${PORT}`);
});