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
  const [refreshKey, setRefreshKey] = useState(0);
  
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
  }, [id, refreshKey]);
  
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
      // Refetch assignment details to update UI
      setRefreshKey(prev => prev + 1);
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
    <div className="space-y-6 bg-neutral-50 min-h-screen py-8 px-2 sm:px-6 lg:px-8">
      {/* Back Button */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-text-medium hover:text-primary-500 font-semibold mb-2"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back
        </button>
      </motion.div>
      
      {/* Assignment Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white/90 rounded-2xl shadow-card border border-primary-50 overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start">
            <div>
              <h1 className="text-2xl font-extrabold font-heading text-primary-400 mb-2 drop-shadow-lg tracking-tight bg-gradient-to-r from-primary-400 to-secondary-500 bg-clip-text text-transparent">
                {assignment.title}
              </h1>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-100 text-primary-700 border border-primary-400 shadow">
                  Course: {assignment.course?.title}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-accent-yellow text-text-dark border border-accent-yellow shadow">
                  Points: {assignment.totalPoints}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${isDeadlinePassed ? 'bg-action-red text-white' : 'bg-accent-green text-white'} border shadow`}>
                  <ClockIcon className="h-3 w-3 mr-1" />
                  Due: {moment(assignment.deadline).format('MMM D, YYYY [at] h:mm A')}
                </span>
              </div>
              <div className="prose max-w-none text-text-dark">
                {assignment.description}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Attachments Section */}
      {assignment.attachments && assignment.attachments.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="mb-8 bg-white/90 rounded-xl border border-primary-50 shadow-card">
          <h2 className="text-lg font-bold text-text-dark mb-2 px-6 pt-6">Attachments</h2>
          <ul className="divide-y divide-neutral-50 border-t border-neutral-50 rounded-md">
            {assignment.attachments.map((attachment, index) => (
              <li key={index} className="py-3 px-6 flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <DocumentTextIcon className="h-5 w-5 text-primary-400 mr-3" />
                  <span className="text-text-dark">{attachment.fileName}</span>
                </div>
                <button
                  onClick={() => handleDownload(attachment.fileUrl, attachment.originalName)}
                  className="inline-flex items-center px-3 py-1 bg-primary-400 text-white rounded-lg hover:bg-primary-500 transition-colors font-semibold shadow"
                >
                  Download {attachment.originalName || attachment.fileUrl}
                </button>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Student Submission Section */}
      {isStudent && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-white/90 rounded-2xl shadow-card border border-primary-50 p-6">
          <h2 className="text-lg font-bold text-text-dark mb-4">Your Submission</h2>
          
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
        </motion.div>
      )}

      {/* Teacher Submissions Overview */}
      {isTeacher && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-white/90 rounded-2xl shadow-card border border-primary-50 p-6">
          <h2 className="text-lg font-bold text-text-dark mb-4">Student Submissions</h2>
          
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
        </motion.div>
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
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-3 bg-white/80 border border-primary-100 rounded-xl shadow-card p-4 backdrop-blur-md"
    >
      <div className="flex items-center gap-2">
        <label className="font-semibold text-primary-600">Grade:</label>
        <input
          type="number"
          min={0}
          max={totalPoints}
          value={grade}
          onChange={e => setGrade(e.target.value)}
          className="w-20 px-2 py-1 border-2 border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all bg-white/70 text-text-dark font-bold shadow-sm"
          required
        />
        <span className="text-gray-500">/ {totalPoints}</span>
      </div>
      <textarea
        value={feedback}
        onChange={e => setFeedback(e.target.value)}
        placeholder="Feedback (optional)"
        className="px-3 py-2 border-2 border-primary-100 rounded-lg resize-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all bg-white/70 text-text-dark shadow-sm"
        rows={2}
      />
      <button
        type="submit"
        className="bg-gradient-to-r from-primary-400 to-secondary-500 text-white px-4 py-2 rounded-lg font-bold shadow hover:scale-105 hover:from-primary-500 hover:to-secondary-600 transition-all duration-200"
        disabled={submitting}
      >
        {submitting ? 'Grading...' : 'Submit Grade'}
      </button>
    </motion.form>
  );
};

export default AssignmentDetails;
