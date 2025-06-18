const Assignment = require('../models/assignment.model');
const Course = require('../models/course.model');
const fs = require('fs');
const path = require('path');

// Helper function to create directories if they don't exist
const ensureDirectoryExists = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

// @desc    Create new assignment
// @route   POST /api/assignments
// @access  Private/Teacher
exports.createAssignment = async (req, res) => {
  try {
    const { title, description, course, deadline, totalPoints } = req.body;
    
    // Check if user is the teacher of the course
    const courseDoc = await Course.findById(course);
    if (!courseDoc) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Create new assignment
    const assignment = new Assignment({
      title,
      description,
      course,
      deadline,
      totalPoints,
      teacher: req.user.id,
    });
    
    await assignment.save();
    
    res.status(201).json({
      success: true,
      assignment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all assignments for a teacher
// @route   GET /api/assignments/teacher
// @access  Private/Teacher
exports.getTeacherAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ teacher: req.user.id })
      .populate('course', 'title code')
      .sort('-createdAt');
    
    res.json({
      success: true,
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all assignments for a student
// @route   GET /api/assignments/student
// @access  Private/Student
exports.getStudentAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ 
        course: { $in: req.user.courses } 
      })
      .populate('course', 'title code')
      .sort('-createdAt');
    
    res.json({
      success: true,
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single assignment
// @route   GET /api/assignments/:id
// @access  Private
exports.getAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('course', 'title code')
      .populate('teacher', 'name email');
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    res.json({
      success: true,
      assignment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private/Teacher
exports.updateAssignment = async (req, res) => {
  try {
    const { title, description, course, deadline, totalPoints } = req.body;
    const assignmentId = req.params.id;
    
    // Find assignment
    const assignment = await Assignment.findById(assignmentId);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Check if user is the teacher of the assignment
    if (assignment.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this assignment' });
    }
    
    // Update assignment fields
    assignment.title = title || assignment.title;
    assignment.description = description || assignment.description;
    assignment.course = course || assignment.course;
    assignment.deadline = deadline || assignment.deadline;
    assignment.totalPoints = totalPoints || assignment.totalPoints;
    
    await assignment.save();
    
    res.json({
      success: true,
      message: 'Assignment updated successfully',
      assignment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private/Teacher
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Check if user is the teacher of the assignment
    if (assignment.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this assignment' });
    }
    
    // Delete assignment files
    if (assignment.attachments && assignment.attachments.length > 0) {
      for (const file of assignment.attachments) {
        const filePath = path.join(__dirname, '../uploads', file);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }
    
    // Delete submissions files
    if (assignment.submissions && assignment.submissions.length > 0) {
      for (const submission of assignment.submissions) {
        const filePath = path.join(__dirname, '../uploads', submission.file);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }
    
    // Delete assignment
    await assignment.remove();
    
    res.json({
      success: true,
      message: 'Assignment deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Submit assignment (student)
// @route   POST /api/assignments/:id/submit
// @access  Private/Student
exports.submitAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Check if deadline has passed
    const now = new Date();
    if (now > new Date(assignment.deadline)) {
      return res.status(400).json({ message: 'Assignment deadline has passed' });
    }
    
    // Check if student is enrolled in the course
    const course = await Course.findById(assignment.course);
    if (!course.students.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }
    
    // Check if student has already submitted
    const alreadySubmitted = assignment.submissions.some(
      submission => submission.student.toString() === req.user.id
    );
    
    if (alreadySubmitted) {
      return res.status(400).json({ message: 'You have already submitted this assignment' });
    }
    
    // Handle file upload
    if (!req.files || !req.files.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }
    
    const file = req.files.file;
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const filename = `submission_${req.user.id}_${uniqueSuffix}_${file.name.replace(/\s+/g, '_')}`;
    
    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, '../uploads/submissions');
    ensureDirectoryExists(uploadsDir);
    
    // Save file
    const filepath = path.join(uploadsDir, filename);
    await file.mv(filepath);
    
    // Create submission
    const submission = {
      student: req.user.id,
      file: `submissions/${filename}`,
      submittedAt: Date.now(),
    };
    
    // Add submission to assignment
    assignment.submissions.push(submission);
    await assignment.save();
    
    res.status(201).json({
      success: true,
      message: 'Assignment submitted successfully',
      submission,
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
    
    // Check if user is the teacher of the assignment
    if (assignment.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
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
    const submission = assignment.submissions.id(submissionId);
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