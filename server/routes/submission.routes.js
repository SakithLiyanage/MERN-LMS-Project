const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');

// We'll use the existing assignment controller for submission operations
const { 
  getSubmission,
  gradeSubmission,
  deleteSubmission
} = require('../controllers/submission.controller');

// Routes for submissions
router.get('/:id', protect, getSubmission);
router.put('/:id/grade', protect, authorize('teacher', 'admin'), gradeSubmission);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteSubmission);

module.exports = router;
