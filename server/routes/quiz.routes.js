const express = require('express');
const router = express.Router();
const { 
  createQuiz,
  getTeacherQuizzes,
  getStudentQuizzes,
  getQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
  getQuizResult,
  getCourseQuizzes
} = require('../controllers/quiz.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Course specific routes (must be before /:id routes to avoid conflicts)
router.get('/course/:courseId', protect, getCourseQuizzes);

// Teacher routes
router.post('/', protect, authorize('teacher', 'admin'), createQuiz);
router.get('/teacher', protect, authorize('teacher', 'admin'), getTeacherQuizzes);
router.put('/:id', protect, authorize('teacher', 'admin'), updateQuiz);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteQuiz);

// Student routes
router.get('/student', protect, authorize('student'), getStudentQuizzes);
router.post('/:id/submit', protect, authorize('student'), submitQuiz);
router.get('/:id/result', protect, getQuizResult);

// Single quiz routes
router.route('/:id')
  .get(protect, getQuiz);

// Routes for both teachers and students
// router.get('/:id', protect, getQuiz);

module.exports = router;
