import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../../context/AuthContext';
import {
  DocumentIcon,
  LinkIcon,
  PhotographIcon,
  FilmIcon,
  DocumentTextIcon
} from '@heroicons/react/outline';

const CreateMaterial = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: courseId || '',
    type: 'document',
    link: '',
  });
  
  const [file, setFile] = useState(null);
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
          setCourses(response.data.courses || []);
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
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // Create form data for file upload
      const materialFormData = new FormData();
      materialFormData.append('title', formData.title);
      materialFormData.append('description', formData.description);
      materialFormData.append('courseId', formData.courseId);
      materialFormData.append('type', formData.type);
      
      // Handle different material types
      if (formData.type === 'link') {
        materialFormData.append('link', formData.link);
      } else if (file) {
        materialFormData.append('file', file);
      }
      
      const response = await axios.post('/api/materials', materialFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        toast.success('Material created successfully');
        navigate(`/courses/${formData.courseId}`);
      } else {
        toast.error('Failed to create material');
      }
    } catch (error) {
      console.error('Error creating material:', error);
      toast.error(error.response?.data?.message || 'Failed to create material');
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
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Add Course Material</h1>
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
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
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Brief description of the material"
            ></textarea>
          </div>
          
          {/* Material Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Material Type*
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'document' })}
                className={`p-3 flex flex-col items-center justify-center rounded-lg border ${
                  formData.type === 'document'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <DocumentIcon className="h-8 w-8" />
                <span className="mt-1 text-sm">Document</span>
              </button>
              
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'image' })}
                className={`p-3 flex flex-col items-center justify-center rounded-lg border ${
                  formData.type === 'image'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <PhotographIcon className="h-8 w-8" />
                <span className="mt-1 text-sm">Image</span>
              </button>
              
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'link' })}
                className={`p-3 flex flex-col items-center justify-center rounded-lg border ${
                  formData.type === 'link'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <LinkIcon className="h-8 w-8" />
                <span className="mt-1 text-sm">Link</span>
              </button>
              
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'other' })}
                className={`p-3 flex flex-col items-center justify-center rounded-lg border ${
                  formData.type === 'other'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <DocumentTextIcon className="h-8 w-8" />
                <span className="mt-1 text-sm">Other</span>
              </button>
            </div>
          </div>
          
          {/* Material Upload or Link */}
          {formData.type === 'link' ? (
            <div>
              <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-1">
                External Link*
              </label>
              <input
                type="url"
                id="link"
                name="link"
                value={formData.link}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="https://example.com/resource"
              />
            </div>
          ) : (
            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
                Upload File*
              </label>
              <input
                type="file"
                id="file"
                onChange={handleFileChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Max file size: 10MB. Accepted formats: PDF, Word, Excel, PowerPoint, images, zip.
              </p>
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
              {loading ? 'Uploading...' : 'Upload Material'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateMaterial;
