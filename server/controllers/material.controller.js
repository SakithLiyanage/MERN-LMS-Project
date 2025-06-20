const Material = require('../models/material.model');
const Course = require('../models/course.model');
const fs = require('fs');
const path = require('path');

// @desc    Get all materials for a course
// @route   GET /api/materials/course/:courseId
// @access  Private
exports.getMaterialsForCourse = async (req, res) => {
  try {
    console.log('Getting materials for course:', req.params.courseId);
    
    const materials = await Material.find({ courseId: req.params.courseId })
      .populate('author', 'name avatar')
      .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: materials.length,
      materials: materials
    });
  } catch (error) {
    console.error('Error getting materials:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single material
// @route   GET /api/materials/:id
// @access  Private
exports.getMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
      .populate('author', 'name avatar')
      .populate('courseId', 'title code');
    
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }
    
    res.status(200).json({
      success: true,
      material: material
    });
  } catch (error) {
    console.error('Error getting material:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new material
// @route   POST /api/materials
// @access  Private/Teacher
exports.createMaterial = async (req, res) => {
  try {
    console.log('Creating material with data:', req.body);
    const { title, description, courseId, type, link } = req.body;
    let fileUrl = '';
    let fileName = '';
    let fileType = '';
    let fileSize = 0;
    
    // Validate required fields
    if (!title || !courseId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and course ID'
      });
    }
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check if user is the teacher of the course
    if (course.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add materials to this course'
      });
    }
    
    // Process file upload if present
    if (req.file) {
      fileUrl = req.file.path;
      fileName = req.file.originalname;
      fileType = req.file.mimetype;
      fileSize = req.file.size;
    }
    
    // Create material
    const material = await Material.create({
      title,
      description,
      courseId,
      author: req.user.id,
      type,
      fileUrl,
      fileName,
      fileType,
      fileSize,
      link
    });
    
    // Add material to course
    course.materials.push(material._id);
    await course.save();
    
    res.status(201).json({
      success: true,
      material: material
    });
  } catch (error) {
    console.error('Error creating material:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update material
// @route   PUT /api/materials/:id
// @access  Private/Teacher
exports.updateMaterial = async (req, res) => {
  try {
    let material = await Material.findById(req.params.id);
    
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }
    
    // Check course ownership
    const course = await Course.findById(material.courseId);
    if (course.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this material'
      });
    }
    
    material = await Material.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('author', 'name avatar');
    
    res.status(200).json({
      success: true,
      material: material
    });
  } catch (error) {
    console.error('Error updating material:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete material
// @route   DELETE /api/materials/:id
// @access  Private/Teacher
exports.deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }
    
    // Check course ownership
    const course = await Course.findById(material.courseId);
    if (course.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this material'
      });
    }
    
    // Remove material from course
    course.materials = course.materials.filter(
      id => id.toString() !== material._id.toString()
    );
    await course.save();
    
    // Delete file if it exists
    if (material.fileUrl) {
      const filePath = path.join(__dirname, '..', material.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    // Delete material
    await Material.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting material:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
    
   