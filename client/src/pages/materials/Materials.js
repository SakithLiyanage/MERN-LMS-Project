import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import moment from 'moment';
import AuthContext from '../../context/AuthContext';
import { 
  DocumentTextIcon,
  PhotographIcon, // Changed from PhotoIcon
  FilmIcon,
  LinkIcon,
  DocumentIcon,
  SearchIcon // Changed from MagnifyingGlassIcon
} from '@heroicons/react/outline';

const Materials = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  const isTeacher = user?.role === 'teacher';
  
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get('/api/courses');
        setCourses(res.data.courses);
        
        // If there are courses, select the first one by default
        if (res.data.courses.length > 0) {
          setSelectedCourse(res.data.courses[0]._id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, []);
  
  // Fetch materials whenever the selected course changes
  useEffect(() => {
    const fetchMaterials = async () => {
      if (!selectedCourse) return;
      
      setLoading(true);
      try {
        const res = await axios.get(`/api/materials/course/${selectedCourse}`);
        setMaterials(res.data.materials);
        setFilteredMaterials(res.data.materials);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching materials:', error);
        setLoading(false);
      }
    };
    
    fetchMaterials();
  }, [selectedCourse]);
  
  // Filter materials based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredMaterials(materials);
      return;
    }
    
    const filtered = materials.filter(material => 
      material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredMaterials(filtered);
  }, [searchTerm, materials]);
  
  const getMaterialIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <DocumentTextIcon className="h-6 w-6 text-red-500" />;
      case 'image':
        return <PhotographIcon className="h-6 w-6 text-green-500" />;
      case 'video':
        return <FilmIcon className="h-6 w-6 text-blue-500" />;
      case 'link':
        return <LinkIcon className="h-6 w-6 text-purple-500" />;
      default:
        return <DocumentIcon className="h-6 w-6 text-gray-500" />;
    }
  };
  
  if (loading && courses.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">No Courses Found</h2>
        <p className="text-gray-600">You are not enrolled in any courses yet.</p>
        <Link to="/courses" className="mt-4 inline-block text-primary-600 hover:underline">
          Browse Courses
        </Link>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Study Materials</h1>
        <p className="text-gray-600">
          Access course materials and resources
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        {/* Course Selector */}
        <div className="md:w-1/3">
          <label htmlFor="courseSelect" className="block text-sm font-medium text-gray-700 mb-1">
            Select Course
          </label>
          <select
            id="courseSelect"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          >
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
        
        {/* Search Bar */}
        <div className="md:w-2/3 relative">
          <label htmlFor="searchMaterials" className="block text-sm font-medium text-gray-700 mb-1">
            Search Materials
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="searchMaterials"
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Search by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* Materials List */}
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : filteredMaterials.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {filteredMaterials.map((material, index) => (
              <motion.li 
                key={material._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="p-4 hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg">
                    {getMaterialIcon(material.type)}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-800">{material.title}</h3>
                      <p className="text-sm text-gray-500">
                        {moment(material.createdAt).format('MMM D, YYYY')}
                      </p>
                    </div>
                    {material.description && (
                      <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                    )}
                    <div className="mt-2 flex items-center">
                      {material.type === 'link' ? (
                        <a
                          href={material.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                        >
                          <LinkIcon className="h-4 w-4 mr-1" /> Open Link
                        </a>
                      ) : (
                        material.file && (
                          <a
                            href={`/uploads/${material.file}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                          >
                            <DocumentIcon className="h-4 w-4 mr-1" /> Download File
                          </a>
                        )
                      )}
                      {isTeacher && (
                        <button 
                          className="ml-6 text-red-600 hover:text-red-800 text-sm font-medium"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this material?')) {
                              // Delete material API call would go here
                            }
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-10 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">No materials found for this course.</p>
          {isTeacher && (
            <Link
              to={`/teacher/materials/create/${selectedCourse}`}
              className="mt-4 inline-block px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Add Material
            </Link>
          )}
        </div>
      )}
      
      {/* Add Material Button for Teachers */}
      {isTeacher && filteredMaterials.length > 0 && (
        <div className="flex justify-end">
          <Link
            to={`/teacher/materials/create/${selectedCourse}`}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Add Material
          </Link>
        </div>
      )}
    </div>
  );
};

export default Materials;
