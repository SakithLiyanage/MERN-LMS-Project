const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
  getMaterialsForCourse,
  getMaterial,
  createMaterial,
  updateMaterial,
  deleteMaterial
} = require('../controllers/material.controller');

const { protect, authorize } = require('../middleware/auth.middleware');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/materials';
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Create unique filename with original extension
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allow common document/media types
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

// Setup upload
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Routes
router.get('/course/:courseId', protect, getMaterialsForCourse);
router.get('/:id', protect, getMaterial);

// Create with file upload
router.post(
  '/',
  protect,
  authorize('teacher', 'admin'),
  upload.single('file'),
  createMaterial
);

router.put('/:id', protect, authorize('teacher', 'admin'), updateMaterial);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteMaterial);

module.exports = router;
