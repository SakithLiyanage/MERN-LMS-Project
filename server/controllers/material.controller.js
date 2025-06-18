const Material = require('../models/material.model');
const Course = require('../models/course.model');
const fs = require('fs');
const path = require('path');

// Helper function to create directories if they don't exist
const ensureDirectoryExists = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

// @desc    Create new material
// @route   POST /api/materials
// @access  Private/Teacher
exports.createMaterial = async (req, res) => {
  try {
    const { title, description, course, type, link, isPublished, order } = req.body;
    
    // Check if user is the teacher of the course
    const courseDoc = await Course.findById(course);
    if (!courseDoc) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (courseDoc.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to add materials to this course' });
    }
    
    let materialData = {
      title,
      description: description || '',
      course,
      teacher: req.user.id,
      type,
      isPublished: isPublished === 'true' || isPublished === true,
      order: order || 0
    };
    
    // Handle link type
    if (type === 'link') {
      if (!link) {
        return res.status(400).json({ message: 'Link URL is required for link type materials' });
      }
      materialData.link = link;
    }
    
    // Handle file types
    else if (['pdf', 'document', 'image', 'video', 'other'].includes(type)) {
      if (!req.files || !req.files.file) {
        return res.status(400).json({ message: 'File upload is required for this material type' });
      }
      
      const file = req.files.file;
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      const filename = `material_${uniqueSuffix}_${file.name.replace(/\s+/g, '_')}`;
      
      // Ensure uploads directory exists
      const uploadsDir = path.join(__dirname, '../uploads/materials');
      ensureDirectoryExists(uploadsDir);
      
      // Save file
      const filepath = path.join(uploadsDir, filename);
      await file.mv(filepath);
      
      materialData.file = `materials/${filename}`;
    }
    
    // Create material
    const material = await Material.create(materialData);
    
    // Add material to course
    await Course.findByIdAndUpdate(
      course,
      { $push: { materials: material._id } },
      { new: true }
    );
    
    res.status(201).json({
      success: true,
      material,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all materials for a course
// @route   GET /api/materials/course/:courseId
// @access  Private
exports.getCourseMaterials = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Check if user has access to course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const isTeacher = course.teacher.toString() === req.user.id;
    const isStudent = course.students.includes(req.user.id);
    
    if (!isTeacher && !isStudent && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access this course' });
    }
    
    // Get materials
    const materials = await Material.find({ course: courseId })
      .sort('order')
      .sort('-createdAt');
    
    // If student, filter out unpublished materials
    const filteredMaterials = isStudent && !isTeacher 
      ? materials.filter(material => material.isPublished)
      : materials;
    
    res.json({
      success: true,
      count: filteredMaterials.length,
      materials: filteredMaterials,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single material
// @route   GET /api/materials/:id
// @access  Private
exports.getMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
      .populate('course', 'title code')
      .populate('teacher', 'name email');
    
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }
    
    // Check if user has access
    const course = await Course.findById(material.course);
    const isTeacher = material.teacher._id.toString() === req.user.id;
    const isStudent = course.students.includes(req.user.id);
    
    if (!isTeacher && !isStudent && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access this material' });
    }
    
    // If student, check if material is published
    if (isStudent && !isTeacher && !material.isPublished) {
      return res.status(403).json({ message: 'This material is not available' });
    }
    
    res.json({
      success: true,
      material,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update material
// @route   PUT /api/materials/:id
// @access  Private/Teacher
exports.updateMaterial = async (req, res) => {
  try {
    let material = await Material.findById(req.params.id);
    
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }
    
    // Check if user is the teacher who created the material
    if (material.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this material' });
    }
    
    // Update material
    const { title, description, isPublished, order } = req.body;
    
    material.title = title || material.title;
    material.description = description !== undefined ? description : material.description;
    material.isPublished = isPublished === 'true' || isPublished === true;
    material.order = order !== undefined ? order : material.order;
    
    await material.save();
    
    res.json({
      success: true,
      material,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete material
// @route   DELETE /api/materials/:id
// @access  Private/Teacher
exports.deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }
    
    // Check if user is the teacher who created the material
    if (material.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this material' });
    }
    
    // Remove material from course
    await Course.findByIdAndUpdate(
      material.course,
      { $pull: { materials: material._id } }
    );
    
    // Delete file if exists
    if (material.file) {
      const filePath = path.join(__dirname, '../uploads', material.file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    // Delete material
    await material.remove();
    
    res.json({
      success: true,
      message: 'Material deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
