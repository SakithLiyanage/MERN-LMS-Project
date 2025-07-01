import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import moment from 'moment';
import { toast } from 'react-toastify';
import AuthContext from '../../context/AuthContext';
import { 
  ArrowLeftIcon, 
  CalendarIcon,
  ClockIcon,
  UploadIcon,
  ExclamationCircleIcon, // Added missing import
  DocumentIcon // Added missing import
} from '@heroicons/react/outline';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const handleDownload = async (fileName, originalName) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(
      `${BACKEND_URL}/api/materials/download/${encodeURIComponent(fileName)}`,
      {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', originalName || fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    alert('Download failed: ' + (error.response?.data?.message || error.message));
  }
};

const SubmitAssignment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [assignment, setAssignment] = useState(null);
  const [submissionFile, setSubmissionFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchAssignmentDetails = async () => {
      try {
        const res = await axios.get(`/api/assignments/${id}`);
        setAssignment(res.data.assignment);
        
        // Check if the assignment belongs to a course the student is enrolled in
        const course = res.data.assignment.course;
        
        // Check if already submitted
        const alreadySubmitted = res.data.assignment.submissions?.some(
          submission => submission.student._id === user._id
        );
        
        if (alreadySubmitted) {
          setError('You have already submitted this assignment');
        }
        
        // Check if deadline passed
        const deadlinePassed = moment(res.data.assignment.deadline).isBefore(moment());
        if (deadlinePassed) {
          setError('The deadline for this assignment has passed');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching assignment:', error);
        setError('Error loading assignment details');
        setLoading(false);
      }
    };
    
    fetchAssignmentDetails();
  }, [id, user._id]);
  
  const handleFileChange = (e) => {
    setSubmissionFile(e.target.files[0]);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!submissionFile) {
      toast.error('Please select a file to submit');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('file', submissionFile);
      
      await axios.post(`/api/assignments/${id}/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success('Assignment submitted successfully!');
      navigate(`/assignments/${id}`);
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast.error(error.response?.data?.message || 'Error submitting assignment');
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
  
  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-primary-600"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center text-red-600 mb-4">
            <ExclamationCircleIcon className="h-6 w-6 mr-2" />
            <h1 className="text-xl font-bold">Cannot Submit Assignment</h1>
          </div>
          
          <p className="text-gray-700 mb-6">{error}</p>
          
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <h2 className="font-medium text-gray-800 mb-2">{assignment?.title}</h2>
            <p className="text-sm text-gray-600 mb-2">Course: {assignment?.course.title}</p>
            <div className="flex items-center text-sm">
              <ClockIcon className="h-4 w-4 mr-1 text-red-500" />
              <span className="text-red-500">
                Due: {moment(assignment?.deadline).format('MMM D, YYYY [at] h:mm A')}
              </span>
            </div>
          </div>
          
          <Link
            to={`/assignments/${id}`}
            className="inline-block px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            View Assignment Details
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto py-8 px-2 sm:px-6 lg:px-8 bg-neutral-50 min-h-screen">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white/90 shadow-card rounded-2xl p-8 border border-primary-50">
        <h1 className="text-2xl font-extrabold font-heading text-primary-400 mb-6 drop-shadow-lg tracking-tight bg-gradient-to-r from-primary-400 to-secondary-500 bg-clip-text text-transparent">
          Submit Assignment
        </h1>
        
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h2 className="font-medium text-gray-800 mb-2">{assignment.title}</h2>
          <p className="text-sm text-gray-600 mb-4">Course: {assignment.course.title}</p>
          <p className="text-sm text-gray-600 mb-2">
            Total Points: <span className="font-medium">{assignment.totalPoints}</span>
          </p>
          <div className="flex items-center text-sm">
            <ClockIcon className="h-4 w-4 mr-1" />
            <span>
              Due: {moment(assignment.deadline).format('MMM D, YYYY [at] h:mm A')}
              {moment().isAfter(moment(assignment.deadline)) && (
                <span className="text-red-500 ml-2">(Deadline passed)</span>
              )}
            </span>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="font-medium text-gray-800 mb-2">Assignment Instructions</h3>
          <p className="text-gray-700">{assignment.description}</p>
        </div>
        
        {assignment.attachments && assignment.attachments.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-800 mb-2">Assignment Files</h3>
            <div className="space-y-2">
              {assignment.attachments.map((attachment, index) => (
                <div key={index} className="flex items-center">
                  <DocumentIcon className="h-5 w-5 text-gray-500 mr-2" />
                  <button
                    onClick={() => handleDownload(attachment, attachment)}
                    className="text-primary-600 hover:underline"
                  >
                    Download {attachment}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="border-t border-gray-200 pt-6">
          <h3 className="font-medium text-gray-800 mb-4">Your Submission</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload your work
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Upload a file (PDF, Word, etc.) for your assignment submission.
                </p>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={submitting || !submissionFile}
                  className={`w-full py-2 px-4 border border-transparent rounded-md font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                    (submitting || !submissionFile) ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {submitting ? 'Submitting...' : 'Submit Assignment'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default SubmitAssignment;
