const Notice = require('../models/notice.model');
const Course = require('../models/course.model');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

// Helper function to create directories if they don't exist
const ensureDirectoryExists = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

// Add proper CORS handling to allow cross-origin requests
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// @desc    Create new notice
// @route   POST /api/notices
// @access  Private/Teacher
exports.createNotice = async (req, res) => {
  try {
    console.log('Creating notice with data:', req.body);
    const { title, content, courseId, priority, pinned, attachments } = req.body;
    
    // Validate required fields
    if (!title || !content || !courseId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, content and course ID'
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
        message: 'Not authorized to create notices for this course'
      });
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
      courseId,
      author: req.user.id,
      priority: priority || 'low',
      pinned: pinned || false,
      attachments: files
    });
    
    res.status(201).json({
      success: true,
      data: notice
    });
  } catch (error) {
    console.error('Error creating notice:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all notices (global or for a specific course)
// @route   GET /api/notices
// @route   GET /api/notices/course/:courseId
// @access  Private
exports.getNotices = async (req, res) => {
  try {
    // Add logging for debugging
    console.log('Fetching notices with query:', req.query);
    
    let query = {};
    
    // If courseId is provided in query params, filter by course
    if (req.query.courseId) {
      query.courseId = req.query.courseId;
    }
    
    const notices = await Notice.find(query)
      .populate('courseId')
      .populate('userId', 'name email role');
    
    console.log(`Found ${notices.length} notices`);
    
    res.status(200).json({
      success: true,
      count: notices.length,
      data: notices
    });
  } catch (error) {
    console.error('Error fetching notices:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all notices for a course
// @route   GET /api/notices/course/:courseId
// @access  Private
exports.getNoticesForCourse = async (req, res) => {
  try {
    console.log('Getting notices for course:', req.params.courseId);
    
    const notices = await Notice.find({ courseId: req.params.courseId })
      .populate('author', 'name avatar')
      .sort('-pinned -createdAt');
    
    res.status(200).json({
      success: true,
      count: notices.length,
      data: notices
    });
  } catch (error) {
    console.error('Error getting notices:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single notice
// @route   GET /api/notices/:id
// @access  Private
exports.getNotice = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`Fetching notice with id: ${id}`);
    
    const notice = await Notice.findById(id)
      .populate('courseId')
      .populate('userId', 'name email role');
    
    if (!notice) {
      console.log('Notice not found');
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: notice
    });
  } catch (error) {
    console.error('Error fetching notice:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update notice
// @route   PUT /api/notices/:id
// @access  Private/Teacher
exports.updateNotice = async (req, res) => {
  try {
    let notice = await Notice.findById(req.params.id);
    
    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }
    
    // Check course ownership
    const course = await Course.findById(notice.courseId);
    if (course.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this notice'
      });
    }
    
    notice = await Notice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('author', 'name avatar');
    
    res.status(200).json({
      success: true,
      data: notice
    });
  } catch (error) {
    console.error('Error updating notice:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete notice
// @route   DELETE /api/notices/:id
// @access  Private/Teacher
exports.deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    
    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }
    
    // Check course ownership
    const course = await Course.findById(notice.courseId);
    if (course.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this notice'
      });
    }
    
    await Notice.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting notice:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
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