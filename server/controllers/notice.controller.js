const Notice = require('../models/notice.model');
const Course = require('../models/course.model');
const fs = require('fs');
const path = require('path');

// Helper function to create directories if they don't exist
const ensureDirectoryExists = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

// @desc    Create new notice
// @route   POST /api/notices
// @access  Private/Teacher
exports.createNotice = async (req, res) => {
  try {
    const { title, content, course, priority, pinned } = req.body;
    
    if (course) {
      // Check if user is the teacher of the course
      const courseDoc = await Course.findById(course);
      if (!courseDoc) {
        return res.status(404).json({ message: 'Course not found' });
      }
      
      if (courseDoc.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to create notices for this course' });
      }
    }
    
    let files = [];
    
    // Handle file uploads
    if (req.files && req.files.attachments) {
      const attachments = Array.isArray(req.files.attachments) 
        ? req.files.attachments 
        : [req.files.attachments];
        
      // Ensure uploads directory exists
      const uploadsDir = path.join(__dirname, '../uploads/notices');
      ensureDirectoryExists(uploadsDir);
      
      // Save each file
      for (const file of attachments) {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const filename = `notice_${uniqueSuffix}_${file.name.replace(/\s+/g, '_')}`;
        const filepath = path.join(uploadsDir, filename);
        
        await file.mv(filepath);
        files.push(`notices/${filename}`);
      }
    }
    
    // Create notice
    const notice = await Notice.create({
      title,
      content,
      course: course || null,
      author: req.user.id,
      priority: priority || 'medium',
      pinned: pinned === 'true' || pinned === true,
      attachments: files
    });
    
    // Add notice to course if applicable
    if (course) {
      await Course.findByIdAndUpdate(
        course,
        { $push: { notices: notice._id } },
        { new: true }
      );
    }
    
    res.status(201).json({
      success: true,
      notice,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all notices (global or for a specific course)
// @route   GET /api/notices
// @route   GET /api/notices/course/:courseId
// @access  Private
exports.getNotices = async (req, res) => {
  try {
    const { courseId } = req.params;
    let query = {};
    
    if (courseId) {
      // Check if user has access to this course
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      
      const isTeacher = course.teacher.toString() === req.user.id;
      const isEnrolledStudent = course.students.includes(req.user.id);
      
      if (!isTeacher && !isEnrolledStudent && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to access this course' });
      }
      
      query.course = courseId;
    } else {
      // For global notices, only get ones with no course
      query.course = null;
    }
    
    // Get notices with sorting: pinned first, then by date (newest)
    const notices = await Notice.find(query)
      .populate('author', 'name email')
      .sort('-pinned')
      .sort('-createdAt');
    
    // Mark notices as read for this user if not already read
    for (const notice of notices) {
      if (!notice.readBy.includes(req.user.id)) {
        notice.readBy.push(req.user.id);
        await notice.save();
      }
    }
    
    res.json({
      success: true,
      count: notices.length,
      notices,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single notice
// @route   GET /api/notices/:id
// @access  Private
exports.getNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id)
      .populate('author', 'name email');
    
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }
    
    // Check if user has access if this is a course-specific notice
    if (notice.course) {
      const course = await Course.findById(notice.course);
      if (!course) {
        return res.status(404).json({ message: 'Associated course not found' });
      }
      
      const isTeacher = course.teacher.toString() === req.user.id;
      const isEnrolledStudent = course.students.includes(req.user.id);
      
      if (!isTeacher && !isEnrolledStudent && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to access this notice' });
      }
    }
    
    // Mark as read if not already read
    if (!notice.readBy.includes(req.user.id)) {
      notice.readBy.push(req.user.id);
      await notice.save();
    }
    
    res.json({
      success: true,
      notice,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update notice
// @route   PUT /api/notices/:id
// @access  Private/Teacher
exports.updateNotice = async (req, res) => {
  try {
    let notice = await Notice.findById(req.params.id);
    
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }
    
    // Check if user is the author of the notice
    if (notice.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this notice' });
    }
    
    // Update fields
    const { title, content, priority, pinned } = req.body;
    
    if (title) notice.title = title;
    if (content) notice.content = content;
    if (priority) notice.priority = priority;
    if (pinned !== undefined) notice.pinned = pinned === 'true' || pinned === true;
    
    // Save updated notice
    await notice.save();
    
    res.json({
      success: true,
      notice,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete notice
// @route   DELETE /api/notices/:id
// @access  Private/Teacher
exports.deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }
    
    // Check if user is the author of the notice
    if (notice.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this notice' });
    }
    
    // Remove notice from course if applicable
    if (notice.course) {
      await Course.findByIdAndUpdate(
        notice.course,
        { $pull: { notices: notice._id } }
      );
    }
    
    // Delete attachment files
    if (notice.attachments && notice.attachments.length > 0) {
      for (const file of notice.attachments) {
        const filePath = path.join(__dirname, '../uploads', file);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }
    
    // Delete notice
    await notice.remove();
    
    res.json({
      success: true,
      message: 'Notice deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get unread notices count
// @route   GET /api/notices/unread
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    // Find courses the user is in
    let courseQuery = {};
    
    if (req.user.role === 'student') {
      courseQuery.students = req.user.id;
    } else if (req.user.role === 'teacher') {
      courseQuery.teacher = req.user.id;
    }
    
    const courses = await Course.find(courseQuery);
    const courseIds = courses.map(course => course._id);
    
    // Find notices that the user has not read yet
    const unreadNoticesCount = await Notice.countDocuments({
      $and: [
        { readBy: { $ne: req.user.id } },
        {
          $or: [
            { course: { $in: courseIds } },
            { course: null } // Global notices
          ]
        }
      ]
    });
    
    res.json({
      success: true,
      unreadCount: unreadNoticesCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
