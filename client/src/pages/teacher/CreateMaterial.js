import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../../context/AuthContext';
import { ArrowLeftIcon, LinkIcon, DocumentIcon, PhotographIcon, FilmIcon } from '@heroicons/react/outline';

const CreateMaterial = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'document', // Default type
    isPublished: true,
    order: 0,
  });
  
  const [materialFile, setMaterialFile] = useState(null);
  const [linkUrl, setLinkUrl] = useState('');
  
  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const res = await axios.get(`/api/courses/${courseId}`);
        setCourse(res.data.course);
        
        // Verify if current user is the teacher of this course
        if (res.data.course.teacher._id !== user._id) {
          toast.error('You are not authorized to add materials to this course');
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
    setMaterialFile(e.target.files[0]);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Validate based on type
      if (formData.type === 'link' && !linkUrl) {
        toast.error('Please enter a valid URL for link type material');
        setSubmitting(false);
        return;
      }
      
      if (['document', 'pdf', 'image', 'video'].includes(formData.type) && !materialFile) {
        toast.error('Please upload a file for this material type');
        setSubmitting(false);
        return;
      }
      
      // Create form data for sending to API
      const materialFormData = new FormData();
      materialFormData.append('title', formData.title);
      materialFormData.append('description', formData.description);
      materialFormData.append('type', formData.type);
      materialFormData.append('isPublished', formData.isPublished);
      materialFormData.append('order', formData.order);
      materialFormData.append('course', courseId);
      
      if (formData.type === 'link') {
        materialFormData.append('link', linkUrl);
      } else if (materialFile) {
        materialFormData.append('file', materialFile);
      }
      
      const res = await axios.post('/api/materials', materialFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success('Material added successfully!');
      navigate(`/courses/${courseId}`);
    } catch (error) {
      console.error('Error adding material:', error);
      toast.error(error.response?.data?.message || 'Error adding material');
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
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Add Study Material</h1>
        
        <div className="mb-6 p-4 bg-blue-50 rounded-md">
          <p className="text-blue-700">
            Adding material for: <span className="font-semibold">{course.title}</span>
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Material Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title*
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Week 1 Lecture Notes"
              />
            </div>
            
            {/* Material Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Brief description of this material (optional)"
              ></textarea>
            </div>
            
            {/* Material Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Material Type*
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="document">Document</option>
                <option value="pdf">PDF</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="link">External Link</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            {/* Conditional inputs based on type */}
            {formData.type === 'link' ? (
              <div>
                <label htmlFor="linkUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  External URL*
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                    <LinkIcon className="h-4 w-4" />
                  </span>
                  <input
                    type="url"
                    id="linkUrl"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="https://example.com/resource"
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Enter the full URL including http:// or https://
                </p>
              </div>
            ) : (
              <div>
                <label htmlFor="materialFile" className="block text-sm font-medium text-gray-700 mb-1">
                  Upload File*
                </label>
                <div className="mt-1 flex items-center">
                  <span className="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                    <DocumentIcon className="h-4 w-4" />
                  </span>
                  <input
                    type="file"
                    id="materialFile"
                    onChange={handleFileChange}
                    className="flex-1 block w-full px-3 py-1.5 border border-gray-300 rounded-r-md text-sm text-gray-500 file:mr-4 file:py-1 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Upload a file appropriate for the selected material type.
                </p>
              </div>
            )}
            
            {/* Publishing Options */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublished"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-700">
                Publish this material immediately
              </label>
            </div>
            
            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-2 px-4 border border-transparent rounded-md font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                  submitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {submitting ? 'Adding Material...' : 'Add Material'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMaterial;
