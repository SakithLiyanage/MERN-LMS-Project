const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    
    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
exports.getUser = async (req, res) => {
  try {
    // User is already available in req.user from auth middleware
    const user = await User.findById(req.user.id).select('-password')
                       .populate('courses', 'title code');
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/me
// @access  Private
exports.updateUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // Check if email already exists for a different user
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update password
// @route   PUT /api/users/me/password
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Check if required fields are provided
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }
    
    // Get user with password
    const user = await User.findById(req.user.id).select('+password');
    
    // Check if current password is correct
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await user.remove();
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get courses for current student
// @route   GET /api/users/me/courses
// @access  Private/Student
exports.getEnrolledCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('courses');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      courses: user.courses || []
    });
  } catch (error) {
    console.error('Error getting enrolled courses:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching enrolled courses',
      error: error.message
    });
  }
};

// @desc    Student dashboard summary
// @route   GET /api/users/me/dashboard
// @access  Private/Student
exports.getStudentDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').populate('courses');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Fetch assignments, quizzes, quiz results, notices
    const [assignments, quizzes, quizResults, notices] = await Promise.all([
      // Assignments for enrolled courses
      require('../models/assignment.model').find({ course: { $in: user.courses.map(c => c._id) } }),
      // Quizzes for enrolled courses
      require('../models/quiz.model').find({ course: { $in: user.courses.map(c => c._id) } }),
      // Quiz results for this student
      require('../models/quiz.model').aggregate([
        { $unwind: '$results' },
        { $match: { 'results.student': user._id } },
        { $project: { quizId: '$_id', title: '$title', score: '$results.score', totalPoints: '$results.totalPoints', completedAt: '$results.completedAt' } }
      ]),
      // Notices for enrolled courses
      require('../models/notice.model').find({ courseId: { $in: user.courses.map(c => c._id) } })
    ]);

    res.json({
      success: true,
      profile: user,
      courses: user.courses,
      assignments,
      quizzes,
      quizResults,
      notices
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Teacher dashboard summary
// @route   GET /api/users/me/dashboard-teacher
// @access  Private/Teacher
exports.getTeacherDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Fetch courses taught by teacher
    const courses = await require('../models/course.model').find({ teacher: user._id });
    const courseIds = courses.map(c => c._id);

    // Fetch assignments, quizzes, notices for these courses
    const [assignments, quizzes, notices] = await Promise.all([
      require('../models/assignment.model').find({ course: { $in: courseIds } }),
      require('../models/quiz.model').find({ course: { $in: courseIds } }),
      require('../models/notice.model').find({ courseId: { $in: courseIds } })
    ]);

    // Student stats: total students across all courses
    const students = await require('../models/user.model').countDocuments({ courses: { $in: courseIds }, role: 'student' });

    res.json({
      success: true,
      profile: user,
      courses,
      assignments,
      quizzes,
      notices,
      studentCount: students
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
