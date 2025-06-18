const Assignment = require('../models/assignment.model');
const Course = require('../models/course.model');
const Notice = require('../models/notice.model');
const Quiz = require('../models/quiz.model');

// @desc    Get recent activities for dashboard
// @route   GET /api/activities/recent
// @access  Private
exports.getRecentActivities = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Different queries based on user role
    let activities = [];
    const limit = 10; // Limit number of activities
    
    if (userRole === 'teacher') {
      // For teachers, get their created content
      const [assignments, notices, quizzes, courses] = await Promise.all([
        Assignment.find({ teacher: userId }).sort('-createdAt').limit(limit)
          .select('title createdAt').lean(),
        Notice.find({ createdBy: userId }).sort('-createdAt').limit(limit)
          .select('title createdAt').lean(),
        Quiz.find({ teacher: userId }).sort('-createdAt').limit(limit)
          .select('title createdAt').lean(),
        Course.find({ teacher: userId }).sort('-createdAt').limit(limit)
          .select('title createdAt').lean()
      ]);
      
      // Add type field for frontend display
      const formattedAssignments = assignments.map(a => ({ ...a, type: 'assignment' }));
      const formattedNotices = notices.map(n => ({ ...n, type: 'notice' }));
      const formattedQuizzes = quizzes.map(q => ({ ...q, type: 'quiz' }));
      const formattedCourses = courses.map(c => ({ ...c, type: 'course' }));
      
      activities = [...formattedAssignments, ...formattedNotices, 
                   ...formattedQuizzes, ...formattedCourses]
                   .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                   .slice(0, limit);
    } else if (userRole === 'student') {
      // For students, get content from their enrolled courses
      const [assignments, notices, quizzes] = await Promise.all([
        Assignment.find({ course: { $in: req.user.courses } })
          .sort('-createdAt').limit(limit)
          .select('title createdAt course').populate('course', 'title').lean(),
        Notice.find({ course: { $in: req.user.courses } })
          .sort('-createdAt').limit(limit)
          .select('title createdAt course').populate('course', 'title').lean(),
        Quiz.find({ course: { $in: req.user.courses } })
          .sort('-createdAt').limit(limit)
          .select('title createdAt course').populate('course', 'title').lean()
      ]);
      
      const formattedAssignments = assignments.map(a => ({ ...a, type: 'assignment' }));
      const formattedNotices = notices.map(n => ({ ...n, type: 'notice' }));
      const formattedQuizzes = quizzes.map(q => ({ ...q, type: 'quiz' }));
      
      activities = [...formattedAssignments, ...formattedNotices, ...formattedQuizzes]
                   .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                   .slice(0, limit);
    }
    
    res.json({
      success: true,
      count: activities.length,
      activities
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent activities'
    });
  }
};
