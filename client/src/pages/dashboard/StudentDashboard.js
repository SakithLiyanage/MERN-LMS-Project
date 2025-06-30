// Updated imports for Heroicons v2
import {
  BookOpenIcon,
  ClipboardDocumentCheckIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  BellIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import AuthContext from '../../context/AuthContext';

const StudentDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const coursesRes = await axios.get('/api/users/me/courses', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (coursesRes.data.success) {
          setCourses(coursesRes.data.courses);
          
          // Once we have courses, fetch related content
          if (coursesRes.data.courses.length > 0) {
            const courseIds = coursesRes.data.courses.map(course => course._id);
            
            // Get assignments
            try {
              const assignmentsRes = await axios.get('/api/users/me/assignments', {
                headers: { Authorization: `Bearer ${token}` }
              });
              setAssignments(assignmentsRes.data.data || []);
            } catch (err) {
              console.error('Error fetching assignments:', err);
              setAssignments([]);
            }
            
            // Get quizzes
            try {
              const quizzesRes = await axios.get('/api/users/me/quizzes', {
                headers: { Authorization: `Bearer ${token}` }
              });
              setQuizzes(quizzesRes.data.data || []);
            } catch (err) {
              console.error('Error fetching quizzes:', err);
              setQuizzes([]);
            }
            
            // Get quiz results
            try {
              const resultsRes = await axios.get('/api/users/me/quiz-results', {
                headers: { Authorization: `Bearer ${token}` }
              });
              setQuizResults(resultsRes.data.data || []);
            } catch (err) {
              console.error('Error fetching quiz results:', err);
              setQuizResults([]);
            }
            
            // Get notices
            try {
              const noticesRes = await axios.get('/api/users/me/notices', {
                headers: { Authorization: `Bearer ${token}` }
              });
              setNotices(noticesRes.data.data || []);
            } catch (err) {
              console.error('Error fetching notices:', err);
              setNotices([]);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  // Defensive: always ensure assignments is an array
  const safeAssignments = Array.isArray(assignments) ? assignments : [];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}</h1>
          <p className="text-gray-600 mt-1">Your learning dashboard</p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link
            to="/courses"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Explore Courses
          </Link>
          
          <button
            onClick={logout}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
      
      {/* Progress Overview */}
      <div className="bg-white overflow-hidden shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <ChartBarIcon className="mr-2 h-5 w-5 text-primary-500" />
            Learning Progress
          </h2>
          
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="bg-gray-50 overflow-hidden rounded-lg px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Enrolled Courses</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{courses?.length || 0}</dd>
            </div>
            
            <div className="bg-gray-50 overflow-hidden rounded-lg px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Completed Quizzes</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{quizResults?.length || 0}</dd>
            </div>
            
            <div className="bg-gray-50 overflow-hidden rounded-lg px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Pending Assignments</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {safeAssignments.filter(a => !a.submitted).length}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Enrolled Courses */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">My Courses</h3>
            <Link 
              to="/courses" 
              className="text-sm text-primary-600 hover:text-primary-900"
            >
              View all
            </Link>
          </div>
          
          <div className="border-t border-gray-200">
            {courses.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {courses.slice(0, 5).map(course => (
                  <li key={course._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <Link to={`/courses/${course._id}`} className="flex justify-between">
                      <div className="flex items-center">
                        <AcademicCapIcon className="h-6 w-6 text-primary-500 mr-3" />
                        <div>
                          <p className="font-medium text-gray-800">{course.title}</p>
                          <p className="text-sm text-gray-500">
                            {course.teacher?.name || 'Instructor'}
                          </p>
                        </div>
                      </div>
                      <div className="ml-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {course.code || 'Course'}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-10 px-4 text-center">
                <p className="text-gray-500">You're not enrolled in any courses yet.</p>
                <Link 
                  to="/courses" 
                  className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                >
                  Find Courses
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Quiz Results */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">My Quiz Results</h3>
          </div>
          
          <div className="border-t border-gray-200">
            {quizResults.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {quizResults.slice(0, 5).map(result => (
                  <li key={result._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <Link to={`/quizzes/${result.quiz}/results/${result._id}`} className="flex justify-between">
                      <div>
                        <p className="font-medium text-gray-800">{result.quizTitle}</p>
                        <p className="text-sm text-gray-500">
                          Completed {moment(result.completedAt).fromNow()}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          result.passed 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {result.score}/{result.totalPoints} ({Math.round((result.score/result.totalPoints)*100)}%)
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-10 px-4 text-center">
                <p className="text-gray-500">You haven't taken any quizzes yet.</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Upcoming Assignments */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Upcoming Assignments</h3>
          </div>
          
          <div className="border-t border-gray-200">
            {safeAssignments.filter(a => !a.submitted).length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {safeAssignments
                  .filter(a => !a.submitted)
                  .slice(0, 5)
                  .map(assignment => (
                    <li key={assignment._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                      <Link to={`/assignments/${assignment._id}`} className="flex justify-between">
                        <div>
                          <p className="font-medium text-gray-800">{assignment.title}</p>
                          <p className="text-sm text-gray-500">
                            {assignment.course?.title || 'Course'}
                          </p>
                        </div>
                        <div className="flex items-center text-sm text-red-600">
                          <ClockIcon className="mr-1 h-4 w-4" />
                          Due {moment(assignment.dueDate).format('MMM D')}
                        </div>
                      </Link>
                    </li>
                  ))}
              </ul>
            ) : (
              <div className="py-10 px-4 text-center">
                <p className="text-gray-500">No pending assignments. Great job!</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Recent Notices */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Notices</h3>
          </div>
          
          <div className="border-t border-gray-200">
            {notices.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {notices.slice(0, 5).map(notice => (
                  <li key={notice._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <Link to={`/courses/${notice.courseId}`} className="flex justify-between">
                      <div>
                        <div className="flex items-center">
                          <p className="font-medium text-gray-800">{notice.title}</p>
                          {notice.priority === 'high' && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Important
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {notice.courseTitle} • {moment(notice.createdAt).fromNow()}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-10 px-4 text-center">
                <p className="text-gray-500">No recent notices.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;