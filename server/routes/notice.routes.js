const express = require('express');
const router = express.Router();
const { 
  createNotice,
  getNotices,
  getNotice,
  updateNotice,
  deleteNotice,
  getUnreadCount
} = require('../controllers/notice.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Teacher routes
router.post('/', protect, authorize('teacher', 'admin'), createNotice);
router.put('/:id', protect, authorize('teacher', 'admin'), updateNotice);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteNotice);

// Routes for both teachers and students
router.get('/', protect, getNotices);
router.get('/course/:courseId', protect, getNotices);
router.get('/unread', protect, getUnreadCount);
router.get('/:id', protect, getNotice);

module.exports = router;
