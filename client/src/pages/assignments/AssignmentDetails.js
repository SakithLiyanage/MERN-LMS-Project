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
    sub => sub.student?._id === user?._id
  );
  
  const isDeadlinePassed = assignment?.deadline && moment().isAfter(moment(assignment.deadline));
  
  useEffect(() => {
    const fetchAssignmentDetails = async () => {
      try {
        const res = await axios.get(`/api/assignments/${id}`);
        setAssignment(res.data.assignment);
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
      
      const res = await axios.post(`/api/assignments/${id}/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Update the local state with the new submission
      setAssignment(prevState => ({
        ...prevState,
        submissions: [...prevState.submissions, res.data.submission],
      }));
      
      toast.success('Assignment submitted successfully!');
      setSubmissionFile(null);
      
      // Refresh the assignment data
      const refreshRes = await axios.get(`/api/assignments/${id}`);
      setAssignment(refreshRes.data.assignment);
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast.error(error.response?.data?.message || 'Error submitting assignment');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleGradeSubmission = async (submissionId, grade, feedback) => {
    try {
      await axios.put(`/api/submissions/${submissionId}/grade`, { grade, feedback });
      
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
                <a
                  href={`/uploads/${attachment.fileUrl}`}
                  download={attachment.fileName}
                  className="inline-flex items-center px-3 py-1 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  <DocumentDownloadIcon className="h-4 w-4 mr-1" />
                  Download
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Student Submission Section */}
      {isStudent && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Submission</h2>
          
          {studentSubmission ? (
            <div className="space-y-4">
              <div className="flex items-start">
                <DocumentTextIcon className="h-5 w-5 text-gray-500 mr-2" />
                <div>
                  <a
                    href={`/uploads/${studentSubmission.file}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary-600 hover:underline"
                  >
                    {studentSubmission.file.split('/').pop()}
                  </a>
                  <p className="text-xs text-gray-500 mt-1">
                    Submitted: {moment(studentSubmission.submittedAt).format('MMM D, YYYY [at] h:mm A')}
                  </p>
                </div>
              </div>
              
              {studentSubmission.graded && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 mr-2">Grade:</span>
                    <span className="text-lg font-bold">
                      {studentSubmission.grade} / {assignment.totalPoints}
                    </span>
                  </div>
                  {studentSubmission.feedback && (
                    <div className="mt-2">
                      <span className="font-medium text-gray-700">Feedback:</span>
                      <p className="mt-1 text-gray-600">{studentSubmission.feedback}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : isDeadlinePassed ? (
            <div className="bg-red-50 p-4 rounded-md">
              <p className="text-red-700">
                The deadline for this assignment has passed. You can no longer submit.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitAssignment}>
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
          )}
        </div>
      )}

      {/* Teacher Submissions Overview */}
      {isTeacher && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Student Submissions</h2>
          
          {assignment.submissions && assignment.submissions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submission
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Submitted
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grade
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assignment.submissions.map((submission) => (
                    <tr key={submission._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {submission.student?.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {submission.student?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a
                          href={`/uploads/${submission.file}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary-600 hover:underline text-sm"
                        >
                          View Submission
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {moment(submission.submittedAt).format('MMM D, YYYY [at] h:mm A')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {submission.graded ? (
                          <div className="text-sm text-gray-900">
                            {submission.grade} / {assignment.totalPoints}
                            <p className="text-xs text-gray-500">
                              {submission.feedback ? `"${submission.feedback}"` : 'No feedback provided'}
                            </p>
                          </div>
                        ) : (
                          <GradeSubmissionForm
                            submissionId={submission._id}
                            totalPoints={assignment.totalPoints}
                            onGradeSubmit={handleGradeSubmission}
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

// Grade Submission Form Component
const GradeSubmissionForm = ({ submissionId, totalPoints, onGradeSubmit }) => {
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const numericGrade = Number(grade);
    
    if (isNaN(numericGrade) || numericGrade < 0 || numericGrade > totalPoints) {
      toast.error(`Please enter a valid grade between 0 and ${totalPoints}`);
      return;
    }
    
    onGradeSubmit(submissionId, numericGrade, feedback);
    setIsOpen(false);
  };

  return (
    <div>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="px-3 py-1 text-xs rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          Grade
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="grade" className="block text-xs font-medium text-gray-700">
              Grade (0-{totalPoints})
            </label>
            <input
              type="number"
              id="grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              min="0"
              max={totalPoints}
              required
              className="mt-1 block w-full text-xs border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label htmlFor="feedback" className="block text-xs font-medium text-gray-700">
              Feedback (optional)
            </label>
            <textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows="2"
              className="mt-1 block w-full text-xs border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            ></textarea>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-2 py-1 text-xs border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-2 py-1 text-xs rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
            >
              Submit
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AssignmentDetails;
