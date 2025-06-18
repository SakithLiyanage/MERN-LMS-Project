const express = require('express');
const router = express.Router();
const { 
  createMaterial,
  getCourseMaterials,
  getMaterial,
  updateMaterial,
  deleteMaterial
} = require('../controllers/material.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Teacher routes
router.post('/', protect, authorize('teacher', 'admin'), createMaterial);
router.put('/:id', protect, authorize('teacher', 'admin'), updateMaterial);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteMaterial);

// Routes for both teachers and students
router.get('/course/:courseId', protect, getCourseMaterials);
router.get('/:id', protect, getMaterial);

module.exports = router;
