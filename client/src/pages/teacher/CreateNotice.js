import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../../context/AuthContext';
import {
  ArrowLeftIcon,
  BellIcon
} from '@heroicons/react/outline';

const CreateNotice = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'medium',
    pinned: false,
  });
  
  const [attachments, setAttachments] = useState([]);
  
  const { title, content, priority, pinned } = formData;
  
  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const res = await axios.get(`/api/courses/${courseId}`);
        setCourse(res.data.course);
        
        // Verify if current user is the teacher of this course
        if (res.data.course.teacher._id !== user._id) {
          toast.error('You are not authorized to create notices for this course');
          navigate('/teacher/dashboard');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching course details:', error);
        toast.error('Error loading course details');
        navigate('/teacher/dashboard');
      }
    };
    
    fetchCourseDetails();
  }, [courseId, user._id, navigate]);
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
  
  const handleFileChange = (e) => {
    setAttachments([...attachments, ...e.target.files]);
  };
  
  const removeFile = (indexToRemove) => {
    setAttachments(attachments.filter((_, index) => index !== indexToRemove));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Create form data for sending to API
      const noticeFormData = new FormData();
      noticeFormData.append('title', title);
      noticeFormData.append('content', content);
      noticeFormData.append('priority', priority);
      noticeFormData.append('pinned', pinned);
      noticeFormData.append('course', courseId);
      
      // Append files
      attachments.forEach(file => {
        noticeFormData.append('attachments', file);
      });
      
      await axios.post('/api/notices', noticeFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success('Notice created successfully!');
      navigate(`/courses/${courseId}`);
    } catch (error) {
      console.error('Error creating notice:', error);
      toast.error(error.response?.data?.message || 'Error creating notice');
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
    <div className="max-w-2xl mx-auto">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-primary-600"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Course
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Notice</h1>
        
        <div className="mb-6 p-4 bg-blue-50 rounded-md">
          <p className="text-blue-700">
            Creating notice for: <span className="font-semibold">{course.title}</span>
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Notice Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Notice Title*
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Important: Class Canceled Tomorrow"
              />
            </div>
            
            {/* Notice Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Content*
              </label>
              <textarea
                id="content"
                name="content"
                value={content}
                onChange={handleInputChange}
                required
                rows="6"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter the notice details here..."
              ></textarea>
            </div>
            
            {/* Priority and Pin options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Priority */}
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                  Priority Level
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              {/* Pin Notice */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="pinned"
                  name="pinned"
                  checked={pinned}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="pinned" className="ml-2 block text-sm text-gray-700">
                  Pin this notice to the top
                </label>
              </div>
            </div>
            
            {/* File Attachments */}
            <div>
              <label htmlFor="attachments" className="block text-sm font-medium text-gray-700 mb-1">
                Attachments (Optional)
              </label>
              <input
                type="file"
                id="attachments"
                onChange={handleFileChange}
                multiple
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
              
              {/* File list */}
              {attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-gray-700">Selected files:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {attachments.map((file, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center justify-between">
                        <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-3 px-4 border border-transparent rounded-md font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                  submitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {submitting ? 'Posting Notice...' : 'Post Notice'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNotice;
