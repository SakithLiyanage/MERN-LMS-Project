import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import {
  BellIcon,
  UserCircleIcon,
  MenuIcon,
  XIcon
} from '@heroicons/react/outline';
import AuthContext from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const location = useLocation();
  const { notifications, markAsRead } = useNotifications();

  const navLinks = [
    { name: 'Home', to: '/', public: true },
    { name: 'Courses', to: '/courses', public: false },
  ];

  function isActive(path) {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  }

  function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
  }

  return (
    <Disclosure as="nav" className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-neutral-50">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button*/}
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-primary-100 focus:outline-none">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <Link to="/">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="text-2xl font-extrabold font-heading text-primary-400 drop-shadow-lg tracking-tight bg-gradient-to-r from-primary-400 to-secondary-500 bg-clip-text text-transparent"
                    >
                      LMS Portal
                    </motion.div>
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex space-x-2">
                    {navLinks.map((item) => (
                      (item.public || isAuthenticated) && (
                        <Link
                          key={item.name}
                          to={item.to}
                          className={classNames(
                            isActive(item.to)
                              ? 'bg-primary-100 text-primary-700 shadow-lg'
                              : 'text-text-dark hover:bg-primary-50 hover:text-primary-500',
                            'rounded-xl px-4 py-2 text-base font-semibold transition-all duration-200 ease-in-out backdrop-blur-md'
                          )}
                        >
                          {item.name}
                        </Link>
                      )
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                {isAuthenticated ? (
                  <>
                    {/* Notification dropdown */}
                    <Menu as="div" className="relative ml-3">
                      <div>
                        <Menu.Button className="relative flex rounded-full bg-white/70 shadow border border-primary-100 text-sm focus:outline-none transition-all duration-200">
                          <span className="sr-only">View notifications</span>
                          <BellIcon className="h-6 w-6 text-gray-700" />
                          {notifications.filter(n => !n.read).length > 0 && (
                            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400"></span>
                          )}
                        </Menu.Button>
                      </div>
                      <Transition
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-72 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="px-4 py-2 font-semibold text-gray-700 border-b">
                            Notifications
                          </div>
                          {notifications.length > 0 ? (
                            notifications.map(notification => (
                              <Menu.Item key={notification._id}>
                                <div
                                  className={`block px-4 py-2 text-sm cursor-pointer ${notification.read ? 'text-gray-500' : 'text-gray-700 font-medium bg-blue-50'}`}
                                  onClick={() => markAsRead(notification._id)}
                                >
                                  {notification.text}
                                </div>
                              </Menu.Item>
                            ))
                          ) : (
                            <Menu.Item>
                              <div className="block px-4 py-2 text-sm text-gray-500">
                                No new notifications
                              </div>
                            </Menu.Item>
                          )}
                        </Menu.Items>
                      </Transition>
                    </Menu>
                    {/* Profile dropdown */}
                    <Menu as="div" className="relative ml-3">
                      <div>
                        <Menu.Button className="flex rounded-full bg-white/70 shadow border border-primary-100 text-sm focus:outline-none transition-all duration-200">
                          <span className="sr-only">Open user menu</span>
                          <div className="h-8 w-8 rounded-full flex items-center justify-center bg-primary-100 text-primary-700 font-bold border-2 border-primary-400 shadow">
                            {user?.name?.charAt(0).toUpperCase()}
                          </div>
                        </Menu.Button>
                      </div>
                      <Transition
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-xl bg-white/90 shadow-lg ring-1 ring-primary-100 focus:outline-none backdrop-blur-md">
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                to={user?.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'}
                                className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                              >
                                Dashboard
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={logout}
                                className={classNames(active ? 'bg-gray-100' : '', 'block w-full text-left px-4 py-2 text-sm text-gray-700')}
                              >
                                Sign out
                              </button>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </>
                ) : (
                  <div className="flex space-x-4">
                    <Link
                      to="/login"
                      className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="bg-primary-600 text-white hover:bg-primary-700 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navLinks.map((item) => (
                (item.public || isAuthenticated) && (
                  <Disclosure.Button
                    key={item.name}
                    as={Link}
                    to={item.to}
                    className={classNames(
                      isActive(item.to)
                        ? 'bg-primary-100 text-primary-700 shadow'
                        : 'text-gray-700 hover:bg-primary-50 hover:text-primary-700',
                      'block rounded-md px-3 py-2 text-base font-semibold'
                    )}
                  >
                    {item.name}
                  </Disclosure.Button>
                )
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default Navbar;
