import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import { motion } from 'framer-motion';

const CreateCourse = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    coverImageUrl: '',
  });
  
  const [loading, setLoading] = useState(false);
  
  const { title, description, code, coverImageUrl } = formData;
  
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You must be logged in to create a course');
        return;
      }
      
      const response = await axios.post('/api/courses', formData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        toast.success('Course created successfully');
        // Redirect after a short delay to allow the toast to be visible
        setTimeout(() => {
          navigate('/teacher/dashboard');
        }, 1000);
      }
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error(error.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto py-8 px-2 sm:px-6 lg:px-8 bg-neutral-50 min-h-screen">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white/90 shadow-card rounded-2xl p-8 border border-primary-50">
        <h1 className="text-2xl font-extrabold font-heading text-primary-400 mb-6 drop-shadow-lg tracking-tight bg-gradient-to-r from-primary-400 to-secondary-500 bg-clip-text text-transparent">
          Create Course
        </h1>
        
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Course Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Course Title*
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={title}
              onChange={onChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., Introduction to Web Development"
            />
          </div>
          
          {/* Course Code */}
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              Course Code*
            </label>
            <input
              type="text"
              id="code"
              name="code"
              value={code}
              onChange={onChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., WEB101"
            />
            <p className="mt-1 text-xs text-gray-500">
              A unique code for your course. Students will use this to find your course.
            </p>
          </div>
          
          {/* Course Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description*
            </label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={onChange}
              required
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Provide a detailed description of your course"
            ></textarea>
          </div>
          
          {/* Cover Image URL */}
          <div>
            <label htmlFor="coverImageUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Cover Image URL
            </label>
            <input
              type="text"
              id="coverImageUrl"
              name="coverImageUrl"
              value={coverImageUrl}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Paste an image URL (e.g., from Unsplash or Pexels)"
            />
            <p className="mt-1 text-xs text-gray-500">
              Paste a direct image URL from the internet. Recommended size: 1280x720 pixels (16:9 ratio)
            </p>
          </div>
          
          {/* Image Preview */}
          {coverImageUrl && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
              <div className="relative w-full h-48 rounded-lg overflow-hidden">
                <img
                  src={coverImageUrl}
                  alt="Course cover preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
          
          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 border border-transparent rounded-md font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateCourse;
