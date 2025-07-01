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
import { motion } from 'framer-motion';

const StudentDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/users/me/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setCourses(res.data.courses || []);
          setAssignments(res.data.assignments || []);
          setQuizzes(res.data.quizzes || []);
          setQuizResults(res.data.quizResults || []);
          setNotices(res.data.notices || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // After fetching assignments, quizzes, quizResults, etc. from backend:
  // Mark assignments as submitted if the student has a submission
  const userId = user?._id;
  const assignmentsWithStatus = assignments.map(a => ({
    ...a,
    submitted: a.submissions && Array.isArray(a.submissions)
      ? a.submissions.some(sub => sub.student?.toString() === userId)
      : false
  }));
  // Mark quizzes as completed if the student has a quiz result
  const quizIdsWithResults = new Set((quizResults || []).map(qr => qr.quizId?.toString()));
  const quizzesWithStatus = quizzes.map(q => ({
    ...q,
    completed: quizIdsWithResults.has(q._id?.toString())
  }));

  // Defensive: always ensure assignments is an array
  const safeAssignments = Array.isArray(assignmentsWithStatus) ? assignmentsWithStatus : [];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-neutral-50 min-h-screen">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="flex items-center gap-4">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'S')}`}
            alt={user?.name}
            className="h-12 w-12 rounded-full border-2 border-primary-400 shadow"
          />
          <div>
            <h1 className="text-2xl font-extrabold font-heading text-text-dark">Welcome, {user?.name}</h1>
            <p className="text-text-medium mt-1">Your learning dashboard</p>
          </div>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link
            to="/courses"
            className="inline-flex items-center px-4 py-2 border border-primary-100 shadow-sm text-base font-semibold rounded-xl text-primary-500 bg-white/80 hover:bg-primary-50 transition-all"
          >
            Explore Courses
          </Link>
          <button
            onClick={logout}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-base font-semibold rounded-xl text-white bg-action-red hover:bg-action-orange transition-all"
          >
            Logout
          </button>
        </div>
      </motion.div>
      {/* Stats Grid */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-white/90 shadow-card rounded-2xl p-6 flex flex-col items-center border border-primary-50 hover:shadow-card-hover transition-all">
          <AcademicCapIcon className="h-8 w-8 text-primary-400 mb-2" />
          <div className="text-3xl font-extrabold text-text-dark">{courses?.length || 0}</div>
          <div className="text-text-medium mt-1">Enrolled Courses</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-white/90 shadow-card rounded-2xl p-6 flex flex-col items-center border border-primary-50 hover:shadow-card-hover transition-all">
          <ClipboardDocumentCheckIcon className="h-8 w-8 text-accent-green mb-2" />
          <div className="text-3xl font-extrabold text-text-dark">{quizResults?.length || 0}</div>
          <div className="text-text-medium mt-1">Completed Quizzes</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="bg-white/90 shadow-card rounded-2xl p-6 flex flex-col items-center border border-primary-50 hover:shadow-card-hover transition-all">
          <DocumentTextIcon className="h-8 w-8 text-accent-yellow mb-2" />
          <div className="text-3xl font-extrabold text-text-dark">{safeAssignments.filter(a => !a.submitted).length}</div>
          <div className="text-text-medium mt-1">Pending Assignments</div>
        </motion.div>
      </motion.div>
      {/* My Courses */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="bg-white/90 shadow-card rounded-2xl mb-8 border border-primary-50">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg font-bold text-text-dark">My Courses</h3>
          <Link to="/courses" className="text-base text-primary-500 hover:text-secondary-500 font-semibold">View all</Link>
        </div>
        <div className="border-t border-neutral-50">
          {courses.length > 0 ? (
            <ul className="divide-y divide-neutral-50">
              {courses.slice(0, 5).map((course, idx) => (
                <motion.li key={course._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + idx * 0.05 }} className="px-4 py-4 sm:px-6 hover:bg-primary-50/60 flex justify-between items-center rounded-xl transition-all">
                  <Link to={`/courses/${course._id}`} className="flex justify-between items-center w-full">
                    <div className="flex items-center">
                      <AcademicCapIcon className="h-6 w-6 text-primary-400 mr-3" />
                      <div>
                        <p className="font-semibold text-text-dark">{course.title}</p>
                        <p className="text-sm text-text-medium">{course.teacher?.name || 'Instructor'}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-100 text-primary-700 border border-primary-400 shadow">{course.code || 'Course'}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-6 text-text-medium">You are not enrolled in any courses yet.</div>
          )}
        </div>
      </motion.div>
      {/* Recent Assignments & Quizzes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Recent Assignments */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-white/90 shadow-card rounded-2xl border border-primary-50">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg font-bold text-text-dark">Recent Assignments</h3>
            <Link to="/assignments" className="text-base text-primary-500 hover:text-secondary-500 font-semibold">View all</Link>
          </div>
          <div className="border-t border-neutral-50">
            {safeAssignments.length > 0 ? (
              <ul className="divide-y divide-neutral-50">
                {safeAssignments.slice(0, 5).map((assignment, idx) => (
                  <motion.li key={assignment._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + idx * 0.05 }} className="px-4 py-4 sm:px-6 hover:bg-accent-yellow/10 flex justify-between items-center rounded-xl transition-all">
                    <div>
                      <p className="font-semibold text-text-dark">{assignment.title}</p>
                      <p className="text-xs text-text-medium">Due: {moment(assignment.deadline).format('MMM D, YYYY')}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${assignment.submitted ? 'bg-accent-green text-white' : 'bg-accent-yellow text-text-dark'} border shadow`}>{assignment.submitted ? 'Submitted' : 'Pending'}</span>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-6 text-text-medium">No assignments found.</div>
            )}
          </div>
        </motion.div>
        {/* Recent Quizzes */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="bg-white/90 shadow-card rounded-2xl border border-primary-50">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg font-bold text-text-dark">Recent Quizzes</h3>
            <Link to="/quizzes" className="text-base text-primary-500 hover:text-secondary-500 font-semibold">View all</Link>
          </div>
          <div className="border-t border-neutral-50">
            {quizzesWithStatus.length > 0 ? (
              <ul className="divide-y divide-neutral-50">
                {quizzesWithStatus.slice(0, 5).map((quiz, idx) => (
                  <motion.li key={quiz._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + idx * 0.05 }} className="px-4 py-4 sm:px-6 hover:bg-accent-yellow/10 flex justify-between items-center rounded-xl transition-all">
                    <div>
                      <p className="font-semibold text-text-dark">{quiz.title}</p>
                      <p className="text-xs text-text-medium">Questions: {quiz.questions?.length || 0}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${quiz.completed ? 'bg-accent-green text-white' : 'bg-accent-yellow text-text-dark'} border shadow`}>{quiz.completed ? 'Completed' : 'Pending'}</span>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-6 text-text-medium">No quizzes found.</div>
            )}
          </div>
        </motion.div>
      </div>
      {/* Notices */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="bg-white/90 shadow-card rounded-2xl mb-8 border border-primary-50">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg font-bold text-text-dark">Notices</h3>
        </div>
        <div className="border-t border-neutral-50">
          {notices.length > 0 ? (
            <ul className="divide-y divide-neutral-50">
              {notices.slice(0, 5).map((notice, idx) => (
                <motion.li key={notice._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + idx * 0.05 }} className="px-4 py-4 sm:px-6 hover:bg-primary-50/60 flex justify-between items-center rounded-xl transition-all">
                  <div>
                    <p className="font-semibold text-text-dark">{notice.title}</p>
                    <p className="text-xs text-text-medium">{moment(notice.createdAt).format('MMM D, YYYY')}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${notice.priority === 'high' ? 'bg-action-red text-white' : notice.priority === 'medium' ? 'bg-action-orange text-white' : 'bg-primary-100 text-primary-700'} border shadow`}>{notice.priority?.charAt(0).toUpperCase() + notice.priority?.slice(1) || 'Low'}</span>
                </motion.li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-6 text-text-medium">No notices found.</div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default StudentDashboard;