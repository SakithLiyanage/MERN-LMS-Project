import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import moment from 'moment';
import AuthContext from '../../context/AuthContext';
import {
  AcademicCapIcon,
  ClockIcon,
  SearchIcon,
  DocumentTextIcon // Added missing import
} from '@heroicons/react/outline';

const Quizzes = () => {
  const { user } = useContext(AuthContext);
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'available', 'completed', 'upcoming', 'expired'
  
  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';
  
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const endpoint = isTeacher ? '/api/quizzes/teacher' : '/api/quizzes/student';
        const res = await axios.get(endpoint);
        
        setQuizzes(res.data.quizzes);
        setFilteredQuizzes(res.data.quizzes);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
        setLoading(false);
      }
    };
    
    fetchQuizzes();
  }, [isTeacher]);
  
  // Filter quizzes based on search term and filter
  useEffect(() => {
    let filtered = quizzes;
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(
        (quiz) =>
          quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quiz.course?.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter for students
    if (isStudent) {
      if (filter === 'available') {
        filtered = filtered.filter(quiz => !quiz.submitted);
      } else if (filter === 'completed') {
        filtered = filtered.filter(quiz => quiz.submitted);
      } else if (filter === 'upcoming') {
        filtered = filtered.filter(quiz => 
          new Date(quiz.availableFrom) > new Date()
        );
      } else if (filter === 'expired') {
        filtered = filtered.filter(quiz => 
          quiz.availableTo && new Date(quiz.availableTo) < new Date() && !quiz.submitted
        );
      }
    }
    // For teachers, filter by status
    else if (isTeacher) {
      if (filter === 'active') {
        filtered = filtered.filter(quiz => 
          quiz.isPublished && 
          (!quiz.availableTo || new Date(quiz.availableTo) > new Date())
        );
      } else if (filter === 'draft') {
        filtered = filtered.filter(quiz => !quiz.isPublished);
      } else if (filter === 'completed') {
        filtered = filtered.filter(quiz => 
          quiz.availableTo && new Date(quiz.availableTo) < new Date()
        );
      } else if (filter === 'results') {
        filtered = filtered.filter(quiz => quiz.results && quiz.results.length > 0);
      }
    }
    
    setFilteredQuizzes(filtered);
  }, [searchTerm, filter, quizzes, isStudent, isTeacher]);
  
  const getQuizStatus = (quiz) => {
    if (isStudent) {
      if (quiz.submitted) {
        return {
          label: 'Completed',
          color: 'bg-green-100 text-green-800'
        };
      } else if (new Date(quiz.availableFrom) > new Date()) {
        return {
          label: 'Coming Soon',
          color: 'bg-purple-100 text-purple-800'
        };
      } else if (quiz.availableTo && new Date(quiz.availableTo) < new Date()) {
        return {
          label: 'Expired',
          color: 'bg-red-100 text-red-800'
        };
      } else {
        return {
          label: 'Available',
          color: 'bg-blue-100 text-blue-800'
        };
      }
    } else {
      // For teachers
      if (!quiz.isPublished) {
        return {
          label: 'Draft',
          color: 'bg-gray-100 text-gray-800'
        };
      } else if (quiz.availableTo && new Date(quiz.availableTo) < new Date()) {
        return {
          label: 'Expired',
          color: 'bg-red-100 text-red-800'
        };
      } else if (new Date(quiz.availableFrom) > new Date()) {
        return {
          label: 'Scheduled',
          color: 'bg-purple-100 text-purple-800'
        };
      } else {
        return {
          label: 'Active',
          color: 'bg-green-100 text-green-800'
        };
      }
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Quizzes</h1>
        <p className="text-gray-600">
          {isTeacher ? 'Manage your quizzes and view results' : 'Take quizzes and check your results'}
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Bar */}
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Filter Dropdown */}
        <div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          >
            <option value="all">All Quizzes</option>
            {isStudent ? (
              <>
                <option value="available">Available</option>
                <option value="completed">Completed</option>
                <option value="upcoming">Coming Soon</option>
                <option value="expired">Expired</option>
              </>
            ) : (
              <>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="completed">Expired</option>
                <option value="results">Has Results</option>
              </>
            )}
          </select>
        </div>
      </div>
      
      {/* Quizzes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuizzes.length > 0 ? (
          filteredQuizzes.map((quiz, index) => {
            const status = getQuizStatus(quiz);
            const hasTimeLimit = quiz.timeLimit && quiz.timeLimit > 0;
            
            return (
              <motion.div
                key={quiz._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                    {quiz.results && (
                      <span className="text-sm text-gray-600">
                        {quiz.results.length} {quiz.results.length === 1 ? 'Attempt' : 'Attempts'}
                      </span>
                    )}
                  </div>
                  
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">{quiz.title}</h2>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    {quiz.course?.title || 'Unknown Course'}
                  </p>
                  
                  <div className="flex items-start space-x-4 text-xs text-gray-500 mb-4">
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-4 w-4 mr-1" />
                      {quiz.questions?.length || 0} Questions
                    </div>
                    
                    {hasTimeLimit && (
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {quiz.timeLimit} mins
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    {isStudent ? (
                      <Link
                        to={quiz.submitted ? `/quizzes/${quiz._id}` : `/quizzes/${quiz._id}/take`}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                          !quiz.submitted && status.label === 'Available'
                            ? 'bg-primary-600 text-white hover:bg-primary-700'
                            : quiz.submitted
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        }`}
                        onClick={(e) => {
                          if (status.label !== 'Available' && !quiz.submitted) {
                            e.preventDefault();
                          }
                        }}
                      >
                        {quiz.submitted ? 'View Results' : 'Start Quiz'}
                      </Link>
                    ) : (
                      <Link
                        to={`/quizzes/${quiz._id}`}
                        className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700"
                      >
                        View Details
                      </Link>
                    )}
                    
                    {quiz.availableFrom && quiz.availableTo && (
                      <span className="text-xs text-gray-500">
                        {moment(quiz.availableFrom).format('MMM D')} - {moment(quiz.availableTo).format('MMM D')}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-10 bg-white rounded-lg shadow-md col-span-full">
            <p className="text-gray-500">No quizzes found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quizzes;
