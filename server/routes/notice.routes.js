const express = require('express');
const router = express.Router();

const {
  getNoticesForCourse,
  getNotice,
  createNotice,
  updateNotice,
  deleteNotice
} = require('../controllers/notice.controller');

const { protect, authorize } = require('../middleware/auth.middleware');

// Route for course-specific notices
router.get('/course/:courseId', protect, getNoticesForCourse);

// Routes for individual notices
router.route('/')
  .post(protect, authorize('teacher', 'admin'), createNotice);

router.route('/:id')
  .get(protect, getNotice)
  .put(protect, authorize('teacher', 'admin'), updateNotice)
  .delete(protect, authorize('teacher', 'admin'), deleteNotice);

module.exports = router;
