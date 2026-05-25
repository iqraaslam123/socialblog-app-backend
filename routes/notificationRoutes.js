// routes/notificationRoutes.js
const express = require('express');
const { getNotifications, markNotificationsAsRead } = require('../controllers/notificationController');

const router = express.Router();

router.get('/:userId', getNotifications);
router.put('/mark-read/:userId', markNotificationsAsRead);

module.exports = router;