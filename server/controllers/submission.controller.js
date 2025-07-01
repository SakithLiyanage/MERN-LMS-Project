const Assignment = require('../models/assignment.model');
const fs = require('fs');
const path = require('path');
const Course = require('../models/course.model');

// @desc    Get submission by ID
// @route   GET /api/submissions/:id
// @access  Private
exports.getSubmission = async (req, res) => {
  try {
    const submissionId = req.params.id;
    
    // Find assignment containing the submission
    const assignment = await Assignment.findOne({
      'submissions._id': submissionId
    })
    .populate('course', 'title code')
    .populate('teacher', 'name email')
    .populate('submissions.student', 'name email');
    
    if (!assignment) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    // Extract the specific submission
    const submission = assignment.submissions.id(submissionId);
    
    // Check if user has access (teacher of the course or the student who submitted)
    const isTeacher = assignment.teacher._id.toString() === req.user.id;
    const isSubmitter = submission.student._id.toString() === req.user.id;
    
    if (!isTeacher && !isSubmitter && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access this submission' });
    }
    
    // Return submission with assignment context
    res.json({
      success: true,
      submission,
      assignment: {
        _id: assignment._id,
        title: assignment.title,
        course: assignment.course,
        deadline: assignment.deadline,
        totalPoints: assignment.totalPoints
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Grade submission
// @route   PUT /api/submissions/:id/grade
// @access  Private/Teacher
exports.gradeSubmission = async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    const submissionId = req.params.id;
    
    // Find assignment with the submission
    const assignment = await Assignment.findOne({
      'submissions._id': submissionId
    });
    
    if (!assignment) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    // Find the submission
    const submission = assignment.submissions.id(submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    // Fetch the course to check the teacher
    const course = await Course.findById(assignment.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if user is the teacher of the course
    if (course.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to grade this submission' });
    }
    
    // Validate grade
    const numGrade = Number(grade);
    if (isNaN(numGrade) || numGrade < 0 || numGrade > assignment.totalPoints) {
      return res.status(400).json({ 
        message: `Grade must be a number between 0 and ${assignment.totalPoints}` 
      });
    }
    
    // Update the submission
    submission.grade = numGrade;
    submission.feedback = feedback || '';
    submission.graded = true;
    
    await assignment.save();
    
    res.json({
      success: true,
      message: 'Submission graded successfully',
      submission,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete submission
// @route   DELETE /api/submissions/:id
// @access  Private/Teacher or Student (own submission only)
exports.deleteSubmission = async (req, res) => {
  try {
    const submissionId = req.params.id;
    
    // Find assignment containing the submission
    const assignment = await Assignment.findOne({
      'submissions._id': submissionId
    });
    
    if (!assignment) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    // Extract the specific submission
    const submission = assignment.submissions.id(submissionId);
    
    // Check authorization
    const isTeacher = assignment.teacher.toString() === req.user.id;
    const isSubmitter = submission.student.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isTeacher && !isSubmitter && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this submission' });
    }
    
    // Delete the file if it exists
    if (submission.file) {
      const filePath = path.join(__dirname, '../uploads', submission.file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    // Remove submission from assignment
    submission.remove();
    await assignment.save();
    
    res.json({
      success: true,
      message: 'Submission deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
