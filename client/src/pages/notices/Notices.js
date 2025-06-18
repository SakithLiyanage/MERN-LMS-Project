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
  PlusIcon
} from '@heroicons/react/outline';

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
    if (activeTab === 'course') return notice.course !== null;
    if (activeTab === 'general') return notice.course === null;
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
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notices & Announcements</h1>
          <p className="text-gray-600">Stay updated with important information</p>
        </div>
        
        {isTeacher && (
          <Link
            to="/teacher/notices/create"
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-primary-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Notice
          </Link>
        )}
      </div>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
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
                className={`p-5 bg-white rounded-lg shadow-md ${
                  notice.pinned ? 'border-l-4 border-primary-500' : ''
                }`}
              >
                <div className="sm:flex sm:justify-between sm:items-start">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      {priorityStyle.icon}
                    </div>
                    <div className="ml-3">
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium text-gray-800">{notice.title}</h3>
                        {notice.pinned && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-primary-100 text-primary-800 rounded-full">
                            Pinned
                          </span>
                        )}
                        <span className={`ml-2 px-2 py-0.5 text-xs ${priorityStyle.badge} rounded-full`}>
                          {notice.priority.charAt(0).toUpperCase() + notice.priority.slice(1)}
                        </span>
                      </div>
                      
                      {notice.course && (
                        <p className="mt-1 text-sm text-gray-600">
                          Course: {notice.course.title}
                        </p>
                      )}
                      
                      <div className="mt-2 text-sm text-gray-700">
                        <p>{notice.content}</p>
                      </div>
                      
                      {notice.attachments && notice.attachments.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700">Attachments:</p>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {notice.attachments.map((attachment, idx) => (
                              <a
                                key={idx}
                                href={`/uploads/${attachment}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 border border-gray-200 rounded hover:bg-gray-200 text-gray-700"
                              >
                                <DocumentTextIcon className="h-3 w-3 mr-1" />
                                {attachment.split('/').pop().substring(0, 15)}
                                {attachment.split('/').pop().length > 15 ? '...' : ''}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-3 flex items-center text-xs text-gray-500">
                        <p>Posted by {notice.author?.name || 'Unknown'} • {moment(notice.createdAt).fromNow()}</p>
                      </div>
                    </div>
                  </div>
                  
                  {isTeacher && notice.author?._id === user._id && (
                    <div className="mt-4 sm:mt-0 sm:ml-6">
                      <button 
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this notice?')) {
                            // Delete notice API call would go here
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">No notices found in this category.</p>
        </div>
      )}
    </div>
  );
};

export default Notices;
