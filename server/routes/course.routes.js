const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getTeacherCourses,
  enrollCourse
} = require('../controllers/course.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// IMPORTANT: The order of routes is important for Express
// More specific routes should come before dynamic routes (those with parameters)

// Public route - no authentication required
router.get('/', getCourses);

// Teacher-specific route - must be before /:id route
router.get('/teacher', protect, authorize('teacher'), getTeacherCourses);

// Course by ID - protected 
router.get('/:id', protect, getCourse);
router.post('/:id/enroll', protect, authorize('student'), enrollCourse);
router.put('/:id', protect, authorize('teacher'), updateCourse);
router.delete('/:id', protect, authorize('teacher'), deleteCourse);

// Course creation
router.post('/', protect, authorize('teacher'), createCourse);

module.exports = router;
