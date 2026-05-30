// const socketManager = (io) => {
//   const onlineUsers = new Map();

//   io.on('connection', (socket) => {
//     socket.on('user_connected', (userId) => {
//       onlineUsers.set(userId, socket.id);
//       io.emit('online_users', [...onlineUsers.keys()]);
//     });

//     socket.on('send_message', (message) => {
//       const receiverSocket = onlineUsers.get(message.receiver._id || message.receiver);
//       if (receiverSocket) io.to(receiverSocket).emit('receive_message', message);
//     });

//     socket.on('typing', ({ to, from }) => {
//       const receiverSocket = onlineUsers.get(to);
//       if (receiverSocket) io.to(receiverSocket).emit('typing', { from });
//     });

//     socket.on('stop_typing', ({ to }) => {
//       const receiverSocket = onlineUsers.get(to);
//       if (receiverSocket) io.to(receiverSocket).emit('stop_typing');
//     });

//     // Notifications
//     socket.on('send_notification', ({ toUserId, notification }) => {
//       const receiverSocket = onlineUsers.get(toUserId);
//       if (receiverSocket) io.to(receiverSocket).emit('notification', notification);
//     });

//     socket.on('disconnect', () => {
//       for (const [userId, socketId] of onlineUsers.entries()) {
//         if (socketId === socket.id) { onlineUsers.delete(userId); break; }
//       }
//       io.emit('online_users', [...onlineUsers.keys()]);
//     });
//   });
// };

// module.exports = { socketManager };


import { io } from "socket.io-client";

const socket = io("https://socialblog-app-backend.vercel.app", {
  transports: ["polling"], // 👈 Yeh line zaroor add karein agar backend Vercel par rakhna hai
  withCredentials: true
});