import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import moment from 'moment';
import AuthContext from '../../context/AuthContext';
import { 
  ArrowLeftIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  DocumentTextIcon, // Added missing import
  CheckIcon, // Added missing import
  XIcon // Added missing import (XMarkIcon in v2 is XIcon in v1)
} from '@heroicons/react/outline';

const QuizDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [quiz, setQuiz] = useState(null);
  const [results, setResults] = useState([]);
  const [studentResult, setStudentResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';
  
  useEffect(() => {
    const fetchQuizDetails = async () => {
      try {
        const res = await axios.get(`/api/quizzes/${id}`);
        setQuiz(res.data.quiz);
        
        // For teachers, get all results
        if (isTeacher) {
          setResults(res.data.quiz.results || []);
        }
        
        // For students, get their result if they've taken the quiz
        if (isStudent) {
          const result = res.data.quiz.results?.find(
            r => r.student._id === user._id
          );
          
          if (result) {
            // Get detailed result with correct answers
            const resultRes = await axios.get(`/api/quizzes/${id}/result`);
            setStudentResult(resultRes.data.result);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching quiz details:', error);
        setError('Failed to load quiz details');
        setLoading(false);
      }
    };
    
    fetchQuizDetails();
  }, [id, isTeacher, isStudent, user._id]);
  
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
          onClick={() => navigate('/quizzes')}
          className="mt-4 inline-block px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Go to Quizzes
        </button>
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
          Back
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="sm:flex sm:justify-between sm:items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{quiz.title}</h1>
            <p className="text-gray-600 mb-4">
              Course: {quiz.course?.title || 'Unknown Course'}
            </p>
            
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <DocumentTextIcon className="h-3 w-3 mr-1" />
                {quiz.questions?.length} Questions
              </span>
              
              {quiz.timeLimit && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  <ClockIcon className="h-3 w-3 mr-1" />
                  Time Limit: {quiz.timeLimit} minutes
                </span>
              )}
              
              {quiz.isPublished ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Published
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Draft
                </span>
              )}
              
              {quiz.results?.length > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <UserIcon className="h-3 w-3 mr-1" />
                  {quiz.results.length} {quiz.results.length === 1 ? 'Attempt' : 'Attempts'}
                </span>
              )}
            </div>
          </div>
          
          {isStudent && !studentResult && (
            <div className="mt-4 sm:mt-0">
              <Link
                to={`/quizzes/${quiz._id}/take`}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
              >
                Take Quiz
              </Link>
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-200 pt-4">
          <div className="prose max-w-none text-gray-700">
            {quiz.description}
          </div>
          
          {quiz.availableFrom && (
            <div className="mt-4 text-sm text-gray-600">
              <p>
                Available: {moment(quiz.availableFrom).format('MMM D, YYYY [at] h:mm A')}
                {quiz.availableTo && (
                  <> to {moment(quiz.availableTo).format('MMM D, YYYY [at] h:mm A')}</>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Student Result Section */}
      {isStudent && studentResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Results</h2>
          
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="sm:flex sm:justify-between sm:items-center">
              <div>
                <p className="text-gray-700">
                  Score: 
                  <span className="font-semibold text-lg ml-2">
                    {studentResult.score} / {studentResult.totalPossibleScore}
                  </span>
                </p>
                <p className="text-gray-700">
                  Percentage: 
                  <span className="font-semibold ml-2">
                    {Math.round((studentResult.score / studentResult.totalPossibleScore) * 100)}%
                  </span>
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <p className="text-sm text-gray-600">
                  Submitted: {moment(studentResult.submittedAt).format('MMM D, YYYY [at] h:mm A')}
                </p>
              </div>
            </div>
          </div>
          
          <h3 className="font-medium text-gray-800 mb-3">Question Review</h3>
          
          <div className="space-y-6">
            {studentResult.answers?.map((answer, index) => (
              <div key={index} className={`p-4 rounded-lg ${
                answer.isCorrect 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-start">
                  <div className={`p-1 rounded-full ${
                    answer.isCorrect ? 'bg-green-100' : 'bg-red-100'
                  } mr-3`}>
                    {answer.isCorrect ? (
                      <CheckIcon className="h-5 w-5 text-green-600" />
                    ) : (
                      <XIcon className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{answer.questionText}</p>
                    
                    <div className="mt-3">
                      <p className="text-sm text-gray-700">Your answer: {answer.selectedOptionText}</p>
                      {!answer.isCorrect && (
                        <p className="text-sm font-medium text-green-800 mt-1">
                          Correct answer: {answer.correctOption?.text}
                        </p>
                      )}
                    </div>
                    
                    {answer.explanation && (
                      <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-700">
                        <p className="font-medium">Explanation:</p>
                        <p>{answer.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
      
      {/* Teacher Results Section */}
      {isTeacher && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Student Results</h2>
          
          {results.length === 0 ? (
            <p className="text-gray-600 text-center py-6">No students have attempted this quiz yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Percentage
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Submitted
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.map((result) => (
                    <tr key={result._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {result.student?.name || 'Unknown Student'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {result.student?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {result.score} / {result.totalPossibleScore}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          (result.score / result.totalPossibleScore) * 100 >= 70
                            ? 'bg-green-100 text-green-800'
                            : (result.score / result.totalPossibleScore) * 100 >= 50
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {Math.round((result.score / result.totalPossibleScore) * 100)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {moment(result.submittedAt).format('MMM D, YYYY [at] h:mm A')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizDetails;
