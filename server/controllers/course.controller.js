const Course = require('../models/course.model');
const User = require('../models/user.model'); // Add this import for updating user's courses

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res) => {
  try {
    let courses;
    
    if (req.user.role === 'teacher') {
      // Teachers see only their created courses
      courses = await Course.find({ teacher: req.user.id })
        .populate('teacher', 'name email')
        .populate('students', 'name email avatar')
        .sort('-createdAt');
    } else {
      // Students see enrolled courses
      courses = await Course.find({ students: req.user.id })
        .populate('teacher', 'name email')
        .sort('-createdAt');
    }
    
    res.json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('teacher', 'name email avatar')
      .populate('students', 'name email avatar')
      .populate('materials')
      .populate('assignments')
      .populate('quizzes')
      .populate('notices');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if user is teacher of this course or enrolled student
    const isTeacher = course.teacher._id.toString() === req.user.id;
    const isStudent = course.students.some(
      student => student._id.toString() === req.user.id
    );
    
    if (!isTeacher && !isStudent && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access this course' });
    }
    
    res.json({
      success: true,
      course,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private/Teacher
exports.createCourse = async (req, res) => {
  try {
    console.log('Create course request received:', req.body);
    console.log('User from auth middleware:', req.user);
    
    const { title, description, code } = req.body;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Course title is required'
      });
    }
    
    // Create course with user as teacher
    const course = await Course.create({
      title,
      description,
      code,
      teacher: req.user.id
    });
    
    // Add course to teacher's courses array
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { courses: course._id } }
    );
    
    res.status(201).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Course creation error:', error);
    
    // Handle duplicate course code
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Course with that code already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create course',
      error: error.message
    });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Teacher/Admin
exports.updateCourse = async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if user is course teacher
    if (course.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }
    
    // Update course
    course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      course,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Teacher/Admin
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if user is course teacher
    if (course.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this course' });
    }
    
    // Remove course from all users
    await User.updateMany(
      { courses: course._id },
      { $pull: { courses: course._id } }
    );
    
    // Delete course
    await course.remove();
    
    res.json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Enroll in course
// @route   POST /api/courses/:id/enroll
// @access  Private/Student
exports.enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if student is already enrolled
    if (course.students.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }
    
    // Add student to course
    course.students.push(req.user.id);
    await course.save();
    
    // Add course to student's courses
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { courses: course._id } },
      { new: true }
    );
    
    res.json({
      success: true,
      message: 'Successfully enrolled in course',
      course,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get courses taught by a teacher
// @route   GET /api/courses/teacher
// @access  Private/Teacher
exports.getTeacherCourses = async (req, res) => {
  try {
    const courses = await Course.find({ teacher: req.user.id })
      .sort({ createdAt: -1 })
      .populate('teacher', 'name email');
    
    res.json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    console.error('Error fetching teacher courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses'
    });
  }
};
