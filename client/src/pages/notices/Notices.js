import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import moment from 'moment';
import AuthContext from '../../context/AuthContext';
import { 
  BellIcon, 
  ExclamationIcon, // Changed from ExclamationTriangleIcon
  DocumentTextIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/outline';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const Notices = () => {
  const { user } = useContext(AuthContext);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'course', 'general'
  
  const isTeacher = user?.role === 'teacher';
  
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        // Fetch all notices the user has access to
        const res = await axios.get('/api/notices');
        
        // Sort notices: pinned first, then by date
        const sortedNotices = res.data.notices.sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        setNotices(sortedNotices);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching notices:', error);
        setLoading(false);
      }
    };
    
    fetchNotices();
  }, []);
  
  // Filter notices based on active tab
  const filteredNotices = notices.filter(notice => {
    if (activeTab === 'all') return true;
    // Robustly check for course-linked notices
    if (activeTab === 'course') return notice.course || notice.courseId;
    if (activeTab === 'general') return !notice.course && !notice.courseId;
    return true;
  });
  
  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'high':
        return {
          icon: <ExclamationIcon className="h-5 w-5 text-red-500" />,
          badge: 'bg-red-100 text-red-800'
        };
      case 'medium':
        return {
          icon: <BellIcon className="h-5 w-5 text-yellow-500" />,
          badge: 'bg-yellow-100 text-yellow-800'
        };
      case 'low':
      default:
        return {
          icon: <BellIcon className="h-5 w-5 text-blue-500" />,
          badge: 'bg-blue-100 text-blue-800'
        };
    }
  };
  
  const handleDeleteNotice = async (noticeId) => {
    if (!window.confirm('Are you sure you want to delete this notice? This action cannot be undone.')) return;
    try {
      await axios.delete(`/api/notices/${noticeId}`);
      setNotices(prev => prev.filter(n => n._id !== noticeId));
    } catch (err) {
      alert('Failed to delete notice.');
    }
  };
  
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
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto py-8 px-2 sm:px-6 lg:px-8 bg-neutral-50 min-h-screen">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
        <h1 className="text-2xl font-extrabold font-heading text-primary-400 mb-1 drop-shadow-lg tracking-tight bg-gradient-to-r from-primary-400 to-secondary-500 bg-clip-text text-transparent">
          Notices & Announcements
        </h1>
        <p className="text-text-medium">Stay updated with important information</p>
      </motion.div>
      
      {/* Tab Navigation */}
      <div className="border-b border-neutral-50 mb-6">
        <nav className="flex -mb-px space-x-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Notices
          </button>
          <button
            onClick={() => setActiveTab('course')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'course'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Course Notices
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'general'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            General Announcements
          </button>
        </nav>
      </div>
      
      {/* Notices List */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
        {filteredNotices.length > 0 ? (
          <div className="space-y-4">
            {filteredNotices.map((notice, index) => {
              const priorityStyle = getPriorityStyles(notice.priority);
              return (
                <motion.div
                  key={notice._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`p-5 bg-white/90 rounded-xl shadow-card border border-primary-50 ${notice.pinned ? 'border-l-4 border-primary-400' : ''}`}
                >
                  <div className="sm:flex sm:justify-between sm:items-start">
                    <div className="flex">
                      <div className="flex-shrink-0">{priorityStyle.icon}</div>
                      <div className="ml-3">
                        <div className="flex items-center">
                          <h3 className="text-lg font-bold text-text-dark">{notice.title}</h3>
                          {notice.pinned && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-primary-100 text-primary-800 rounded-full border border-primary-400">Pinned</span>
                          )}
                          {(notice.course?.title || notice.courseId) && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-secondary-50 text-secondary-500 rounded-full border border-secondary-400">
                              {notice.course?.title || notice.courseId?.toString().slice(-6)}
                            </span>
                          )}
                        </div>
                        <span className={`ml-2 px-2 py-0.5 text-xs rounded-full border font-bold ${priorityStyle.badge}`}>{notice.priority.charAt(0).toUpperCase() + notice.priority.slice(1)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-text-medium">
                    {notice.content}
                  </div>
                  <div className="mt-2 text-xs text-text-medium">
                    {moment(notice.createdAt).format('MMM D, YYYY [at] h:mm A')}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-text-medium">No notices found.</div>
        )}
      </motion.div>
    </div>
  );
};

export default Notices;
