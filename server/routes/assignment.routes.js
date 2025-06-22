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
  getStudentAssignments
} = require('../controllers/assignment.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Student specific routes - must be before /:id route
router.get('/student', protect, authorize('student'), getStudentAssignments);

// Basic routes
router.route('/')
  .get(protect, getAssignments)
  .post(protect, authorize('teacher', 'admin'), createAssignment);

// Single assignment routes
router.route('/:id')
  .get(protect, getAssignment)
  .put(protect, authorize('teacher', 'admin'), updateAssignment)
  .delete(protect, authorize('teacher', 'admin'), deleteAssignment);

// Submission routes
router.post('/:id/submit', protect, authorize('student'), submitAssignment);
router.post('/:id/grade/:submissionId', protect, authorize('teacher', 'admin'), gradeSubmission);

module.exports = router;
