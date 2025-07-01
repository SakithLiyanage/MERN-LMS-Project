import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  BookOpenIcon,
  ClipboardCheckIcon,
  DocumentTextIcon,
  BellIcon,
  AcademicCapIcon,
  ChevronDownIcon
} from '@heroicons/react/outline';
import AuthContext from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [expanded, setExpanded] = useState({ courses: false });

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
  ];

  const toggleSubmenu = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isActive = (pathname) => {
    return location.pathname === pathname || location.pathname.startsWith(`${pathname}/`);
  };

  return (
    <aside className="h-screen w-64 bg-white/80 backdrop-blur-md shadow-xl fixed left-0 top-16 hidden md:flex flex-col overflow-y-auto border-r border-neutral-50">
      <div className="py-6 flex-1 flex flex-col">
        <div className="px-6 mb-8">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3 border-2 border-primary-400 shadow">
              <span className="text-primary-700 font-bold text-lg">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-base font-semibold text-text-dark">{user?.name}</p>
              <p className="text-xs text-text-medium capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
        <nav className="px-3 space-y-1 flex-1">
          {navigationItems.map((item) => (
            <div key={item.name} className="">
              {item.submenu ? (
                <>
                  <button
                    className={`flex items-center justify-between w-full px-3 py-2 text-base font-semibold rounded-xl transition-all duration-200 focus:outline-none backdrop-blur-md ${
                      isActive(item.href)
                        ? 'bg-primary-100 text-primary-700 shadow-lg'
                        : 'text-text-dark hover:bg-primary-50 hover:text-primary-500'
                    }`}
                    onClick={() => toggleSubmenu('courses')}
                  >
                    <div className="flex items-center">
                      <span className="mr-3">{item.icon}</span>
                      {item.name}
                    </div>
                    <ChevronDownIcon
                      className={`w-4 h-4 transition-transform ${
                        expanded['courses'] ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {expanded['courses'] && (
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
                            className={`block px-3 py-2 text-base rounded-lg transition-all duration-200 ${
                              isActive(subItem.href)
                                ? 'bg-primary-100 text-primary-700 shadow-lg'
                                : 'text-text-medium hover:bg-primary-50 hover:text-primary-500'
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
                  className={`flex items-center px-3 py-2 text-base font-semibold rounded-xl transition-all duration-200 backdrop-blur-md ${
                    isActive(item.href)
                      ? 'bg-primary-100 text-primary-700 shadow-lg'
                      : 'text-text-dark hover:bg-primary-50 hover:text-primary-500'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
