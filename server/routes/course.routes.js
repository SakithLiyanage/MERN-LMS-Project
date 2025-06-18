const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getTeacherCourses // Add this new controller function
} = require('../controllers/course.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Public routes
router.get('/', getCourses);
router.get('/:id', getCourse);

// Teacher specific routes
router.get('/teacher', protect, authorize('teacher', 'admin'), getTeacherCourses);

// Protected routes - only for teachers and admins
router.post('/', protect, authorize('teacher', 'admin'), createCourse);
router.put('/:id', protect, authorize('teacher', 'admin'), updateCourse);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteCourse);

module.exports = router;
