import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  PlusCircleIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/solid';

const CreateQuiz = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    timeLimit: 0,
    isPublished: false,
    availableFrom: null,
    availableTo: null,
  });
  const [questions, setQuestions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await axios.get(`/api/courses/${courseId}`);
        setCourse(res.data.course);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching course:', error);
        setLoading(false);
      }
    };
    
    fetchCourse();
  }, [courseId]);
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
  
  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };
  
  const handleOptionChange = (questionIndex, optionIndex, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex][field] = value;
    setQuestions(updatedQuestions);
  };
  
  const handleCorrectOptionChange = (questionIndex, optionIndex) => {
    const updatedQuestions = [...questions];
    const isCorrect = !updatedQuestions[questionIndex].options[optionIndex].isCorrect;
    updatedQuestions[questionIndex].options.forEach((option, index) => {
      option.isCorrect = index === optionIndex ? isCorrect : false;
    });
    setQuestions(updatedQuestions);
  };
  
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: '',
        points: 1,
        explanation: '',
        options: [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false }
        ]
      }
    ]);
  };
  
  const removeQuestion = (index) => {
    if (questions.length > 1) {
      const updatedQuestions = [...questions];
      updatedQuestions.splice(index, 1);
      setQuestions(updatedQuestions);
    } else {
      toast.error('Quiz must have at least one question');
    }
  };
  
  const addOption = (questionIndex) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[questionIndex].options.length < 6) {
      updatedQuestions[questionIndex].options.push({ text: '', isCorrect: false });
      setQuestions(updatedQuestions);
    } else {
      toast.error('Maximum 6 options allowed per question');
    }
  };
  
  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[questionIndex].options.length > 2) {
      updatedQuestions[questionIndex].options.splice(optionIndex, 1);
      setQuestions(updatedQuestions);
    } else {
      toast.error('Question must have at least 2 options');
    }
  };
  
  const validateForm = () => {
    // Check basic form data
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Quiz title and description are required');
      return false;
    }
    
    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (!question.questionText.trim()) {
        toast.error(`Question ${i + 1} text is required`);
        return false;
      }
      
      // Check if at least one option is marked as correct
      const hasCorrectOption = question.options.some(option => option.isCorrect);
      if (!hasCorrectOption) {
        toast.error(`Question ${i + 1} must have at least one correct answer`);
        return false;
      }
      
      // Check if all options have text
      for (let j = 0; j < question.options.length; j++) {
        if (!question.options[j].text.trim()) {
          toast.error(`Option ${j + 1} in Question ${i + 1} is empty`);
          return false;
        }
      }
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      const quizData = {
        ...formData,
        course: courseId,
        questions,
      };
      
      const res = await axios.post('/api/quizzes', quizData);
      
      toast.success('Quiz created successfully!');
      navigate(`/quizzes/${res.data.quiz._id}`);
    } catch (error) {
      console.error('Error creating quiz:', error);
      toast.error(error.response?.data?.message || 'Error creating quiz');
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
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-primary-600"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Course
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Quiz</h1>
        
        <div className="mb-6 p-4 bg-blue-50 rounded-md">
          <p className="text-blue-700">
            Creating quiz for: <span className="font-semibold">{course.title}</span>
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Quiz Basic Information */}
          <div className="space-y-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800">Quiz Details</h2>
            
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Quiz Title*
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Chapter 5 Quiz: Advanced Concepts"
              />
            </div>
            
            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description*
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Provide a description of what this quiz covers"
              ></textarea>
            </div>
            
            {/* Time Limit and Publish Status - 2 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700 mb-1">
                  Time Limit (minutes)
                </label>
                <input
                  type="number"
                  id="timeLimit"
                  name="timeLimit"
                  value={formData.timeLimit}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter 0 for no time limit"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter 0 for no time limit
                </p>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublished"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-700">
                  Publish quiz immediately
                </label>
              </div>
            </div>
            
            {/* Date Range - 2 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="availableFrom" className="block text-sm font-medium text-gray-700 mb-1">
                  Available From
                </label>
                <DatePicker
                  selected={formData.availableFrom}
                  onChange={(date) => setFormData({ ...formData, availableFrom: date })}
                  showTimeSelect
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label htmlFor="availableTo" className="block text-sm font-medium text-gray-700 mb-1">
                  Available Until
                </label>
                <DatePicker
                  selected={formData.availableTo}
                  onChange={(date) => setFormData({ ...formData, availableTo: date })}
                  showTimeSelect
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>
          
          {/* Questions Section */}
          <div className="border-t border-gray-200 pt-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Questions</h2>
              <button
                type="button"
                onClick={addQuestion}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <PlusCircleIcon className="h-4 w-4 mr-1" />
                Add Question
              </button>
            </div>
            
            <AnimatePresence>
              {questions.map((question, qIndex) => (
                <motion.div
                  key={qIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 border border-gray-200 rounded-lg mb-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-medium text-gray-800">Question {qIndex + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                  
                  {/* Question Text */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question Text*
                    </label>
                    <textarea
                      value={question.questionText}
                      onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter your question here"
                      required
                    ></textarea>
                  </div>
                  
                  {/* Points */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Points
                    </label>
                    <input
                      type="number"
                      value={question.points}
                      onChange={(e) => handleQuestionChange(qIndex, 'points', parseInt(e.target.value) || 1)}
                      min="1"
                      className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  {/* Answer Options */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Answer Options
                    </label>
                    
                    <div className="space-y-3">
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center">
                          <button
                            type="button"
                            onClick={() => handleCorrectOptionChange(qIndex, oIndex)}
                            className={`flex-shrink-0 mr-2 ${
                              option.isCorrect
                                ? 'text-green-600 hover:text-green-700'
                                : 'text-gray-400 hover:text-gray-500'
                            }`}
                          >
                            {option.isCorrect ? (
                              <CheckCircleIcon className="h-5 w-5" />
                            ) : (
                              <XCircleIcon className="h-5 w-5" />
                            )}
                          </button>
                          
                          <input
                            type="text"
                            value={option.text}
                            onChange={(e) => handleOptionChange(qIndex, oIndex, 'text', e.target.value)}
                            className={`flex-grow px-3 py-2 border rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                              option.isCorrect
                                ? 'border-green-300 bg-green-50'
                                : 'border-gray-300'
                            }`}
                            placeholder={`Option ${oIndex + 1}`}
                            required
                          />
                          
                          <button
                            type="button"
                            onClick={() => removeOption(qIndex, oIndex)}
                            className="flex-shrink-0 ml-2 text-red-500 hover:text-red-700"
                            disabled={question.options.length <= 2}
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => addOption(qIndex)}
                      className="mt-3 inline-flex items-center px-2 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <PlusCircleIcon className="h-4 w-4 mr-1" />
                      Add Option
                    </button>
                  </div>
                  
                  {/* Explanation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Explanation (Optional)
                    </label>
                    <textarea
                      value={question.explanation}
                      onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Explain why the correct answer is right (shown after quiz submission)"
                    ></textarea>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          {/* Submit Button */}
          <div className="border-t border-gray-200 pt-6">
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3 px-4 border border-transparent rounded-md font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                submitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {submitting ? 'Creating Quiz...' : 'Create Quiz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuiz;