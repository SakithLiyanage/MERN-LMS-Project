const Quiz = require('../models/quiz.model');
const Course = require('../models/course.model');

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
    
    res.status(201).json({
      success: true,
      quiz,
    });
  } catch (error) {
    console.error(error);
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
    
    res.json({
      success: true,
      count: quizzes.length,
      quizzes: quizzes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
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
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    // Check if user is the teacher who created the quiz
    if (quiz.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this quiz' });
    }
    
    // Remove quiz from course
    await Course.findByIdAndUpdate(
      quiz.course,
      { $pull: { quizzes: quiz._id } }
    );
    
    // Delete quiz
    await quiz.remove();
    
    res.json({
      success: true,
      message: 'Quiz deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Submit quiz answers (student)
// @route   POST /api/quizzes/:id/submit
// @access  Private/Student
exports.submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;
    
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
      const selectedOption = question.options.id(answer.selectedOption);
      
      if (selectedOption && selectedOption.isCorrect) {
        score += question.points;
      }
      
      processedAnswers.push({
        question: answer.question,
        selectedOption: answer.selectedOption,
        isCorrect: selectedOption && selectedOption.isCorrect
      });
    }
    
    // Create result
    const result = {
      student: req.user.id,
      answers: processedAnswers,
      score,
      totalPossibleScore,
      submittedAt: now
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
        const selectedOption = question?.options.id(answer.selectedOption);
        
        return {
          ...answer,
          questionText: question?.questionText,
          selectedOptionText: selectedOption?.text,
          explanation: question?.explanation,
          correctOption: question?.options.find(o => o.isCorrect)
        };
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
    