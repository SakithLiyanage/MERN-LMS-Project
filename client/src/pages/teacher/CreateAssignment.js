import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from 'react-toastify';
import AuthContext from '../../context/AuthContext';
import { ArrowLeftIcon } from '@heroicons/react/outline';
import {
  ClipboardCheckIcon
} from '@heroicons/react/outline';  // Changed from '@heroicons/react/24/outline'

const CreateAssignment = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    totalPoints: 100,
    deadline: new Date(new Date().setDate(new Date().getDate() + 7)), // Default to 1 week from today
    attachments: [],
  });
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState([]);
  
  const { title, description, totalPoints, deadline } = formData;
  
  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const res = await axios.get(`/api/courses/${courseId}`);
        setCourse(res.data.course);
        
        // Verify if current user is the teacher of this course
        if (res.data.course.teacher._id !== user._id) {
          toast.error('You are not authorized to create assignments for this course');
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
  
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleDateChange = (date) => {
    setFormData({ ...formData, deadline: date });
  };
  
  const handleFileChange = (e) => {
    setFiles([...files, ...e.target.files]);
  };
  
  const removeFile = (indexToRemove) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };
  
  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Format the data for sending to API
      const assignmentFormData = new FormData();
      assignmentFormData.append('title', title);
      assignmentFormData.append('description', description);
      assignmentFormData.append('totalPoints', totalPoints);
      assignmentFormData.append('deadline', deadline.toISOString());
      assignmentFormData.append('course', courseId);
      
      // Append files
      files.forEach(file => {
        assignmentFormData.append('attachments', file);
      });
      
      const res = await axios.post('/api/assignments', assignmentFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success('Assignment created successfully!');
      navigate(`/assignments/${res.data.assignment._id}`);
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error(error.response?.data?.message || 'Error creating assignment');
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
    <div className="max-w-3xl mx-auto">
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
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Assignment</h1>
        
        <div className="mb-6 p-4 bg-blue-50 rounded-md">
          <p className="text-blue-700">
            Creating assignment for: <span className="font-semibold">{course.title}</span>
          </p>
        </div>
        
        <form onSubmit={onSubmit}>
          <div className="space-y-6">
            {/* Assignment Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Assignment Title*
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={title}
                onChange={onChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Final Project Submission"
              />
            </div>
            
            {/* Assignment Description */}
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
                rows="6"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Provide detailed instructions and requirements for the assignment"
              ></textarea>
            </div>
            
            {/* Points and Deadline - 2 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Total Points */}
              <div>
                <label htmlFor="totalPoints" className="block text-sm font-medium text-gray-700 mb-1">
                  Total Points*
                </label>
                <input
                  type="number"
                  id="totalPoints"
                  name="totalPoints"
                  value={totalPoints}
                  onChange={onChange}
                  required
                  min="0"
                  max="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              {/* Deadline */}
              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline*
                </label>
                <DatePicker
                  selected={deadline}
                  onChange={handleDateChange}
                  showTimeSelect
                  minDate={new Date()}
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
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
              <p className="mt-1 text-xs text-gray-500">
                Upload any files needed for the assignment. Students will be able to download these.
              </p>
              
              {/* File list */}
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-gray-700">Selected files:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {files.map((file, index) => (
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
                {submitting ? 'Creating...' : 'Create Assignment'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAssignment;
