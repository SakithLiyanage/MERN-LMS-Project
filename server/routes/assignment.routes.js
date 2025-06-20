const express = require('express');
const router = express.Router();
const {
  getAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  gradeSubmission,
  getTeacherAssignments
} = require('../controllers/assignment.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Basic routes
router.route('/')
  .get(protect, getAssignments)
  .post(protect, authorize('teacher', 'admin'), createAssignment);

// Ensure the teacher route comes before the :id parameter route
router.get('/teacher', protect, authorize('teacher', 'admin'), getTeacherAssignments);

// Regular route for getting assignment by ID
router.get('/:id', protect, getAssignment);

// Single assignment routes
router.route('/:id')
  .put(protect, authorize('teacher', 'admin'), updateAssignment)
  .delete(protect, authorize('teacher', 'admin'), deleteAssignment);

// Submission routes
router.route('/:id/submit')
  .post(protect, authorize('student'), submitAssignment);

// Grading routes
router.route('/:id/grade/:submissionId')
  .put(protect, authorize('teacher', 'admin'), gradeSubmission);

module.exports = router;
