import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Footer = () => (
  <motion.footer
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, delay: 0.2 }}
    className="bg-gradient-to-tr from-primary-700 to-secondary-800 text-white py-10 mt-16 shadow-inner"
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:justify-between items-center gap-6">
      <div className="flex flex-col items-center md:items-start">
        <span className="text-2xl font-extrabold font-heading tracking-tight bg-gradient-to-r from-primary-300 to-accent-yellow bg-clip-text text-transparent mb-2">
          LMS Portal
        </span>
        <span className="text-sm text-primary-100">&copy; {new Date().getFullYear()} Modern LMS. All rights reserved.</span>
      </div>
      <nav className="flex flex-wrap gap-6 text-primary-100 text-sm font-medium">
        <Link to="/" className="hover:text-accent-yellow transition-colors">Home</Link>
        <Link to="/courses" className="hover:text-accent-yellow transition-colors">Courses</Link>
        <Link to="/login" className="hover:text-accent-yellow transition-colors">Login</Link>
        <Link to="/register" className="hover:text-accent-yellow transition-colors">Register</Link>
      </nav>
      <div className="flex gap-4 mt-4 md:mt-0">
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent-yellow transition-colors">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.93 9.93 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195A4.92 4.92 0 0 0 16.616 3c-2.73 0-4.942 2.21-4.942 4.932 0 .386.045.762.127 1.124C7.728 8.807 4.1 6.884 1.671 3.965c-.423.722-.666 1.561-.666 2.475 0 1.708.87 3.216 2.188 4.099a4.904 4.904 0 0 1-2.237-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.209c9.057 0 14.009-7.496 14.009-13.986 0-.213-.005-.425-.014-.636A9.936 9.936 0 0 0 24 4.557z"/></svg>
        </a>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent-yellow transition-colors">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.157-1.11-1.465-1.11-1.465-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.987 1.029-2.686-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.338 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.699 1.028 1.593 1.028 2.686 0 3.847-2.338 4.695-4.566 4.944.359.309.678.919.678 1.852 0 1.336-.012 2.417-.012 2.747 0 .267.18.577.688.48C19.138 20.2 22 16.448 22 12.021 22 6.484 17.523 2 12 2z"/></svg>
        </a>
      </div>
    </div>
  </motion.footer>
);

export default Footer;
