import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import { toast } from 'react-toastify';

const TeacherDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [notices, setNotices] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get auth token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No authentication token found');
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        // Use try/catch for each request individually
        try {
          const coursesRes = await axios.get('/api/courses/teacher', config);
          setCourses(coursesRes.data?.success ? coursesRes.data.courses || [] : []);
        } catch (error) {
          console.error('Error fetching teacher courses:', error);
          setCourses([]);
        }

        // Initialize with empty arrays to avoid errors
        setNotices([]);
        setAssignments([]);
        setQuizzes([]);
        
      } catch (error) {
        console.error('Error fetching teacher data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
        <button 
          onClick={handleLogout} 
          className="px-4 py-2 bg-red-600 text-white rounded-md"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">📚 Courses</h2>
            <Link 
              to="/create-course" 
              className="text-sm px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Add New
            </Link>
          </div>
          
          {loading ? (
            <p className="text-gray-500">Loading courses...</p>
          ) : courses.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {courses.map(course => (
                <li key={course._id} className="flex justify-between items-center py-3">
                  <div>
                    <span className="font-medium">{course.title}</span>
                    {course.code && <span className="text-xs text-gray-500 ml-2">({course.code})</span>}
                  </div>
                  <div className="flex space-x-2">
                    <Link to={`/courses/${course._id}`} className="text-blue-500 hover:underline">
                      View
                    </Link>
                    <Link to={`/edit-course/${course._id}`} className="text-green-500 hover:underline">
                      Edit
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 py-2">No courses available. Create your first course!</p>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">📣 Notices</h2>
          <ul>
            {notices.length > 0 ? (
              notices.map(notice => (
                <li key={notice._id} className="flex justify-between items-center py-2">
                  <span>{notice.title}</span>
                  <Link to={`/notices/${notice._id}`} className="text-blue-500">
                    View
                  </Link>
                </li>
              ))
            ) : (
              <li className="text-gray-500">No notices available</li>
            )}
          </ul>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">📝 Assignments</h2>
          <ul>
            {assignments.length > 0 ? (
              assignments.map(assignment => (
                <li key={assignment._id} className="flex justify-between items-center py-2">
                  <span>{assignment.title}</span>
                  <Link to={`/assignments/${assignment._id}`} className="text-blue-500">
                    View
                  </Link>
                </li>
              ))
            ) : (
              <li className="text-gray-500">No assignments available</li>
            )}
          </ul>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">❓ Quizzes</h2>
          <ul>
            {quizzes.length > 0 ? (
              quizzes.map(quiz => (
                <li key={quiz._id} className="flex justify-between items-center py-2">
                  <span>{quiz.title}</span>
                  <Link to={`/quizzes/${quiz._id}`} className="text-blue-500">
                    View
                  </Link>
                </li>
              ))
            ) : (
              <li className="text-gray-500">No quizzes available</li>
            )}
          </ul>
        </div>
      </div>

      <div className="mt-4">
        <Link 
          to="/create-course" 
          className="inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Create New Course
        </Link>
      </div>
    </div>
  );
};

export default TeacherDashboard;