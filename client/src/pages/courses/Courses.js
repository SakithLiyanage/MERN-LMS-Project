import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import { PlusCircleIcon, BookOpenIcon, SearchIcon } from '@heroicons/react/outline';

const Courses = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        console.log('Fetching courses...');
        
        // Add error handling and timeout
        const res = await axios.get('/api/courses', {
          timeout: 15000, // Increase timeout
          headers: { 
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        }).catch(error => {
          console.error('Axios error details:', error.response || error);
          throw error;
        });
        
        console.log('API Response:', res?.data);
        
        if (res?.data?.success) {
          // Make sure we handle the response data safely
          const coursesData = res.data.courses || [];
          console.log(`Successfully loaded ${coursesData.length} courses`);
          setCourses(coursesData);
          setFilteredCourses(coursesData);
        } else {
          console.warn('Unexpected API response format:', res?.data);
          // Initialize with empty arrays to avoid UI errors
          setCourses([]);
          setFilteredCourses([]);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        // Don't break UI - initialize with empty arrays
        setCourses([]);
        setFilteredCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Handle safe filtering with optional chaining
  useEffect(() => {
    if (!courses || !courses.length) {
      setFilteredCourses([]);
      return;
    }

    if (searchTerm.trim() === '') {
      setFilteredCourses(courses);
      return;
    }

    const filtered = courses.filter(
      (course) =>
        course?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course?.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredCourses(filtered);
  }, [searchTerm, courses]);

  // Handle course enrollment
  const handleEnrollCourse = async (courseId) => {
    try {
      await axios.post(`/api/courses/${courseId}/enroll`);
      // Update UI to reflect enrollment
      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course._id === courseId
            ? { ...course, students: [...(course.students || []), user._id] }
            : course
        )
      );
    } catch (error) {
      console.error('Error enrolling in course:', error);
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Courses</h1>
          <p className="text-gray-600">Browse and manage your courses</p>
        </div>
        {isTeacher && (
          <div className="mt-4 md:mt-0">
            <Link
              to="/teacher/courses/create"
              className="inline-flex items-center px-4 py-2 bg-primary-600 border border-transparent rounded-md font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusCircleIcon className="mr-2 h-5 w-5" />
              Create New Course
            </Link>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          placeholder="Search courses by title, description or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course, index) => {
            // Check if student is enrolled
            const isEnrolled = isStudent && 
              course.students?.some(studentId => studentId === user._id);
            
            return (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div 
                  className="h-40 bg-cover bg-center" 
                  style={{ 
                    backgroundImage: `url(${course.coverImage ? `/uploads/${course.coverImage}` : '/img/default-course.jpg'})` 
                  }}
                ></div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {course.code}
                    </span>
                    {isTeacher && course.teacher === user._id && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Instructor
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{course.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <span>{course.students?.length || 0} Students</span>
                    <span className="mx-2">•</span>
                    <span>Instructor: {course.teacher.name || 'Unknown'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <Link
                      to={`/courses/${course._id}`}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      View Details
                    </Link>
                    
                    {isStudent && !isEnrolled && (
                      <button
                        onClick={() => handleEnrollCourse(course._id)}
                        className="px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                      >
                        Enroll
                      </button>
                    )}
                    
                    {isEnrolled && (
                      <span className="text-green-600 font-medium">
                        Enrolled
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">
              No courses found. {isTeacher && "Create your first course!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
