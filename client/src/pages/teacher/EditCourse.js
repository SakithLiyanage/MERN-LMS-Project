import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../../context/AuthContext';
import {
  ArrowLeftIcon,
  BookOpenIcon
} from '@heroicons/react/outline';
import { motion } from 'framer-motion';

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
  });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  
  const { title, description, code } = formData;
  
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await axios.get(`/api/courses/${id}`);
        const course = res.data.course;
        
        // Check if user is the course teacher
        if (course.teacher._id !== user._id) {
          toast.error('You are not authorized to edit this course');
          return navigate('/courses');
        }
        
        setFormData({
          title: course.title,
          description: course.description,
          code: course.code,
        });
        
        if (course.coverImage) {
          setPreviewImage(`/uploads/${course.coverImage}`);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching course:', error);
        toast.error('Error loading course data');
        navigate('/courses');
      }
    };
    
    fetchCourse();
  }, [id, user._id, navigate]);
  
  const onChange = (e) => {
    if (e.target.name === 'coverImage') {
      const file = e.target.files[0];
      setCoverImage(file);
      
      // Create preview URL for the image
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };
  
  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Create form data for file upload
      const courseData = new FormData();
      courseData.append('title', title);
      courseData.append('description', description);
      courseData.append('code', code);
      
      if (coverImage) {
        courseData.append('coverImage', coverImage);
      }
      
      await axios.put(`/api/courses/${id}`, courseData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success('Course updated successfully!');
      navigate(`/courses/${id}`);
    } catch (error) {
      console.error('Error updating course:', error);
      toast.error(error.response?.data?.message || 'Error updating course');
    } finally {
      setSubmitting(false);
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
    <div className="max-w-2xl mx-auto py-8 px-2 sm:px-6 lg:px-8 bg-neutral-50 min-h-screen">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white/90 shadow-card rounded-2xl p-8 border border-primary-50">
        <h1 className="text-2xl font-extrabold font-heading text-primary-400 mb-6 drop-shadow-lg tracking-tight bg-gradient-to-r from-primary-400 to-secondary-500 bg-clip-text text-transparent">
          Edit Course
        </h1>
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-primary-600"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Course
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="bg-white shadow-md rounded-lg p-6">
          <div className="space-y-6">
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
            
            {/* Course Cover Image */}
            <div>
              <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-1">
                Cover Image
              </label>
              <input
                type="file"
                id="coverImage"
                name="coverImage"
                onChange={onChange}
                accept="image/*"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Upload a new image to replace the current one.
              </p>
            </div>
            
            {/* Image Preview */}
            {previewImage && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                <div className="relative w-full h-48 rounded-lg overflow-hidden">
                  <img
                    src={previewImage}
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
                disabled={submitting}
                className={`w-full py-2 px-4 border border-transparent rounded-md font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                  submitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {submitting ? 'Updating...' : 'Update Course'}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditCourse;
