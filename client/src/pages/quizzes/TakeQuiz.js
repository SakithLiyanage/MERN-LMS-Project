import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../../context/AuthContext';
import { ClockIcon, ExclamationIcon } from '@heroicons/react/outline';
import { motion } from 'framer-motion';

const TakeQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [error, setError] = useState(null);
  const [resultId, setResultId] = useState(null); // Added missing state variable
  const [startTime, setStartTime] = useState(null); // Add start time tracking

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        console.log('Fetching quiz with ID:', id);
        const token = localStorage.getItem('token');
        
        // Add error handling with specific timeout and headers
        const res = await axios.get(`/api/quizzes/${id}`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          },
          timeout: 15000
        });
        
        console.log("Quiz API response:", res.data);
        
        if (res.data && res.data.success && res.data.data) {
          const quizData = res.data.data;
          setQuiz(quizData);
          
          // Initialize answers with proper checks
          if (quizData.questions && Array.isArray(quizData.questions) && quizData.questions.length > 0) {
            const initialAnswers = {};
            quizData.questions.forEach((q) => {
              if (q && q._id) {
                // Initialize based on question type
                if (q.type === 'multiple') {
                  initialAnswers[q._id] = [];
                } else {
                  initialAnswers[q._id] = '';
                }
              }
            });
            setAnswers(initialAnswers);
            console.log('Initialized answers:', initialAnswers);
          } else {
            console.warn("Quiz has no questions or questions array is not valid");
          }
          
          if (quizData.timeLimit && typeof quizData.timeLimit === 'number') {
            setTimeLeft(quizData.timeLimit * 60);
          }
        } else {
          console.error("Invalid quiz data or 'success' is false:", res.data);
          setError('Failed to load quiz data');
          toast.error('Failed to load quiz data');
        }
      } catch (error) {
        console.error('Error fetching quiz:', error);
        setError(error.response?.data?.message || 'Error loading quiz');
        toast.error(error.response?.data?.message || 'Error loading quiz');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  // Timer effect
  useEffect(() => {
    if (!quizStarted || timeLeft === null) return;
    
    const timer = timeLeft > 0 && setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    
    if (timeLeft === 0) {
      handleSubmit();
    }
    
    return () => clearInterval(timer);
  }, [timeLeft, quizStarted]);
  
  const handleStartQuiz = () => {
    setQuizStarted(true);
    setStartTime(new Date().getTime());
  };
  
  const handleAnswerChange = (questionId, value, isMultiple = false) => {
    setAnswers(prev => {
      if (isMultiple) {
        // Store option IDs directly
        const currentAnswers = prev[questionId] || [];
        const newAnswers = currentAnswers.includes(value)
          ? currentAnswers.filter(v => v !== value)
          : [...currentAnswers, value];
        return {
          ...prev,
          [questionId]: newAnswers
        };
      } else {
        return {
          ...prev,
          [questionId]: value
        };
      }
    });
  };
  
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      // Prepare answers based on question type
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => {
        const question = quiz.questions.find(q => q._id === questionId);
        
        if (!question) {
          return null; // Skip invalid questions
        }
        
        if (question.type === 'text') {
          return {
            question: questionId,
            textAnswer: answer
          };
        } else if (question.type === 'multiple') {
          // Use the array of option IDs directly
          return {
            question: questionId,
            selectedOptions: Array.isArray(answer) ? answer : []
          };
        } else {
          // Single choice - convert option index to option ID
          const selectedOptionId = question.options[answer]?._id;
          
          return {
            question: questionId,
            selectedOption: selectedOptionId
          };
        }
      }).filter(Boolean); // Remove null entries
      
      console.log('Submitting answers:', formattedAnswers);
      
      const res = await axios.post(
        `/api/quizzes/${id}/submit`,
        { answers: formattedAnswers, startTime },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data.success) {
        toast.success('Quiz submitted successfully!');
        navigate(`/quizzes/${id}/result`);
      } else {
        toast.error(res.data.message || 'Failed to submit quiz');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error(error.response?.data?.message || 'Error submitting quiz');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  // Update the quiz start section to handle potential data problems
  const startQuizSection = () => {
    if (!quiz) {
      return (
        <div className="bg-yellow-50 p-4 rounded-md mb-6 text-center">
          <p className="text-yellow-800">Quiz data not available. Please try again later.</p>
        </div>
      );
    }
    
    const hasQuestions = quiz.questions && Array.isArray(quiz.questions) && quiz.questions.length > 0;
    
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">{quiz.title}</h1>
        <div className="mb-6">
          <p className="text-gray-700">{quiz.description || 'No description available'}</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h2 className="font-medium text-gray-700 mb-2">Quiz Information</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center">
              <span className="w-32">Questions:</span>
              <span>{hasQuestions ? quiz.questions.length : 0}</span>
            </li>
            {quiz.timeLimit && (
              <li className="flex items-center">
                <span className="w-32">Time Limit:</span>
                <span>{quiz.timeLimit} minutes</span>
              </li>
            )}
            <li className="flex items-center">
              <span className="w-32">Points:</span>
              <span>
                {hasQuestions ? quiz.questions.reduce((total, q) => total + (q.points || 1), 0) : 0}
              </span>
            </li>
          </ul>
        </div>
        
        {!hasQuestions && (
          <div className="bg-yellow-50 p-4 rounded-md mb-6 text-center">
            <p className="text-yellow-800">This quiz has no questions yet. Please try again later.</p>
          </div>
        )}
        
        {hasQuestions && (
          <button
            onClick={handleStartQuiz}
            className="w-full px-6 py-3 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700"
          >
            Start Quiz
          </button>
        )}
      </div>
    );
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
      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-red-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-red-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Quiz not found</h3>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        {startQuizSection()}
      </div>
    );
  }
  
  // Quiz in progress
  const currentQuestion = quiz.questions[currentQuestionIndex];
  
  return (
    <div className="max-w-3xl mx-auto py-8 px-2 sm:px-6 lg:px-8 bg-neutral-50 min-h-screen">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white/90 shadow-card rounded-2xl overflow-hidden border border-primary-50 backdrop-blur-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-400 to-secondary-500 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-extrabold font-heading tracking-tight drop-shadow-lg">
              {quiz.title}
            </h1>
            {timeLeft !== null && (
              <div className="flex items-center bg-white/20 px-3 py-1 rounded-lg shadow-inner">
                <ClockIcon className="h-5 w-5 mr-2" />
                <span className="font-mono font-bold">
                  {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                </span>
              </div>
            )}
          </div>
          <div className="flex justify-between mt-2 text-sm opacity-90">
            <span>Question {currentQuestionIndex + 1} of {quiz.questions?.length || 0}</span>
            <span>{currentQuestion?.points || 1} points</span>
          </div>
        </div>
        {/* Question */}
        <motion.div key={currentQuestionIndex} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="p-8">
          <h2 className="text-lg font-semibold text-text-dark mb-4">
            {currentQuestion?.questionText || 'No question available'}
          </h2>
          {currentQuestion?.image && (
            <div className="my-4">
              <img 
                src={currentQuestion.image} 
                alt="Question" 
                className="max-w-full h-auto max-h-64 mx-auto rounded-xl shadow-md"
              />
            </div>
          )}
          <div className="mt-6">
            {currentQuestion?.type === 'multiple' ? (
              <div className="space-y-3">
                {currentQuestion.options?.map((option) => {
                  const currentAnswers = answers[currentQuestion._id] || [];
                  const isChecked = Array.isArray(currentAnswers) && currentAnswers.includes(option._id);
                  return (
                    <label key={option._id} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="h-5 w-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500 transition-all"
                        checked={isChecked}
                        onChange={() => handleAnswerChange(currentQuestion._id, option._id, true)}
                      />
                      <span className="text-gray-700 font-medium">{option.text}</span>
                    </label>
                  );
                })}
              </div>
            ) : currentQuestion?.type === 'single' ? (
              <div className="space-y-3">
                {currentQuestion.options?.map((option, idx) => (
                  <label key={idx} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      className="h-5 w-5 text-primary-600 border-gray-300 focus:ring-primary-500 transition-all"
                      checked={answers[currentQuestion._id] === idx}
                      onChange={() => handleAnswerChange(currentQuestion._id, idx)}
                      name={`question-${currentQuestion._id}`}
                    />
                    <span className="text-gray-700 font-medium">{option.text}</span>
                  </label>
                ))}
              </div>
            ) : (
              <textarea
                className="w-full px-3 py-2 text-gray-700 border-2 border-primary-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all bg-white/70 shadow-inner"
                rows="4"
                placeholder="Type your answer here..."
                value={answers[currentQuestion?._id] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
              ></textarea>
            )}
          </div>
        </motion.div>
        {/* Navigation */}
        <div className="px-8 py-4 bg-white/80 flex justify-between rounded-b-2xl border-t border-primary-50">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className={`px-4 py-2 rounded-lg font-semibold transition-all shadow ${currentQuestionIndex === 0 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700 hover:from-primary-200 hover:to-secondary-200'}`}
          >
            Previous
          </button>
          {currentQuestionIndex < (quiz.questions?.length - 1) ? (
            <button
              onClick={handleNextQuestion}
              className="px-4 py-2 rounded-lg font-semibold bg-gradient-to-r from-primary-400 to-secondary-500 text-white shadow hover:from-primary-500 hover:to-secondary-600 transition-all"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`px-4 py-2 rounded-lg font-semibold bg-gradient-to-r from-accent-green to-primary-400 text-white shadow hover:from-green-500 hover:to-primary-500 transition-all ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          )}
        </div>
        {/* Question navigation */}
        <div className="px-8 py-4 border-t border-primary-50 bg-white/70 rounded-b-2xl">
          <p className="text-sm text-gray-600 mb-2 font-semibold">Question Navigation:</p>
          <div className="flex flex-wrap gap-2">
            {quiz.questions?.map((question, idx) => {
              const questionAnswer = answers[question?._id];
              let hasAnswer = false;
              if (question?.type === 'multiple') {
                hasAnswer = Array.isArray(questionAnswer) && questionAnswer.length > 0;
              } else {
                hasAnswer = questionAnswer !== undefined && questionAnswer !== null && questionAnswer !== '';
              }
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow transition-all border-2 ${idx === currentQuestionIndex ? 'bg-primary-400 text-white border-primary-500 scale-110' : hasAnswer ? 'bg-accent-green/80 text-white border-accent-green' : 'bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300'}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TakeQuiz;
