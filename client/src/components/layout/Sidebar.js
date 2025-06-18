import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  BookOpenIcon,
  ClipboardCheckIcon,
  DocumentTextIcon,
  UserGroupIcon,
  BellIcon,
  CogIcon,
  LogoutIcon,
  AcademicCapIcon,
  ChevronDownIcon
} from '@heroicons/react/outline';
import AuthContext from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [expanded, setExpanded] = useState({
    courses: false,
    assignments: false,
  });

  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';

  const navigationItems = [
    {
      name: 'Dashboard',
      icon: <HomeIcon className="w-5 h-5" />,
      href: isTeacher ? '/teacher/dashboard' : '/student/dashboard',
    },
    {
      name: 'Courses',
      icon: <BookOpenIcon className="w-5 h-5" />,
      href: '/courses',
      submenu: isTeacher ? [
        { name: 'All Courses', href: '/courses' },
        { name: 'Create Course', href: '/teacher/courses/create' },
      ] : null,
    },
    {
      name: 'Assignments',
      icon: <ClipboardCheckIcon className="w-5 h-5" />,
      href: '/assignments',
    },
    {
      name: 'Quizzes',
      icon: <AcademicCapIcon className="w-5 h-5" />,
      href: '/quizzes',
    },
    {
      name: 'Materials',
      icon: <DocumentTextIcon className="w-5 h-5" />,
      href: '/materials',
    },
    {
      name: 'Notices',
      icon: <BellIcon className="w-5 h-5" />,
      href: '/notices',
    },
  ];

  const toggleSubmenu = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isActive = (pathname) => {
    return location.pathname === pathname || location.pathname.startsWith(`${pathname}/`);
  };

  return (
    <div className="h-screen w-64 bg-white shadow-md fixed left-0 top-16 hidden md:block overflow-y-auto">
      <div className="py-6">
        <div className="px-6 mb-8">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
              <span className="text-primary-700 font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        <div className="px-3 space-y-1">
          {navigationItems.map((item) => (
            <div key={item.name}>
              {item.submenu ? (
                <>
                  <button
                    className={`flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => toggleSubmenu(item.name.toLowerCase())}
                  >
                    <div className="flex items-center">
                      <span className="mr-3">{item.icon}</span>
                      {item.name}
                    </div>
                    <ChevronDownIcon
                      className={`w-4 h-4 transition-transform ${
                        expanded[item.name.toLowerCase()] ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {expanded[item.name.toLowerCase()] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-8 space-y-1 mt-1"
                      >
                        {item.submenu.map((subItem) => (
                          <Link
                            key={subItem.name}
                            to={subItem.href}
                            className={`block px-3 py-2 text-sm rounded-md ${
                              isActive(subItem.href)
                                ? 'bg-primary-50 text-primary-700'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                            }`}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Link
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
