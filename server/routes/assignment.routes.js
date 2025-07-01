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
  getStudentAssignments,
  getAssignmentsForTeacher
} = require('../controllers/assignment.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/assignments';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Student specific routes - must be before /:id route
router.get('/student', protect, authorize('student'), getStudentAssignments);

// Teacher specific route - must be before /:id route
router.get('/teacher', protect, authorize('teacher', 'admin'), getAssignmentsForTeacher);

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
router.post('/:id/submit', protect, authorize('student'), upload.single('file'), submitAssignment);
router.post('/:id/grade/:submissionId', protect, authorize('teacher', 'admin'), gradeSubmission);

module.exports = router;
