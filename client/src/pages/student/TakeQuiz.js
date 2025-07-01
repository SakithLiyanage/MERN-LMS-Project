import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../../context/AuthContext';

const TakeQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [textAnswers, setTextAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    const fetchQuizDetails = async () => {
      try {
        const res = await axios.get(`/api/quizzes/${id}`);
        
        // Check if the student has already taken this quiz
        const alreadyTaken = res.data.quiz.results?.some(
          result => result.student === user._id
        );
        
        if (alreadyTaken) {
          setQuizCompleted(true);
          
          // Fetch the results
          const resultRes = await axios.get(`/api/quizzes/${id}/result`);
          setQuizResult(resultRes.data.result);
        }
        
        setQuiz(res.data.quiz);
        
        // Set time left if there's a time limit
        if (res.data.quiz.timeLimit) {
          setTimeLeft(res.data.quiz.timeLimit * 60); // Convert minutes to seconds
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching quiz details:', error);
        setError('Failed to load quiz');
        setLoading(false);
      }
    };
    
    fetchQuizDetails();
  }, [id, user._id]);
  
  // Timer effect
  useEffect(() => {
    let timer;
    if (quizStarted && timeLeft !== null && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (quizStarted && timeLeft === 0) {
      // Auto-submit when timer reaches zero
      submitQuiz();
    }
    
    return () => clearTimeout(timer);
  }, [quizStarted, timeLeft]);
  
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  const startQuiz = () => {
    setQuizStarted(true);
  };
  
  const handleOptionSelect = (questionIndex, optionId) => {
    const currentQuestionData = quiz.questions[questionIndex];
    
    if (currentQuestionData.type === 'multiple') {
      // For multiple choice, toggle the option
      const currentSelected = selectedOptions[questionIndex] || [];
      const newSelected = currentSelected.includes(optionId)
        ? currentSelected.filter(id => id !== optionId)
        : [...currentSelected, optionId];
      
      setSelectedOptions({
        ...selectedOptions,
        [questionIndex]: newSelected,
      });
    } else {
      // For single choice, replace the selection
      setSelectedOptions({
        ...selectedOptions,
        [questionIndex]: optionId,
      });
    }
  };
  
  const handleTextAnswerChange = (questionIndex, value) => {
    setTextAnswers({
      ...textAnswers,
      [questionIndex]: value,
    });
  };
  
  const goToNextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };
  
  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };
  
  const submitQuiz = async () => {
    setSubmitting(true);
    
    try {
      // Prepare answers array
      const answers = quiz.questions.map((question, index) => {
        if (question.type === 'text') {
          return {
            question: question._id,
            textAnswer: textAnswers[index] || '',
          };
        } else {
          return {
            question: question._id,
            selectedOption: question.type === 'single' ? selectedOptions[index] : undefined,
            selectedOptions: question.type === 'multiple' ? (selectedOptions[index] || []) : undefined,
          };
        }
      });
      
      const res = await axios.post(`/api/quizzes/${id}/submit`, { answers });
      
      setQuizCompleted(true);
      setQuizResult(res.data.result);
      
      toast.success('Quiz submitted successfully!');
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Error submitting quiz');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Error</h2>
        <p className="text-gray-600">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 inline-block px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Go Back
        </button>
      </div>
    );
  }
  
  if (!quiz) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Quiz Not Found</h2>
        <p className="text-gray-600">The quiz you're looking for doesn't exist or you don't have access to it.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 inline-block px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Go Back
        </button>
      </div>
    );
  }
  
  if (quizCompleted) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Quiz Completed!</h1>
            <p className="text-gray-600 mb-6">
              You've successfully completed the quiz: {quiz.title}
            </p>
            
            <div className="bg-blue-50 p-6 rounded-lg mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Results</h2>
              <div className="text-4xl font-bold text-primary-600 mb-2">
                {quizResult.score} / {quizResult.totalPossibleScore}
              </div>
              <p className="text-lg text-gray-700 mb-2">
                {Math.round((quizResult.score / quizResult.totalPossibleScore) * 100)}%
              </p>
              <p className="text-gray-500">
                Submitted on {new Date(quizResult.submittedAt).toLocaleDateString()}
              </p>
            </div>
            
            <button
              onClick={() => navigate(`/courses/${quiz.course}`)}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Back to Course
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!quizStarted) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{quiz.title}</h1>
            <p className="text-gray-600 mb-6">
              {quiz.description}
            </p>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Quiz Information</h2>
              <ul className="space-y-2 text-left">
                <li className="flex items-center">
                  <span className="font-medium text-gray-700 mr-2">Questions:</span>
                  <span>{quiz.questions.length}</span>
                </li>
                <li className="flex items-center">
                  <span className="font-medium text-gray-700 mr-2">Time Limit:</span>
                  <span>{quiz.timeLimit ? `${quiz.timeLimit} minutes` : 'No time limit'}</span>
                </li>
                <li className="flex items-center">
                  <span className="font-medium text-gray-700 mr-2">Total Points:</span>
                  <span>
                    {quiz.questions.reduce((total, question) => total + question.points, 0)}
                  </span>
                </li>
              </ul>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg mb-8">
              <p className="text-yellow-700">
                <strong>Note:</strong> Once you start the quiz, you must complete it. Make sure you're ready before starting.
                {quiz.timeLimit ? ' The timer will begin immediately.' : ''}
              </p>
            </div>
            
            <button
              onClick={startQuiz}
              className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Start Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Quiz is in progress
  const currentQuestionData = quiz.questions[currentQuestion];
  const progress = Math.round(((currentQuestion + 1) / quiz.questions.length) * 100);
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-gray-800">{quiz.title}</h1>
          
          {timeLeft !== null && (
            <div className={`text-lg font-mono ${timeLeft < 60 ? 'text-red-600' : 'text-gray-700'}`}>
              Time: {formatTime(timeLeft)}
            </div>
          )}
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-primary-600 h-2 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        {/* Question */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-800 mb-2">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </h2>
          <p className="text-gray-700 mb-4">{currentQuestionData.questionText}</p>
          <p className="text-sm text-gray-500 mb-2">Points: {currentQuestionData.points}</p>
          <p className="text-sm text-gray-500">
            Type: {currentQuestionData.type === 'single' ? 'Single Choice' : 
                   currentQuestionData.type === 'multiple' ? 'Multiple Choice' : 'Text Answer'}
          </p>
        </div>
        
        {/* Answer Input */}
        {currentQuestionData.type === 'text' ? (
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Answer
            </label>
            <textarea
              value={textAnswers[currentQuestion] || ''}
              onChange={(e) => handleTextAnswerChange(currentQuestion, e.target.value)}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Type your answer here..."
            />
          </div>
        ) : (
          <div className="space-y-3 mb-8">
            {currentQuestionData.options.map((option) => {
              let isSelected = false;
              
              if (currentQuestionData.type === 'single') {
                isSelected = selectedOptions[currentQuestion] === option._id;
              } else if (currentQuestionData.type === 'multiple') {
                const currentSelected = selectedOptions[currentQuestion] || [];
                isSelected = Array.isArray(currentSelected) && currentSelected.includes(option._id);
              }
              
              return (
                <motion.div
                  key={option._id}
                  whileTap={{ scale: 0.98 }}
                  className={`p-3 border rounded-lg cursor-pointer ${
                    isSelected
                      ? 'bg-primary-50 border-primary-300'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => handleOptionSelect(currentQuestion, option._id)}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 mr-3 rounded-full border ${
                      isSelected
                        ? 'border-primary-600'
                        : 'border-gray-300'
                    }`}>
                      {isSelected && (
                        <div className="w-3 h-3 m-1 rounded-full bg-primary-600"></div>
                      )}
                    </div>
                    <span className="text-gray-700">{option.text}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
        
        {/* Navigation buttons */}
        <div className="flex justify-between">
          <button
            onClick={goToPreviousQuestion}
            disabled={currentQuestion === 0}
            className={`px-4 py-2 border rounded-md ${
              currentQuestion === 0
                ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Previous
          </button>
          
          {currentQuestion < quiz.questions.length - 1 ? (
            <button
              onClick={goToNextQuestion}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={submitQuiz}
              disabled={submitting}
              className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 ${
                submitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          )}
        </div>
      </div>
      
      {/* Question navigator */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Question Navigator</h3>
        <div className="flex flex-wrap gap-2">
          {quiz.questions.map((question, index) => {
            let hasAnswer = false;
            
            if (question.type === 'text') {
              hasAnswer = textAnswers[index] && textAnswers[index].trim();
            } else if (question.type === 'single') {
              hasAnswer = selectedOptions[index] !== undefined && selectedOptions[index] !== null;
            } else if (question.type === 'multiple') {
              hasAnswer = selectedOptions[index] && Array.isArray(selectedOptions[index]) && selectedOptions[index].length > 0;
            }
            
            return (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentQuestion === index
                    ? 'bg-primary-600 text-white'
                    : hasAnswer
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TakeQuiz;
