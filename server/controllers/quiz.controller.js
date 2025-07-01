const Quiz = require('../models/quiz.model');
const Course = require('../models/course.model');
const Notification = require('../models/notification.model');
const mongoose = require('mongoose');

// @desc    Create new quiz
// @route   POST /api/quizzes
// @access  Private/Teacher
exports.createQuiz = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      course, 
      timeLimit, 
      availableFrom,
      availableTo,
      isPublished,
      questions
    } = req.body;
    
    console.log('Creating quiz with questions:', JSON.stringify(questions, null, 2));
    
    // Check if user is the teacher of the course
    const courseDoc = await Course.findById(course);
    if (!courseDoc) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (courseDoc.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to create quizzes for this course' });
    }
    
    // Create quiz
    const quiz = await Quiz.create({
      title,
      description,
      course,
      teacher: req.user.id,
      timeLimit: timeLimit || null,
      availableFrom: availableFrom || Date.now(),
      availableTo: availableTo || null,
      isPublished: isPublished || false,
      questions
    });
    
    // Add quiz to course
    await Course.findByIdAndUpdate(
      course,
      { $push: { quizzes: quiz._id } },
      { new: true }
    );
    
    // Notify all students in the course
    for (const studentId of courseDoc.students) {
      await Notification.create({
        user: studentId,
        text: `A new quiz "${quiz.title}" has been posted in ${courseDoc.title}.`,
        link: `/quizzes/${quiz._id}`
      });
    }
    
    res.status(201).json({
      success: true,
      quiz,
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all quizzes for a teacher
// @route   GET /api/quizzes/teacher
// @access  Private/Teacher
exports.getTeacherQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ teacher: req.user.id })
      .populate('course', 'title code')
      .sort('-createdAt');
    if (!quizzes) {
      return res.status(200).json({ success: true, count: 0, quizzes: [] });
    }
    res.json({
      success: true,
      count: quizzes.length,
      quizzes: quizzes,
    });
  } catch (error) {
    console.error('Error in getTeacherQuizzes:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all quizzes for a student
// @route   GET /api/quizzes/student
// @access  Private/Student
exports.getStudentQuizzes = async (req, res) => {
  try {
    // Find courses the student is enrolled in
    const courses = await Course.find({ students: req.user.id });
    const courseIds = courses.map(course => course._id);
    
    // Find quizzes for those courses
    const quizzes = await Quiz.find({ 
      course: { $in: courseIds },
      isPublished: true,
      availableFrom: { $lte: new Date() },
      $or: [
        { availableTo: null },
        { availableTo: { $gte: new Date() } }
      ]
    })
      .populate('course', 'title code')
      .sort('-createdAt');
    
    // Add submitted status to each quiz
    const quizzesWithStatus = quizzes.map(quiz => {
      const submitted = quiz.results.some(
        result => result.student.toString() === req.user.id
      );
      
      // Don't send questions/answers to student if not submitted yet
      if (!submitted) {
        quiz = quiz.toObject();
        // Keep the questions array but remove options' isCorrect field
        if (quiz.questions) {
          quiz.questions = quiz.questions.map(q => ({
            ...q,
            options: q.options.map(o => ({
              _id: o._id,
              text: o.text
            }))
          }));
        }
      }
      
      return {
        ...quiz,
        submitted
      };
    });
    
    res.json({
      success: true,
      count: quizzesWithStatus.length,
      quizzes: quizzesWithStatus,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get a single quiz
// @route   GET /api/quizzes/:id
// @access  Private
exports.getQuiz = async (req, res) => {
  try {
    console.log('Fetching quiz with ID:', req.params.id);
    const quiz = await Quiz.findById(req.params.id)
      .populate('course', 'title code');
    if (!quiz) {
      console.log('Quiz not found with ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    console.log('Quiz found:', quiz.title);
    
    // Ensure questions array exists
    if (!quiz.questions) {
      quiz.questions = [];
      await quiz.save();
    }
    
    // For students, hide answers
    if (req.user.role === 'student') {
      const sanitizedQuiz = quiz.toObject();
      
      if (sanitizedQuiz.questions && Array.isArray(sanitizedQuiz.questions)) {
        sanitizedQuiz.questions = sanitizedQuiz.questions.map(q => {
          const { correctAnswer, explanation, ...rest } = q;
          return rest;
        });
      }
      
      return res.status(200).json({
        success: true,
        data: sanitizedQuiz
      });
    }
    
    // Return full quiz data for teachers/admins
    return res.status(200).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching quiz details',
      error: error.message
    });
  }
};

// @desc    Update quiz
// @route   PUT /api/quizzes/:id
// @access  Private/Teacher
exports.updateQuiz = async (req, res) => {
  try {
    let quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    // Check if user is the teacher who created the quiz
    if (quiz.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this quiz' });
    }
    
    // Don't allow updating if there are already submissions
    if (quiz.results && quiz.results.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot update quiz: students have already submitted answers' 
      });
    }
    
    // Update quiz
    quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      quiz: quiz,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
// @access  Private/Teacher
exports.deleteQuiz = async (req, res) => {
  try {
    console.log('=== DELETE QUIZ REQUEST ===');
    console.log('Quiz ID:', req.params.id);
    console.log('User ID:', req.user.id);
    console.log('User Role:', req.user.role);
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('Invalid ObjectId format:', req.params.id);
      return res.status(400).json({ message: 'Invalid quiz ID format' });
    }
    
    // Step 1: Find the quiz
    console.log('Step 1: Finding quiz...');
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      console.log('Quiz not found');
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    console.log('Quiz found:', {
      id: quiz._id,
      title: quiz.title,
      teacher: quiz.teacher,
      course: quiz.course
    });
    
    // Step 2: Check authorization
    console.log('Step 2: Checking authorization...');
    if (quiz.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      console.log('Authorization failed');
      return res.status(403).json({ message: 'Not authorized to delete this quiz' });
    }
    
    console.log('Authorization passed');
    
    // Step 3: Delete the quiz first
    console.log('Step 3: Deleting quiz...');
    const deletedQuiz = await Quiz.findByIdAndDelete(req.params.id);
    
    if (!deletedQuiz) {
      console.log('Quiz deletion failed - quiz not found');
      return res.status(404).json({ message: 'Quiz not found for deletion' });
    }
    
    console.log('Quiz deleted successfully');
    
    // Step 4: Remove from course (optional - don't fail if this doesn't work)
    console.log('Step 4: Removing from course...');
    try {
      await Course.findByIdAndUpdate(
        quiz.course,
        { $pull: { quizzes: quiz._id } }
      );
      console.log('Quiz removed from course successfully');
    } catch (courseError) {
      console.log('Warning: Could not remove quiz from course:', courseError.message);
      // Don't fail the entire operation if course update fails
    }
    
    console.log('=== QUIZ DELETION COMPLETED SUCCESSFULLY ===');
    
    res.json({
      success: true,
      message: 'Quiz deleted successfully',
    });
    
  } catch (error) {
    console.error('=== ERROR IN DELETE QUIZ ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error object:', error);
    
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Submit quiz answers (student)
// @route   POST /api/quizzes/:id/submit
// @access  Private/Student
exports.submitQuiz = async (req, res) => {
  try {
    const { answers, startTime } = req.body;
    
    if (!Array.isArray(answers)) {
      return res.status(400).json({ message: 'Answers must be an array' });
    }
    
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    // Check if student is enrolled in the course
    const course = await Course.findById(quiz.course);
    if (!course.students.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }
    
    // Check if quiz is published and available
    if (!quiz.isPublished) {
      return res.status(403).json({ message: 'This quiz is not available yet' });
    }
    
    const now = new Date();
    if (quiz.availableFrom > now) {
      return res.status(403).json({ message: 'This quiz is not available yet' });
    }
    
    if (quiz.availableTo && quiz.availableTo < now) {
      return res.status(403).json({ message: 'This quiz is no longer available' });
    }
    
    // Check if student has already taken the quiz
    const alreadySubmitted = quiz.results.some(
      result => result.student.toString() === req.user.id
    );
    
    if (alreadySubmitted) {
      return res.status(400).json({ message: 'You have already submitted this quiz' });
    }
    
    // Calculate time taken if start time is provided
    let timeTaken = null;
    if (startTime) {
      const startDate = new Date(startTime);
      timeTaken = Math.round((now - startDate) / 1000); // Time in seconds
    }
    
    // Calculate score
    let score = 0;
    let totalPossibleScore = 0;
    
    // Process each answer
    const processedAnswers = [];
    
    for (const answer of answers) {
      const question = quiz.questions.id(answer.question);
      
      if (!question) {
        continue; // Skip invalid question IDs
      }
      
      totalPossibleScore += question.points;
      let isCorrect = false;
      
      if (question.type === 'text') {
        // Handle text answer
        const studentAnswer = answer.textAnswer?.trim().toLowerCase();
        if (studentAnswer && question.correctTextAnswers && question.correctTextAnswers.length > 0) {
          isCorrect = question.correctTextAnswers.some(
            correctAnswer => correctAnswer.trim().toLowerCase() === studentAnswer
          );
        }
        
        processedAnswers.push({
          question: answer.question,
          textAnswer: answer.textAnswer,
          isCorrect
        });
      } else {
        // Handle multiple choice questions
        if (question.type === 'multiple') {
          // For multiple choice, check if all selected options are correct and all correct options are selected
          const selectedOptions = answer.selectedOptions || [];
          const correctOptions = question.options.filter(opt => opt.isCorrect);
          
          const allSelectedAreCorrect = selectedOptions.every(selectedId => {
            const option = question.options.id(selectedId);
            return option && option.isCorrect;
          });
          
          const allCorrectAreSelected = correctOptions.every(correctOpt => 
            selectedOptions.includes(correctOpt._id.toString())
          );
          
          isCorrect = allSelectedAreCorrect && allCorrectAreSelected && selectedOptions.length === correctOptions.length;
        } else {
          // For single choice
          const selectedOption = question.options.id(answer.selectedOption);
          isCorrect = selectedOption && selectedOption.isCorrect;
      }
      
      processedAnswers.push({
        question: answer.question,
          selectedOptions: answer.selectedOptions || [answer.selectedOption],
          isCorrect
      });
      }
      
      if (isCorrect) {
        score += question.points;
      }
    }
    
    // Create result
    const result = {
      student: req.user.id,
      answers: processedAnswers,
      score,
      totalPossibleScore,
      submittedAt: now,
      timeTaken
    };
    
    // Add result to quiz
    quiz.results.push(result);
    await quiz.save();
    
    res.json({
      success: true,
      message: 'Quiz submitted successfully',
      result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get student's quiz result
// @route   GET /api/quizzes/:id/result
// @access  Private/Student
exports.getQuizResult = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    // Find the student's result
    const result = quiz.results.find(
      r => r.student.toString() === req.user.id
    );
    
    if (!result) {
      return res.status(404).json({ message: 'Result not found, you have not taken this quiz yet' });
    }
    
    // Enhance result with question texts and explanations
    const enhancedResult = {
      ...result.toObject(),
      answers: result.answers.map(answer => {
        const question = quiz.questions.id(answer.question);
        
        if (question.type === 'text') {
          return {
            ...answer,
            questionText: question?.questionText,
            textAnswer: answer.textAnswer,
            correctTextAnswers: question?.correctTextAnswers,
            explanation: question?.explanation,
          };
        } else {
          const selectedOptions = answer.selectedOptions || [];
          const selectedOptionTexts = selectedOptions.map(optionId => {
            const option = question?.options.id(optionId);
            return option?.text;
          }).filter(Boolean);
          
          const correctOptions = question?.options.filter(o => o.isCorrect) || [];
        
        return {
          ...answer,
          questionText: question?.questionText,
            selectedOptionTexts,
            correctOptionTexts: correctOptions.map(o => o.text),
          explanation: question?.explanation,
        };
        }
      })
    };
    
    res.json({
      success: true,
      result: enhancedResult
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all quizzes for a specific course
// @route   GET /api/quizzes/course/:courseId
// @access  Private (Teacher/Student)
exports.getCourseQuizzes = async (req, res) => {
  try {
    const { courseId } = req.params;
    const quizzes = await Quiz.find({ course: courseId })
      .populate('course', 'title code')
      .sort('-createdAt');

    res.json({
      success: true,
      count: quizzes.length,
      quizzes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Test endpoint
// @route   GET /api/quizzes/test
// @access  Public
exports.testEndpoint = async (req, res) => {
  try {
    console.log('Test endpoint called');
    res.json({
      success: true,
      message: 'Quiz controller is working',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({ message: 'Test endpoint error' });
  }
};
    