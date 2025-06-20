const Assignment = require('../models/assignment.model');
const Course = require('../models/course.model');

// @desc    Get all assignments
// @route   GET /api/assignments
// @access  Private
exports.getAssignments = async (req, res) => {
  try {
    console.log('Getting assignments');
    let assignments;
    
    if (req.user.role === 'teacher') {
      // Teachers see assignments for their courses
      const teacherCourses = await Course.find({ teacher: req.user.id }).select('_id');
      const courseIds = teacherCourses.map(course => course._id);
      
      assignments = await Assignment.find({ courseId: { $in: courseIds } })
        .populate('courseId', 'title code')
        .sort('-createdAt');
    } else if (req.user.role === 'student') {
      // Students see assignments for courses they're enrolled in
      const studentCourses = await Course.find({ students: req.user.id }).select('_id');
      const courseIds = studentCourses.map(course => course._id);
      
      assignments = await Assignment.find({ courseId: { $in: courseIds } })
        .populate('courseId', 'title code')
        .sort('-createdAt');
    } else {
      // Admins see all assignments
      assignments = await Assignment.find()
        .populate('courseId', 'title code')
        .sort('-createdAt');
    }
    
    res.status(200).json({
      success: true,
      count: assignments.length,
      assignments: assignments
    });
  } catch (error) {
    console.error('Error getting assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single assignment
// @route   GET /api/assignments/:id
// @access  Private
exports.getAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Special case for "teacher" route parameter
    if (id === 'teacher') {
      // Get assignments created by teachers
      const assignments = await Assignment.find({ role: 'teacher' })
        .populate('courseId')
        .populate('userId', 'name email');
      
      return res.status(200).json({
        success: true,
        assignments: assignments,
      });
    }
    
    // Regular case - find by ID
    const assignment = await Assignment.findById(id)
      .populate('courseId')
      .populate('userId', 'name email');
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    res.status(200).json({
      success: true,
      assignment: assignment,
    });
  } catch (error) {
    console.error('Error getting assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Create new assignment
// @route   POST /api/assignments
// @access  Private/Teacher
exports.createAssignment = async (req, res) => {
  try {
    console.log('Create assignment request:', req.body);
    const { title, description, courseId, dueDate, totalPoints, attachments } = req.body;
    
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
        message: 'Not authorized to create assignments for this course'
      });
    }
    
    // Create assignment
    const assignment = await Assignment.create({
      title,
      description,
      courseId,
      dueDate,
      totalPoints: totalPoints || 100,
      attachments: attachments || [],
      createdBy: req.user.id
    });
    
    // Add assignment to course
    course.assignments.push(assignment._id);
    await course.save();
    
    res.status(201).json({
      success: true,
      assignment: assignment
    });
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private/Teacher
exports.updateAssignment = async (req, res) => {
  try {
    let assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }
    
    // Check course ownership
    const course = await Course.findById(assignment.courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check if user is authorized
    if (course.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this assignment'
      });
    }
    
    assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      assignment: assignment
    });
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private/Teacher
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }
    
    // Check course ownership
    const course = await Course.findById(assignment.courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check if user is authorized
    if (course.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this assignment'
      });
    }
    
    // Remove assignment from course
    course.assignments = course.assignments.filter(
      id => id.toString() !== assignment._id.toString()
    );
    await course.save();
    
    // Delete assignment
    await Assignment.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Submit assignment
// @route   POST /api/assignments/:id/submit
// @access  Private/Student
exports.submitAssignment = async (req, res) => {
  try {
    const { content, attachments } = req.body;
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }
    
    // Check if due date has passed
    if (assignment.dueDate && new Date(assignment.dueDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Assignment due date has passed'
      });
    }
    
    // Check if student is enrolled in the course
    const course = await Course.findById(assignment.courseId);
    const isEnrolled = course.students.some(
      student => student.toString() === req.user.id
    );
    
    if (!isEnrolled && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }
    
    // Check if submission already exists
    const existingSubmission = assignment.submissions.find(
      sub => sub.student.toString() === req.user.id
    );
    
    if (existingSubmission) {
      // Update existing submission
      existingSubmission.content = content;
      existingSubmission.attachments = attachments || [];
      existingSubmission.submittedAt = Date.now();
      // Reset grade info on resubmission
      existingSubmission.grade = undefined;
      existingSubmission.feedback = undefined;
      existingSubmission.gradedAt = undefined;
    } else {
      // Add new submission
      assignment.submissions.push({
        student: req.user.id,
        content,
        attachments: attachments || [],
        submittedAt: Date.now()
      });
    }
    
    await assignment.save();
    
    res.status(200).json({
      success: true,
      message: 'Assignment submitted successfully',
      assignment: assignment
    });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Grade submission
// @route   PUT /api/assignments/:id/grade/:submissionId
// @access  Private/Teacher
exports.gradeSubmission = async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }
    
    // Check course ownership
    const course = await Course.findById(assignment.courseId);
    if (course.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to grade submissions for this assignment'
      });
    }
    
    // Find submission by ID
    const submission = assignment.submissions.id(req.params.submissionId);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }
    
    // Update submission with grade and feedback
    submission.grade = grade;
    submission.feedback = feedback;
    submission.gradedAt = Date.now();
    submission.gradedBy = req.user.id;
    
    await assignment.save();
    
    res.status(200).json({
      success: true,
      message: 'Submission graded successfully',
      submission: submission,
    });
  } catch (error) {
    console.error('Error grading submission:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get recent assignments for teacher
// @route   GET /api/assignments/teacher/recent
// @access  Private/Teacher
exports.getTeacherRecentAssignments = async (req, res) => {
  try {
    // Get courses taught by this teacher
    const courses = await Course.find({ teacher: req.user.id });
    const courseIds = courses.map(course => course._id);
    
    // Get recent assignments from those courses
    const assignments = await Assignment.find({ courseId: { $in: courseIds } })
      .populate('courseId', 'title code')
      .sort('-createdAt')
      .limit(5); // Limit to 5 most recent
    
    res.json({
      success: true,
      assignments: assignments
    });
  } catch (error) {
    console.error('Error fetching recent assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get assignments created by teachers
// @route   GET /api/assignments/teacher
// @access  Private
exports.getTeacherAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ role: 'teacher' })
      .populate('courseId')
      .populate('userId', 'name email');
    
    res.status(200).json({
      success: true,
      assignments: assignments,
    });
  } catch (error) {
    console.error('Error getting teacher assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};