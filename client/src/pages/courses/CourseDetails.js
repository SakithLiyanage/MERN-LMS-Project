import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Tab } from '@headlessui/react';
import moment from 'moment';
import AuthContext from '../../context/AuthContext';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  CalendarIcon,
  DocumentTextIcon,
  BookOpenIcon,
  AcademicCapIcon
} from '@heroicons/react/outline';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [notices, setNotices] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const res = await axios.get(`/api/courses/${id}`);
        setCourse(res.data.course);
        setStudents(res.data.students);
        setAssignments(res.data.assignments);
        setQuizzes(res.data.quizzes);
        setNotices(res.data.notices);
        setMaterials(res.data.materials);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id]);

  const handleDeleteMaterial = async (materialId) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      try {
        await axios.delete(`/api/materials/${materialId}`);
        setMaterials(materials.filter((material) => material._id !== materialId));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await axios.delete(`/api/assignments/${assignmentId}`);
        setAssignments(assignments.filter((assignment) => assignment._id !== assignmentId));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        const response = await axios.delete(`/api/quizzes/${quizId}`);
        
        if (response.data.success) {
          toast.success('Quiz deleted successfully!');
          setQuizzes(quizzes.filter((quiz) => quiz._id !== quizId));
        } else {
          toast.error('Failed to delete quiz');
        }
      } catch (error) {
        console.error('Error deleting quiz:', error);
        const errorMessage = error.response?.data?.message || 'Failed to delete quiz';
        toast.error(errorMessage);
      }
    }
  };

  const handleDeleteNotice = async (noticeId) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      try {
        await axios.delete(`/api/notices/${noticeId}`);
        setNotices(notices.filter((notice) => notice._id !== noticeId));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDownload = async (fileName, originalName) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/materials/download/${encodeURIComponent(fileName)}`,
        {
          responseType: 'blob',
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', originalName || fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Download failed: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h2>
          <p className="text-gray-700 mb-4">The course you are looking for does not exist.</p>
          <div className="flex">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 bg-primary-600 border border-transparent rounded-md font-medium text-sm text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Fix for Line 350:30 error - define isTeacher
  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';
  const isCourseTeacher = isTeacher && course?.teacher?._id === user?._id;

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{course.title}</h2>
        <p className="text-gray-700 mb-4">{course.description}</p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center mb-4 sm:mb-0">
            <img
              src={course.teacher?.photoURL}
              alt={course.teacher?.name}
              className="h-10 w-10 rounded-full mr-3"
            />
            <div>
              <p className="text-sm text-gray-500">Instructor</p>
              <p className="text-base font-medium text-gray-800">{course.teacher?.name}</p>
            </div>
          </div>
          <div className="flex-shrink-0">
            {isCourseTeacher && (
              <Link
                to={`/teacher/courses/edit/${course.id}`}
                className="inline-flex items-center px-4 py-2 bg-primary-600 border border-transparent rounded-md font-medium text-sm text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Edit Course
              </Link>
            )}
          </div>
        </div>

        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1">
            <Tab
              className={({ selected }) =>
                `w-full py-2.5 text-sm font-medium rounded-lg ${
                  selected ? 'bg-white shadow' : 'text-gray-500 hover:bg-gray-50'
                }`
              }
            >
              Overview
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full py-2.5 text-sm font-medium rounded-lg ${
                  selected ? 'bg-white shadow' : 'text-gray-500 hover:bg-gray-50'
                }`
              }
            >
              Materials
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full py-2.5 text-sm font-medium rounded-lg ${
                  selected ? 'bg-white shadow' : 'text-gray-500 hover:bg-gray-50'
                }`
              }
            >
              Assignments
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full py-2.5 text-sm font-medium rounded-lg ${
                  selected ? 'bg-white shadow' : 'text-gray-500 hover:bg-gray-50'
                }`
              }
            >
              Quizzes
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full py-2.5 text-sm font-medium rounded-lg ${
                  selected ? 'bg-white shadow' : 'text-gray-500 hover:bg-gray-50'
                }`
              }
            >
              Notices
            </Tab>
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Course Overview</h3>
              <p className="text-gray-700 mb-4">{course.overview}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-800">Course Details</h4>
                  <div className="mt-2">
                    <span className="text-sm text-gray-500">Category:</span>
                    <span className="text-sm font-medium text-gray-800 ml-1">{course.category}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-sm text-gray-500">Level:</span>
                    <span className="text-sm font-medium text-gray-800 ml-1">{course.level}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-sm text-gray-500">Language:</span>
                    <span className="text-sm font-medium text-gray-800 ml-1">{course.language}</span>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-800">Enrollment</h4>
                  <div className="mt-2">
                    <span className="text-sm text-gray-500">Start Date:</span>
                    <span className="text-sm font-medium text-gray-800 ml-1">
                      {moment(course.startDate).format('MMMM D, YYYY')}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-sm text-gray-500">End Date:</span>
                    <span className="text-sm font-medium text-gray-800 ml-1">
                      {moment(course.endDate).format('MMMM D, YYYY')}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-sm text-gray-500">Enrollment Deadline:</span>
                    <span className="text-sm font-medium text-gray-800 ml-1">
                      {moment(course.enrollmentDeadline).format('MMMM D, YYYY')}
                    </span>
                  </div>
                </div>
              </div>
            </Tab.Panel>

            {/* Materials Tab */}
            <Tab.Panel className="p-6">
              {isCourseTeacher && (
                <div className="mb-4">
                  <Link
                    to={`/teacher/materials/create/${course._id}`}
                    className="inline-flex items-center px-4 py-2 bg-primary-600 border border-transparent rounded-md font-medium text-sm text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" /> Add Material
                  </Link>
                </div>
              )}
              
              <div className="space-y-4">
                {materials.length > 0 ? (
                  materials.map((material) => (
                    <motion.div
                      key={material._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-800">{material.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            Added: {moment(material.createdAt).format('MMMM D, YYYY')}
                          </p>
                        </div>
                        <div className="flex">
                          <button
                            onClick={() => handleDownload(material.fileName, material.originalName)}
                            className="px-3 py-1 text-xs rounded-md text-white bg-primary-600 hover:bg-primary-700"
                          >
                            Download {material.originalName || material.fileName}
                          </button>

                          {isCourseTeacher && (
                            <button
                              className="ml-2 text-gray-500 hover:text-red-600"
                              onClick={() => handleDeleteMaterial(material._id)}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No materials available for this course yet.</p>
                  </div>
                )}
              </div>
            </Tab.Panel>

            {/* Assignments Tab */}
            <Tab.Panel className="p-6">
              {isCourseTeacher && (
                <div className="mb-4">
                  <Link
                    to={`/teacher/assignments/create/${course._id}`}
                    className="inline-flex items-center px-4 py-2 bg-primary-600 border border-transparent rounded-md font-medium text-sm text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" /> Add Assignment
                  </Link>
                </div>
              )}
              
              <div className="space-y-4">
                {assignments.length > 0 ? (
                  assignments.map((assignment) => (
                    <motion.div
                      key={assignment._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-800">{assignment.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {assignment.description.substring(0, 100)}
                            {assignment.description.length > 100 && '...'}
                          </p>
                          <div className="flex items-center text-xs text-gray-500 mt-2 space-x-4">
                            <span className="flex items-center">
                              Due: {moment(assignment.deadline).format('MMM D, YYYY')}
                            </span>
                            <span>Points: {assignment.totalPoints}</span>
                            <span>
                              Submissions: {assignment.submissions?.length || 0}
                            </span>
                          </div>
                        </div>
                        <div className="flex">
                          <Link
                            to={`/assignments/${assignment._id}`}
                            className="px-3 py-1 text-xs rounded-md text-white bg-primary-600 hover:bg-primary-700"
                          >
                            View Details
                          </Link>

                          {isCourseTeacher && (
                            <button
                              className="ml-2 text-gray-500 hover:text-red-600"
                              onClick={() => handleDeleteAssignment(assignment._id)}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No assignments available for this course yet.</p>
                  </div>
                )}
              </div>
            </Tab.Panel>

            {/* Quizzes Tab */}
            <Tab.Panel className="p-6">
              {isCourseTeacher && (
                <div className="mb-4">
                  <Link
                    to={`/teacher/quizzes/create/${course._id}`}
                    className="inline-flex items-center px-4 py-2 bg-primary-600 border border-transparent rounded-md font-medium text-sm text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" /> Add Quiz
                  </Link>
                </div>
              )}
              
              <div className="space-y-4">
                {quizzes.length > 0 ? (
                  quizzes.map((quiz) => {
                    const isCompleted = isStudent && quiz.results?.some(
                      result => result.student.toString() === user._id
                    );
                    
                    return (
                      <motion.div
                        key={quiz._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-800">{quiz.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {quiz.description.substring(0, 100)}
                              {quiz.description.length > 100 && '...'}
                            </p>
                            <div className="flex items-center text-xs text-gray-500 mt-2 space-x-4">
                              <span>Questions: {quiz.questions?.length || 0}</span>
                              <span>Time Limit: {quiz.timeLimit || 'No limit'} minutes</span>
                              {quiz.availableFrom && (
                                <span>Available from: {moment(quiz.availableFrom).format('MMM D')}</span>
                              )}
                              {quiz.availableTo && (
                                <span>Available until: {moment(quiz.availableTo).format('MMM D')}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex">
                            {isTeacher ? (
                              <Link
                                to={`/quizzes/${quiz._id}`}
                                className="px-3 py-1 text-xs rounded-md text-white bg-primary-600 hover:bg-primary-700"
                              >
                                View Results
                              </Link>
                            ) : isCompleted ? (
                              <span className="px-3 py-1 text-xs rounded-md bg-green-100 text-green-800">
                                Completed
                              </span>
                            ) : (
                              <Link
                                to={`/quizzes/${quiz._id}/take`}
                                className="px-3 py-1 text-xs rounded-md text-white bg-primary-600 hover:bg-primary-700"
                              >
                                Take Quiz
                              </Link>
                            )}

                            {isCourseTeacher && (
                              <button
                                className="ml-2 text-gray-500 hover:text-red-600"
                                onClick={() => handleDeleteQuiz(quiz._id)}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No quizzes available for this course yet.</p>
                  </div>
                )}
              </div>
            </Tab.Panel>

            {/* Notices Tab */}
            <Tab.Panel className="p-6">
              {isCourseTeacher && (
                <div className="mb-4">
                  <Link
                    to={`/teacher/notices/create/${course._id}`}
                    className="inline-flex items-center px-4 py-2 bg-primary-600 border border-transparent rounded-md font-medium text-sm text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" /> Add Notice
                  </Link>
                </div>
              )}
              
              <div className="space-y-4">
                {notices.length > 0 ? (
                  notices.map((notice) => (
                    <motion.div
                      key={notice._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg border ${
                        notice.priority === 'high'
                          ? 'bg-red-50 border-red-200'
                          : notice.priority === 'medium'
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-medium text-gray-800">{notice.title}</h3>
                            {notice.pinned && (
                              <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                                Pinned
                              </span>
                            )}
                            <span
                              className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                                notice.priority === 'high'
                                  ? 'bg-red-100 text-red-800'
                                  : notice.priority === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {notice.priority.charAt(0).toUpperCase() + notice.priority.slice(1)} Priority
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{notice.content}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            Posted: {moment(notice.createdAt).format('MMMM D, YYYY')} by {notice.author.name}
                          </p>
                        </div>
                        {isCourseTeacher && (
                          <button
                            className="text-gray-500 hover:text-red-600"
                            onClick={() => handleDeleteNotice(notice._id)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No notices available for this course yet.</p>
                  </div>
                )}
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

export default CourseDetails;