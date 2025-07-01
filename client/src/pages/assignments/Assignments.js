import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import moment from 'moment';
import AuthContext from '../../context/AuthContext';
import {
  ClipboardCheckIcon,  // Changed from ClipboardDocumentCheckIcon
  SearchIcon,  // Changed from MagnifyingGlassIcon
  TrashIcon
} from '@heroicons/react/outline';

const Assignments = () => {
  const { user } = useContext(AuthContext);
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'submitted', 'late', 'graded'
  
  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';
  
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const endpoint = isTeacher ? '/api/assignments/teacher' : '/api/assignments/student';
        const res = await axios.get(endpoint);
        
        const assignmentsWithCourseDetails = res.data.assignments;
        setAssignments(assignmentsWithCourseDetails);
        setFilteredAssignments(assignmentsWithCourseDetails);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching assignments:', error);
        setLoading(false);
      }
    };
    
    fetchAssignments();
  }, [isTeacher]);
  
  // Filter assignments based on search term and filter
  useEffect(() => {
    let filtered = assignments;
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(
        (assignment) =>
          assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assignment.course?.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter for students
    if (isStudent) {
      if (filter === 'pending') {
        filtered = filtered.filter(assignment => {
          const submitted = assignment.submissions?.some(
            sub => sub.student === user._id
          );
          const deadlinePassed = new Date(assignment.deadline) < new Date();
          return !submitted && !deadlinePassed;
        });
      } else if (filter === 'submitted') {
        filtered = filtered.filter(assignment => 
          assignment.submissions?.some(
            sub => sub.student === user._id && !sub.graded
          )
        );
      } else if (filter === 'graded') {
        filtered = filtered.filter(assignment => 
          assignment.submissions?.some(
            sub => sub.student === user._id && sub.graded
          )
        );
      } else if (filter === 'late') {
        filtered = filtered.filter(assignment => {
          const submitted = assignment.submissions?.some(
            sub => sub.student === user._id
          );
          const deadlinePassed = new Date(assignment.deadline) < new Date();
          return !submitted && deadlinePassed;
        });
      }
    }
    // For teachers, filter by status
    else if (isTeacher) {
      if (filter === 'pending') {
        filtered = filtered.filter(assignment => 
          assignment.submissions?.some(sub => !sub.graded)
        );
      } else if (filter === 'graded') {
        filtered = filtered.filter(assignment => 
          assignment.submissions?.every(sub => sub.graded)
        );
      } else if (filter === 'upcoming') {
        filtered = filtered.filter(assignment => 
          new Date(assignment.deadline) > new Date()
        );
      } else if (filter === 'expired') {
        filtered = filtered.filter(assignment => 
          new Date(assignment.deadline) < new Date()
        );
      }
    }
    
    setFilteredAssignments(filtered);
  }, [searchTerm, filter, assignments, isStudent, isTeacher, user._id]);
  
  const getAssignmentStatus = (assignment) => {
    if (isStudent) {
      const submitted = assignment.submissions?.some(
        sub => sub.student === user._id
      );
      
      if (submitted) {
        const submission = assignment.submissions.find(
          sub => sub.student === user._id
        );
        
        if (submission?.graded) {
          return {
            label: 'Graded',
            color: 'bg-green-100 text-green-800'
          };
        } else {
          return {
            label: 'Submitted',
            color: 'bg-blue-100 text-blue-800'
          };
        }
      } else if (new Date(assignment.deadline) < new Date()) {
        return {
          label: 'Late',
          color: 'bg-red-100 text-red-800'
        };
      } else {
        return {
          label: 'Pending',
          color: 'bg-yellow-100 text-yellow-800'
        };
      }
    } else {
      // For teachers
      if (!assignment.submissions || assignment.submissions.length === 0) {
        return {
          label: 'No Submissions',
          color: 'bg-gray-100 text-gray-800'
        };
      } else if ((assignment.submissions || []).every(sub => sub.graded)) {
        return {
          label: 'All Graded',
          color: 'bg-green-100 text-green-800'
        };
      } else {
        return {
          label: `${(assignment.submissions || []).filter(sub => sub.graded).length}/${(assignment.submissions || []).length} Graded`,
          color: 'bg-blue-100 text-blue-800'
        };
      }
    }
  };
  
  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) return;
    try {
      await axios.delete(`/api/assignments/${assignmentId}`);
      setAssignments(prev => prev.filter(a => a._id !== assignmentId));
    } catch (err) {
      alert('Failed to delete assignment.');
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Assignments</h1>
        <p className="text-gray-600">
          {isTeacher ? 'Manage and grade assignments' : 'View and submit your assignments'}
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Bar */}
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Search assignments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Filter Dropdown */}
        <div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          >
            <option value="all">All Assignments</option>
            {isStudent ? (
              <>
                <option value="pending">Pending</option>
                <option value="submitted">Submitted</option>
                <option value="graded">Graded</option>
                <option value="late">Late/Missed</option>
              </>
            ) : (
              <>
                <option value="pending">Needs Grading</option>
                <option value="graded">All Graded</option>
                <option value="upcoming">Upcoming</option>
                <option value="expired">Deadline Passed</option>
              </>
            )}
          </select>
        </div>
      </div>
      
      {/* Assignments List */}
      <div className="space-y-4">
        {(filteredAssignments || []).length > 0 ? (
          (filteredAssignments || []).map((assignment, index) => {
            const status = getAssignmentStatus(assignment);
            const isPastDeadline = new Date(assignment.deadline) < new Date();
            
            return (
              <motion.div
                key={assignment._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="sm:flex sm:justify-between sm:items-start">
                  <div>
                    <div className="flex items-center mb-2">
                      <h2 className="text-lg font-semibold text-gray-800 mr-3">
                        {assignment.title}
                      </h2>
                      <span className={`text-xs px-2 py-1 rounded-full ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">
                      Course: {assignment.course?.title || 'Unknown Course'}
                    </p>
                    
                    <div className="flex items-center text-xs text-gray-500 mb-4">
                      <ClipboardCheckIcon className="h-4 w-4 mr-1" />
                      <span className={isPastDeadline ? 'text-red-600 font-medium' : ''}>
                        Due: {moment(assignment.deadline).format('MMM D, YYYY [at] h:mm A')}
                      </span>
                      {isPastDeadline && (
                        <span className="ml-2 text-red-600 font-medium">
                          (Deadline passed)
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-3 sm:mt-0 sm:ml-4">
                    <Link
                      to={`/assignments/${assignment._id}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      {isTeacher ? 'View & Grade' : 'View & Submit'}
                    </Link>
                  </div>
                </div>
                {isTeacher && (
                  <button
                    onClick={() => handleDeleteAssignment(assignment._id)}
                    className="ml-2 p-2 rounded-full hover:bg-red-100 text-red-600"
                    title="Delete Assignment"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                )}
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-10 bg-white rounded-lg shadow-md">
            <p className="text-gray-500">No assignments found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Assignments;
