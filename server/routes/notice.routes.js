const express = require('express');
const router = express.Router();
const {
  getNotices,
  getNotice,
  createNotice,
  updateNotice,
  deleteNotice,
  getUnreadCount
} = require('../controllers/notice.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Get unread notices count
router.get('/unread', protect, getUnreadCount);

// Get notices for a specific course (this must come before /:id route)
router.get('/course/:courseId', protect, getNotices);

// Get all notices
router.get('/', protect, getNotices);

// Get single notice
router.get('/:id', protect, getNotice);

// Create notice - only teachers and admins
router.post('/', protect, authorize('teacher', 'admin'), createNotice);

// Update notice - only teachers and admins
router.put('/:id', protect, authorize('teacher', 'admin'), updateNotice);

// Delete notice - only teachers and admins
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteNotice);

module.exports = router;
