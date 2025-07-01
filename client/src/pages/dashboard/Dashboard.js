import React, { useContext } from 'react';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';
import AuthContext from '../../context/AuthContext';
// If using any Heroicons, update imports to v2 format
import { UserIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <UserIcon className="h-10 w-10 text-gray-500 mr-4" aria-hidden="true" />
            <h2 className="text-xl font-semibold text-gray-800">
              Welcome, {user ? user.name : 'Guest'}
            </h2>
          </div>
          {user ? (
            user.role === 'teacher' ? (
              <TeacherDashboard />
            ) : (
              <StudentDashboard />
            )
          ) : (
            <p className="text-gray-600">
              Please log in to access your dashboard.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;