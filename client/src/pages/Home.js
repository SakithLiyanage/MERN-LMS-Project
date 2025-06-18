import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import { 
  AcademicCapIcon, 
  BookOpenIcon, 
  UserGroupIcon, 
  CheckCircleIcon,
  ArrowRightIcon // Added missing import
} from '@heroicons/react/outline';

const Home = () => {
  const { isAuthenticated, user } = useContext(AuthContext);

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  const features = [
    {
      icon: <BookOpenIcon className="h-6 w-6" />,
      title: 'Digital Course Materials',
      description: 'Access all your learning resources in one place, from any device, anywhere.'
    },
    {
      icon: <UserGroupIcon className="h-6 w-6" />,
      title: 'Collaborative Learning',
      description: 'Stay connected with classmates and instructors through announcements and updates.'
    },
    {
      icon: <AcademicCapIcon className="h-6 w-6" />,
      title: 'Real-time Quizzes',
      description: 'Test your knowledge with interactive quizzes and get instant results.'
    },
    {
      icon: <UserGroupIcon className="h-6 w-6" />,
      title: 'Collaborative Learning',
      description: 'Stay connected with classmates and instructors through announcements and updates.'
    }
  ];
  
  const testimonials = [
    {
      quote: "This LMS platform has completely transformed how I manage my courses. It's intuitive and saves me so much time!",
      author: "Dr. Sarah Johnson",
      role: "Professor of Computer Science"
    },
    {
      quote: "As a student, I love how easy it is to access all my course materials and submit assignments in one place.",
      author: "Michael Chen",
      role: "Engineering Student"
    }
  ];
  
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <motion.section 
        className="relative bg-gradient-to-br from-primary-600 to-secondary-700 py-16 md:py-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:20px_20px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Modern Learning for the Digital Classroom
              </motion.h1>
              <motion.p 
                className="text-lg md:text-xl text-primary-100 mb-8 max-w-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                A comprehensive learning management system designed to enhance teaching and learning experiences in a digital environment.
              </motion.p>
              
              <motion.div
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                {isAuthenticated ? (
                  <Link
                    to={user?.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'}
                    className="px-6 py-3 bg-white text-primary-700 rounded-md font-medium hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="px-6 py-3 bg-white text-primary-700 rounded-md font-medium hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      Get Started
                    </Link>
                    <Link
                      to="/login"
                      className="px-6 py-3 bg-transparent border border-white text-white rounded-md font-medium hover:bg-white/10 transition-colors"
                    >
                      Log In
                    </Link>
                  </>
                )}
              </motion.div>
            </div>
            
            <motion.div 
              className="md:w-1/2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/20 to-secondary-500/20 rounded-3xl transform rotate-3"></div>
                <img
                  src="/img/dashboard-preview.png"
                  alt="LMS Dashboard Preview"
                  className="relative z-10 rounded-2xl shadow-2xl"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        className="py-16 md:py-24"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            variants={itemVariants}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Designed for Modern Learning</h2>
            <p className="max-w-2xl mx-auto text-lg text-gray-600">
              Our platform provides all the tools you need for effective teaching and engaging learning experiences.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 mb-5">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Benefits Section */}
      <motion.section 
        className="bg-gray-50 py-16 md:py-24"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            variants={itemVariants}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Benefits for Everyone</h2>
            <p className="max-w-2xl mx-auto text-lg text-gray-600">
              Whether you're a teacher or a student, our platform enhances the learning experience.
            </p>
          </motion.div>
          
          <div className="md:flex md:items-center md:justify-between">
            <motion.div 
              className="md:w-1/2 mb-10 md:mb-0"
              variants={itemVariants}
            >
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">For Teachers</h3>
              <ul className="space-y-4">
                {[
                  'Create and manage courses with ease',
                  'Share materials in various formats',
                  'Design assessments and quizzes',
                  'Track student progress and engagement',
                  'Communicate effectively with students',
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircleIcon className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div 
              className="md:w-1/2"
              variants={itemVariants}
            >
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">For Students</h3>
              <ul className="space-y-4">
                {[
                  'Access all course materials in one place',
                  'Submit assignments digitally',
                  'Take quizzes and get instant feedback',
                  'Track your grades and progress',
                  'Stay updated with course announcements',
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircleIcon className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Testimonials */}
      <motion.section 
        className="py-16 md:py-24"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            variants={itemVariants}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What People Say</h2>
            <p className="max-w-2xl mx-auto text-lg text-gray-600">
              Hear from our users about how our platform has transformed their teaching and learning experiences.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white p-8 rounded-xl shadow-sm border border-gray-100"
              >
                <p className="text-gray-700 italic mb-6">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.author}</p>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="bg-primary-700 py-16 md:py-20 text-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to transform your learning experience?</h2>
          <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of teachers and students who are already using our platform to enhance their educational journey.
          </p>
          <Link
            to={isAuthenticated ? (user?.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard') : '/register'}
            className="inline-flex items-center px-6 py-3 bg-white text-primary-700 rounded-md font-medium hover:bg-gray-100 transition-colors shadow-lg"
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Get Started For Free'}
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;
