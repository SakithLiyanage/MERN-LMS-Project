const express = require('express');
const router = express.Router();
const {
  getAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  gradeSubmission
} = require('../controllers/assignment.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

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
router.route('/:id/submit')
  .post(protect, authorize('student'), submitAssignment);

// Grading routes
router.route('/:id/grade/:submissionId')
  .put(protect, authorize('teacher', 'admin'), gradeSubmission);

module.exports = router;
