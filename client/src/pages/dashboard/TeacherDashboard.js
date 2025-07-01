import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const TeacherDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [notices, setNotices] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentCount, setStudentCount] = useState(0);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/users/me/dashboard-teacher', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setCourses(res.data.courses || []);
          setAssignments(res.data.assignments || []);
          setQuizzes(res.data.quizzes || []);
          setNotices(res.data.notices || []);
          setStudentCount(res.data.studentCount || 0);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleLogout = () => {
    logout();
  };

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
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'T')}`}
            alt={user?.name}
            className="h-12 w-12 rounded-full border-2 border-primary-400 shadow"
          />
          <div>
            <h1 className="text-2xl font-extrabold font-heading text-text-dark">Welcome, {user?.name}</h1>
            <p className="text-text-medium mt-1">Your teaching dashboard</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-base font-semibold rounded-xl text-white bg-action-red hover:bg-action-orange transition-all"
        >
          Logout
        </button>
      </motion.div>
      {/* Stats Grid */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-white/90 shadow-card rounded-2xl p-6 flex flex-col items-center border border-primary-50 hover:shadow-card-hover transition-all">
          <span className="text-3xl font-extrabold text-primary-400">{courses.length}</span>
          <span className="text-text-medium mt-1">Courses</span>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-white/90 shadow-card rounded-2xl p-6 flex flex-col items-center border border-primary-50 hover:shadow-card-hover transition-all">
          <span className="text-3xl font-extrabold text-accent-yellow">{assignments.length}</span>
          <span className="text-text-medium mt-1">Assignments</span>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="bg-white/90 shadow-card rounded-2xl p-6 flex flex-col items-center border border-primary-50 hover:shadow-card-hover transition-all">
          <span className="text-3xl font-extrabold text-accent-green">{quizzes.length}</span>
          <span className="text-text-medium mt-1">Quizzes</span>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="bg-white/90 shadow-card rounded-2xl p-6 flex flex-col items-center border border-primary-50 hover:shadow-card-hover transition-all">
          <span className="text-3xl font-extrabold text-secondary-500">{studentCount}</span>
          <span className="text-text-medium mt-1">Students</span>
        </motion.div>
      </motion.div>
      {/* My Courses */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }} className="bg-white/90 shadow-card rounded-2xl mb-8 border border-primary-50">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg font-bold text-text-dark">My Courses</h3>
          <Link to="/create-course" className="text-base text-primary-500 hover:text-secondary-500 font-semibold">Add New</Link>
        </div>
        <div className="border-t border-neutral-50">
          {courses.length > 0 ? (
            <ul className="divide-y divide-neutral-50">
              {courses.slice(0, 5).map((course, idx) => (
                <motion.li key={course._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + idx * 0.05 }} className="px-4 py-4 sm:px-6 hover:bg-primary-50/60 flex justify-between items-center rounded-xl transition-all">
                  <div>
                    <p className="font-semibold text-text-dark">{course.title}</p>
                    <p className="text-sm text-text-medium">{course.code}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/courses/${course._id}`} className="text-primary-500 hover:text-secondary-500 font-semibold">View</Link>
                    <Link to={`/edit-course/${course._id}`} className="text-accent-green hover:text-accent-yellow font-semibold">Edit</Link>
                  </div>
                </motion.li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-6 text-text-medium">No courses found.</div>
          )}
        </div>
      </motion.div>
      {/* Recent Assignments & Quizzes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Recent Assignments */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }} className="bg-white/90 shadow-card rounded-2xl border border-primary-50">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg font-bold text-text-dark">Recent Assignments</h3>
            <Link to="/teacher/assignments/create" className="text-base text-primary-500 hover:text-secondary-500 font-semibold">Add</Link>
          </div>
          <div className="border-t border-neutral-50">
            {assignments.length > 0 ? (
              <ul className="divide-y divide-neutral-50">
                {assignments.slice(0, 5).map((assignment, idx) => (
                  <motion.li key={assignment._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + idx * 0.05 }} className="px-4 py-4 sm:px-6 hover:bg-accent-yellow/10 flex justify-between items-center rounded-xl transition-all">
                    <div>
                      <p className="font-semibold text-text-dark">{assignment.title}</p>
                      <p className="text-xs text-text-medium">Due: {assignment.deadline}</p>
                    </div>
                    <Link to={`/assignments/${assignment._id}`} className="text-primary-500 hover:text-secondary-500 font-semibold">View</Link>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-6 text-text-medium">No assignments found.</div>
            )}
          </div>
        </motion.div>
        {/* Recent Quizzes */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.8 }} className="bg-white/90 shadow-card rounded-2xl border border-primary-50">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg font-bold text-text-dark">Recent Quizzes</h3>
            <Link to="/teacher/quizzes/create" className="text-base text-primary-500 hover:text-secondary-500 font-semibold">Add</Link>
          </div>
          <div className="border-t border-neutral-50">
            {quizzes.length > 0 ? (
              <ul className="divide-y divide-neutral-50">
                {quizzes.slice(0, 5).map((quiz, idx) => (
                  <motion.li key={quiz._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + idx * 0.05 }} className="px-4 py-4 sm:px-6 hover:bg-accent-yellow/10 flex justify-between items-center rounded-xl transition-all">
                    <div>
                      <p className="font-semibold text-text-dark">{quiz.title}</p>
                      <p className="text-xs text-text-medium">Questions: {quiz.questions?.length || 0}</p>
                    </div>
                    <Link to={`/quizzes/${quiz._id}`} className="text-primary-500 hover:text-secondary-500 font-semibold">View</Link>
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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.9 }} className="bg-white/90 shadow-card rounded-2xl mb-8 border border-primary-50">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg font-bold text-text-dark">Notices</h3>
          <Link to="/teacher/notices/create" className="text-base text-primary-500 hover:text-secondary-500 font-semibold">Add</Link>
        </div>
        <div className="border-t border-neutral-50">
          {notices.length > 0 ? (
            <ul className="divide-y divide-neutral-50">
              {notices.slice(0, 5).map((notice, idx) => (
                <motion.li key={notice._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + idx * 0.05 }} className="px-4 py-4 sm:px-6 hover:bg-primary-50/60 flex justify-between items-center rounded-xl transition-all">
                  <div>
                    <p className="font-semibold text-text-dark">{notice.title}</p>
                    <p className="text-xs text-text-medium">{notice.createdAt}</p>
                  </div>
                  <Link to={`/notices/${notice._id}`} className="text-primary-500 hover:text-secondary-500 font-semibold">View</Link>
                </motion.li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-6 text-text-medium">No notices found.</div>
          )}
        </div>
      </motion.div>
      {/* Call to Action */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 1 }} className="flex gap-4">
        <Link to="/create-course" className="inline-block px-4 py-2 bg-accent-green text-white rounded-xl hover:bg-primary-400 transition-colors font-semibold shadow">Create New Course</Link>
        <Link to="/teacher/assignments/create" className="inline-block px-4 py-2 bg-primary-400 text-white rounded-xl hover:bg-accent-yellow transition-colors font-semibold shadow">Add Assignment</Link>
        <Link to="/teacher/quizzes/create" className="inline-block px-4 py-2 bg-secondary-500 text-white rounded-xl hover:bg-primary-400 transition-colors font-semibold shadow">Add Quiz</Link>
        <Link to="/teacher/notices/create" className="inline-block px-4 py-2 bg-action-orange text-white rounded-xl hover:bg-action-red transition-colors font-semibold shadow">Add Notice</Link>
      </motion.div>
    </div>
  );
};

export default TeacherDashboard;