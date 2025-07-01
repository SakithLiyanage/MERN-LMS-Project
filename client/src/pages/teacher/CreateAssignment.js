import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../../context/AuthContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { motion } from 'framer-motion';

const CreateAssignment = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: courseId || '',
    dueDate: null,
    totalPoints: 100,
    attachments: []
  });
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(true);
  
  useEffect(() => {
    const fetchTeacherCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const response = await axios.get('/api/courses/teacher', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setCourses(response.data.courses);
        } else {
          toast.error('Failed to load courses');
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast.error('Error loading courses');
      } finally {
        setLoadingCourses(false);
      }
    };
    
    fetchTeacherCourses();
  }, []);
  
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleDueDateChange = (date) => {
    setFormData({
      ...formData,
      dueDate: date
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('Submitting assignment:', formData);
      const token = localStorage.getItem('token');
      
      const response = await axios.post('/api/assignments', formData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        toast.success('Assignment created successfully');
        navigate(`/courses/${formData.courseId}`);
      } else {
        toast.error('Failed to create assignment');
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error(error.response?.data?.message || 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };
  
  if (loadingCourses) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto py-8 px-2 sm:px-6 lg:px-8 bg-neutral-50 min-h-screen">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white/90 shadow-card rounded-2xl p-8 border border-primary-50">
        <h1 className="text-2xl font-extrabold font-heading text-primary-400 mb-6 drop-shadow-lg tracking-tight bg-gradient-to-r from-primary-400 to-secondary-500 bg-clip-text text-transparent">
          Create Assignment
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Assignment Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Assignment Title*
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., Midterm Project"
            />
          </div>
          
          {/* Course Selection */}
          <div>
            <label htmlFor="courseId" className="block text-sm font-medium text-gray-700 mb-1">
              Course*
            </label>
            <select
              id="courseId"
              name="courseId"
              value={formData.courseId}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              disabled={courseId !== undefined}
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
          
          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="6"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Provide detailed instructions for the assignment"
            ></textarea>
          </div>
          
          {/* Due Date */}
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <DatePicker
              id="dueDate"
              selected={formData.dueDate}
              onChange={handleDueDateChange}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              timeCaption="time"
              dateFormat="MMMM d, yyyy h:mm aa"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholderText="Select due date and time"
            />
            <p className="mt-1 text-xs text-gray-500">
              Leave blank for no deadline
            </p>
          </div>
          
          {/* Total Points */}
          <div>
            <label htmlFor="totalPoints" className="block text-sm font-medium text-gray-700 mb-1">
              Total Points
            </label>
            <input
              type="number"
              id="totalPoints"
              name="totalPoints"
              value={formData.totalPoints}
              onChange={handleInputChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 border border-transparent rounded-md font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Creating...' : 'Create Assignment'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateAssignment;
