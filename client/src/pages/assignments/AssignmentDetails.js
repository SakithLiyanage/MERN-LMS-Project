import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import moment from 'moment';
import { toast } from 'react-toastify';
import AuthContext from '../../context/AuthContext';
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  DocumentDownloadIcon,
  DocumentTextIcon
} from '@heroicons/react/outline';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const AssignmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';
  
  // Check if student has already submitted
  const studentSubmission = assignment?.submissions?.find(
    sub => sub && sub.student && sub.student._id === user?._id
  );
  
  const isDeadlinePassed = assignment?.deadline && moment().isAfter(moment(assignment.deadline));
  
  const now = moment();
  const dueDate = assignment?.deadline ? moment(assignment.deadline) : null;
  const canUpdateSubmission =
    studentSubmission &&
    dueDate &&
    now.isBefore(dueDate) &&
    now.diff(moment(studentSubmission.submittedAt), 'hours') < 1;
  
  useEffect(() => {
    const fetchAssignmentDetails = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/assignments/${id}`);
        setAssignment(res.data.assignment || res.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching assignment details:', error);
        setError('Failed to load assignment details');
        setLoading(false);
      }
    };
    
    fetchAssignmentDetails();
  }, [id]);
  
  const handleFileChange = (e) => {
    setSubmissionFile(e.target.files[0]);
  };
  
  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!submissionFile) {
      toast.error('Please select a file to submit');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', submissionFile);
      const res = await axios.post(`${BACKEND_URL}/api/assignments/${id}/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Assignment submitted successfully!');
      setSubmissionFile(null);
      // Automatically redirect/refresh to show the updated submission
      window.location.reload();
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast.error(error.response?.data?.message || 'Error submitting assignment');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleGradeSubmission = async (submissionId, grade, feedback) => {
    try {
      console.log('Grading submission:', { submissionId, grade, feedback });
      await axios.put(`${BACKEND_URL}/api/submissions/${submissionId}/grade`, { grade, feedback });
      
      // Update the local state with the new grade
      setAssignment(prevState => ({
        ...prevState,
        submissions: prevState.submissions.map(sub => 
          sub._id === submissionId 
            ? { ...sub, grade, feedback, graded: true } 
            : sub
        ),
      }));
      
      toast.success('Submission graded successfully!');
    } catch (error) {
      console.error('Error grading submission:', error);
      toast.error('Error grading submission');
    }
  };
  
  const handleDownload = async (fileUrl, fileName) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/materials/download/${encodeURIComponent(fileUrl)}`,
        {
          responseType: 'blob',
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || fileUrl);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Download failed: ' + (error.response?.data?.message || error.message));
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
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Error</h2>
        <p className="text-gray-600">{error}</p>
        <Link to="/assignments" className="mt-4 inline-block text-primary-600 hover:underline">
          Back to Assignments
        </Link>
      </div>
    );
  }
  
  if (!assignment) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Assignment Not Found</h2>
        <p className="text-gray-600">The assignment you're looking for doesn't exist or you don't have access to it.</p>
        <Link to="/assignments" className="mt-4 inline-block text-primary-600 hover:underline">
          Back to Assignments
        </Link>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-primary-600"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back
        </button>
      </div>
      
      {/* Assignment Header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{assignment.title}</h1>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Course: {assignment.course?.title}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Points: {assignment.totalPoints}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  isDeadlinePassed ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  <ClockIcon className="h-3 w-3 mr-1" />
                  Due: {moment(assignment.deadline).format('MMM D, YYYY [at] h:mm A')}
                </span>
              </div>
              <div className="prose max-w-none text-gray-600">
                {assignment.description}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attachments Section */}
      {assignment.attachments && assignment.attachments.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Attachments</h2>
          <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md">
            {assignment.attachments.map((attachment, index) => (
              <li key={index} className="py-3 px-4 flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">{attachment.fileName}</span>
                </div>
                <button
                  onClick={() => handleDownload(attachment.fileUrl, attachment.originalName)}
                  className="inline-flex items-center px-3 py-1 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Download {attachment.originalName || attachment.fileUrl}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Student Submission Section */}
      {isStudent && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Submission</h2>
          
          {studentSubmission && studentSubmission.attachments && studentSubmission.attachments.length > 0 ? (
            <div className="mt-4">
              <p className="font-medium">Your Uploaded File:</p>
              <button
                onClick={() => handleDownload(studentSubmission.attachments[0].fileUrl, studentSubmission.attachments[0].fileName)}
                className="text-primary-600 hover:underline"
              >
                {studentSubmission.attachments[0].fileName || 'No file'}
              </button>
              <p className="text-xs text-gray-500 mt-1">
                Submitted: {moment(studentSubmission.submittedAt).format('MMM D, YYYY [at] h:mm A')}
              </p>
              {typeof studentSubmission.grade !== 'undefined' && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded shadow">
                  <div className="text-lg font-bold text-green-700">
                    Grade: {studentSubmission.grade} / {assignment.totalPoints}
                  </div>
                  {studentSubmission.feedback && (
                    <div className="mt-2 text-gray-700">
                      <span className="font-medium">Feedback:</span> {studentSubmission.feedback}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4 text-gray-400">No file to download</div>
          )}
          
          {canUpdateSubmission && (
            <form onSubmit={handleSubmitAssignment} className="mt-4">
              <label className="block mb-2 font-medium">Update your submission:</label>
              <input
                type="file"
                onChange={handleFileChange}
                className="mb-2"
                accept=".pdf,.doc,.docx,.txt"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                disabled={submitting}
              >
                {submitting ? 'Updating...' : 'Update Submission'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Teacher Submissions Overview */}
      {isTeacher && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Student Submissions</h2>
          
          {assignment.submissions && assignment.submissions.length > 0 ? (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Student Submissions</h2>
              <ul className="divide-y divide-gray-200">
                {assignment.submissions.map((sub, idx) => {
                  const fileUrl = sub.attachments && sub.attachments[0] ? sub.attachments[0].fileUrl : null;
                  const fileName = sub.attachments && sub.attachments[0] ? sub.attachments[0].fileName : null;
                  return (
                    <li key={sub._id || idx} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="font-medium">{sub.student?.name || 'Unknown Student'}</div>
                        <div className="text-xs text-gray-500">{sub.student?.email}</div>
                        <div className="mt-1">
                          {fileUrl ? (
                            <button
                              onClick={() => handleDownload(fileUrl, fileName)}
                              className="text-primary-600 hover:underline"
                            >
                              {fileName || 'No file'}
                            </button>
                          ) : (
                            <span className="text-gray-400">No file to download</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Submitted: {sub.submittedAt ? moment(sub.submittedAt).format('MMM D, YYYY [at] h:mm A') : ''}
                        </div>
                      </div>
                      <div className="mt-2 md:mt-0">
                        {!sub.graded ? (
                          <ModernGradeSubmissionForm
                            submissionId={sub._id}
                            totalPoints={assignment.totalPoints}
                            onGradeSubmit={handleGradeSubmission}
                            defaultGrade={sub.grade}
                            defaultFeedback={sub.feedback}
                          />
                        ) : (
                          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded shadow">
                            <div className="text-lg font-bold text-green-700">
                              Grade: {sub.grade} / {assignment.totalPoints}
                            </div>
                            {sub.feedback && (
                              <div className="mt-2 text-gray-700">
                                <span className="font-medium">Feedback:</span> {sub.feedback}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">No submissions yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Modern grading form for teachers
const ModernGradeSubmissionForm = ({ submissionId, totalPoints, onGradeSubmit, defaultGrade, defaultFeedback }) => {
  const [grade, setGrade] = useState(defaultGrade || '');
  const [feedback, setFeedback] = useState(defaultFeedback || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (grade === '' || isNaN(grade) || grade < 0 || grade > totalPoints) {
      alert(`Grade must be a number between 0 and ${totalPoints}`);
      return;
    }
    setSubmitting(true);
    await onGradeSubmit(submissionId, grade, feedback);
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 bg-gray-50 p-4 rounded shadow">
      <div className="flex items-center gap-2">
        <label className="font-medium">Grade:</label>
        <input
          type="number"
          min={0}
          max={totalPoints}
          value={grade}
          onChange={e => setGrade(e.target.value)}
          className="w-20 px-2 py-1 border rounded"
          required
        />
        <span className="text-gray-500">/ {totalPoints}</span>
      </div>
      <textarea
        value={feedback}
        onChange={e => setFeedback(e.target.value)}
        placeholder="Feedback (optional)"
        className="px-2 py-1 border rounded resize-none"
        rows={2}
      />
      <button
        type="submit"
        className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 font-semibold"
        disabled={submitting}
      >
        {submitting ? 'Grading...' : 'Submit Grade'}
      </button>
    </form>
  );
};

export default AssignmentDetails;
