const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, createNotification } = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth.middleware');

// Get all notifications for the logged-in user
router.get('/', protect, getNotifications);
// Mark a notification as read
router.put('/:id/read', protect, markAsRead);
// Create a notification
router.post('/', protect, createNotification);

module.exports = router; 