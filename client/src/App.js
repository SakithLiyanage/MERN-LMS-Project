import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Auth Context
import { AuthProvider } from './context/AuthContext';

// Layout Components
import Layout from './components/layout/Layout';
import PrivateRoute from './components/routing/PrivateRoute';
import TeacherRoute from './components/routing/TeacherRoute';
import StudentRoute from './components/routing/StudentRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Public Pages
import Home from './pages/Home';
import NotFound from './pages/NotFound';

// Dashboard Pages
import TeacherDashboard from './pages/teacher/Dashboard';
import StudentDashboard from './pages/student/Dashboard';

// Course Pages
import Courses from './pages/courses/Courses';
import CourseDetails from './pages/courses/CourseDetails';
import CreateCourse from './pages/teacher/CreateCourse';
import EditCourse from './pages/teacher/EditCourse';

// Assignment Pages
import Assignments from './pages/assignments/Assignments';
import AssignmentDetails from './pages/assignments/AssignmentDetails';
import CreateAssignment from './pages/teacher/CreateAssignment';
import SubmitAssignment from './pages/student/SubmitAssignment';

// Quiz Pages
import Quizzes from './pages/quizzes/Quizzes';
import QuizDetails from './pages/quizzes/QuizDetails';
import CreateQuiz from './pages/teacher/CreateQuiz';
import TakeQuiz from './pages/quizzes/TakeQuiz';
import QuizResult from './pages/quizzes/QuizResult';

// Material Pages
import Materials from './pages/materials/Materials';
import CreateMaterial from './pages/teacher/CreateMaterial';

// Notice Pages
import Notices from './pages/notices/Notices';
import CreateNotice from './pages/teacher/CreateNotice';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes - Both Roles */}
          <Route element={<PrivateRoute />}>
            <Route path="/courses" element={<Layout><Courses /></Layout>} />
            <Route path="/courses/:id" element={<Layout><CourseDetails /></Layout>} />
            <Route path="/notices" element={<Layout><Notices /></Layout>} />
            <Route path="/materials" element={<Layout><Materials /></Layout>} />
          </Route>

          {/* Teacher Routes */}
          <Route element={<TeacherRoute />}>
            <Route path="/teacher/dashboard" element={<Layout><TeacherDashboard /></Layout>} />
            <Route path="/teacher/courses/create" element={<Layout><CreateCourse /></Layout>} />
            <Route path="/teacher/courses/:id/edit" element={<Layout><EditCourse /></Layout>} />
            <Route path="/teacher/assignments/create/:courseId" element={<Layout><CreateAssignment /></Layout>} />
            <Route path="/teacher/quizzes/create/:courseId" element={<Layout><CreateQuiz /></Layout>} />
            <Route path="/teacher/materials/create/:courseId" element={<Layout><CreateMaterial /></Layout>} />
            <Route path="/teacher/notices/create/:courseId" element={<Layout><CreateNotice /></Layout>} />
          </Route>

          {/* Student Routes */}
          <Route element={<StudentRoute />}>
            <Route path="/student/dashboard" element={<Layout><StudentDashboard /></Layout>} />
            <Route path="/assignments/:id/submit" element={<Layout><SubmitAssignment /></Layout>} />
            <Route path="/quizzes/:id/take" element={<Layout><TakeQuiz /></Layout>} />
          </Route>

          {/* Assignment Routes - Both Roles */}
          <Route element={<PrivateRoute />}>
            <Route path="/assignments" element={<Layout><Assignments /></Layout>} />
            <Route path="/assignments/:id" element={<Layout><AssignmentDetails /></Layout>} />
          </Route>

          {/* Quiz Routes - Both Roles */}
          <Route element={<PrivateRoute />}>
            <Route path="/quizzes" element={<Layout><Quizzes /></Layout>} />
            <Route path="/quizzes/:id" element={<Layout><QuizDetails /></Layout>} />
            <Route 
              path="/quizzes/:id/take" 
              element={
                <PrivateRoute>
                  <StudentRoute>
                    <TakeQuiz />
                  </StudentRoute>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/quizzes/:quizId/results/:resultId" 
              element={
                <PrivateRoute>
                  <QuizResult />
                </PrivateRoute>
              } 
            />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
