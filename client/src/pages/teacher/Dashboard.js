import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import {
  BookOpenIcon,
  ClipboardCheckIcon,
  DocumentTextIcon,
  UserGroupIcon,
  BellIcon,
  PlusCircleIcon
} from '@heroicons/react/outline';
import { motion } from 'framer-motion';

const TeacherDashboard = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    pendingAssignments: 0,
    completedQuizzes: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        // Fetch courses
        const coursesRes = await axios.get('/api/courses');
        setCourses(coursesRes.data.courses);

        // Calculate stats
        const courseCount = coursesRes.data.courses.length;
        let studentCount = 0;
        let pendingCount = 0;
        
        // Fetch assignments
        const assignmentsRes = await axios.get('/api/assignments/teacher');
        pendingCount = assignmentsRes.data.assignments.filter(
          ass => ass.submissions?.some(sub => !sub.graded)
        ).length;
        
        // Count unique students across all courses
        const studentIds = new Set();
        coursesRes.data.courses.forEach(course => {
          course.students?.forEach(student => {
            studentIds.add(student._id);
          });
        });
        
        // Get recent activities
        const activitiesRes = await axios.get('/api/activities/recent');
        setRecentActivities(activitiesRes.data.activities);
        
        setStats({
          totalCourses: courseCount,
          totalStudents: studentIds.size,
          pendingAssignments: pendingCount,
          completedQuizzes: 0, // This would come from a quizzes API
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching teacher data:', error);
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, []);

  const statCards = [
    {
      title: 'Courses',
      value: stats.totalCourses,
      icon: <BookOpenIcon className="h-6 w-6 text-blue-500" />,
      color: 'bg-blue-100',
    },
    {
      title: 'Students',
      value: stats.totalStudents,
      icon: <DocumentTextIcon className="h-6 w-6 text-green-500" />,
      color: 'bg-green-100',
    },
    {
      title: 'Pending Submissions',
      value: stats.pendingAssignments,
      icon: <ClipboardCheckIcon className="h-6 w-6 text-yellow-500" />,
      color: 'bg-yellow-100',
    },
    {
      title: 'Announcements',
      value: recentActivities.length,
      icon: <BellIcon className="h-6 w-6 text-purple-500" />,
      color: 'bg-purple-100',
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Teacher Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}!</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link
            to="/teacher/courses/create"
            className="inline-flex items-center px-4 py-2 bg-primary-600 border border-transparent rounded-md font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusCircleIcon className="mr-2 h-5 w-5" />
            Create New Course
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`${stat.color} p-6 rounded-lg shadow-sm`}
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-white mr-4">
                {stat.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* My Courses */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">My Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.length > 0 ? (
            courses.map((course, index) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div 
                  className="h-32 bg-cover bg-center" 
                  style={{ 
                    backgroundImage: `url(${course.coverImage ? `/uploads/${course.coverImage}` : '/img/default-course.jpg'})` 
                  }}
                ></div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800">{course.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">Code: {course.code}</p>
                  <p className="text-gray-600 text-sm mt-1">
                    {course.students?.length || 0} Students
                  </p>
                  <div className="mt-4">
                    <Link
                      to={`/courses/${course._id}`}
                      className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                    >
                      View Course
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full">
              <p className="text-gray-500 text-center py-8">
                You haven't created any courses yet. 
                <Link to="/teacher/courses/create" className="text-primary-600 hover:underline ml-1">
                  Create your first course
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activities */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activities</h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {recentActivities.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {recentActivities.map((activity, index) => (
                <div key={activity._id} className="p-4 hover:bg-gray-50">
                  <p className="text-gray-800">{activity.description}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </span>
                    {activity.link && (
                      <Link
                        to={activity.link}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        View Details
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent activities found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;