const express = require('express');
const router = express.Router();
const { 
  createAssignment,
  getTeacherAssignments,
  getStudentAssignments,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  gradeSubmission
} = require('../controllers/assignment.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Teacher routes
router.post('/', protect, authorize('teacher', 'admin'), createAssignment);
router.get('/teacher', protect, authorize('teacher', 'admin'), getTeacherAssignments);
router.put('/:id', protect, authorize('teacher', 'admin'), updateAssignment);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteAssignment);

// Student routes
router.get('/student', protect, authorize('student'), getStudentAssignments);
router.post('/:id/submit', protect, authorize('student'), submitAssignment);

// Routes for both teachers and students
router.get('/:id', protect, getAssignment);

// Grading submissions
router.put('/submissions/:id/grade', protect, authorize('teacher', 'admin'), gradeSubmission);

module.exports = router;
