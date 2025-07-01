# MERN Learning Management System

A modern, production-ready Learning Management System built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- **Robust Authentication**: Register, login, password reset, JWT-based sessions, and role-based access (Student, Teacher, Admin)
- **Course Management**: Create, edit, join, and view courses; support for course cover images (via URL or upload)
- **Assignments**: Teachers can create, grade, and manage assignments; students can submit and track assignments
- **Quizzes**: Teachers can create/edit quizzes with multiple question types (Single Choice, Multiple Choice, Text); students can take quizzes and view results
- **Materials**: Upload, link, and distribute study materials (PDF, images, videos, links)
- **Notices & Announcements**: Course-specific and global notices with priority and pinning
- **Student Enrollment**: Join courses via code or enrollment key
- **Dashboards**: Modern dashboards for teachers and students with stats, recent activity, and quick actions
- **Notifications**: In-app notification system for new assignments, quizzes, notices, and more
- **Modern UI/UX**: Responsive, accessible, and consistent design using TailwindCSS and Framer Motion
- **Error Handling**: Robust error handling, loading states, and user feedback throughout
- **Accessibility & Best Practices**: Keyboard navigation, ARIA labels, and accessible components

## Tech Stack

- **Frontend**: React, TailwindCSS, Framer Motion, React Router, React Toastify
- **Backend**: Node.js, Express, Multer (file uploads), JWT, Mongoose
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/MERN-LMS-Project.git
   cd MERN-LMS-Project
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   # Install client dependencies
   cd client && npm install && cd ..
   # Install server dependencies
   cd server && npm install && cd ..
   ```

3. **Set up environment variables**
   - Create a `.env` file in the root or `server/` directory with:
     ```
     PORT=5000
     MONGO_URI=mongodb://localhost:27017/lms_db
     JWT_SECRET=your_secret_key
     JWT_EXPIRE=30d
     ```

4. **Run the application**
   ```bash
   # Run server & client concurrently
   npm run dev
   # Or run individually
   npm run server   # Backend only
   npm run client   # Frontend only
   ```

5. **(Optional) Seed or reset the database**
   ```bash
   # Example scripts (see server/scripts/)
   node server/scripts/reset-database.js
   ```

### Default Ports
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Project Structure

```
MERN-LMS-Project/
  client/
    public/           # Static assets (favicon, index.html, etc.)
    src/
      components/     # Reusable UI components (layout, course, routing, etc.)
      context/        # React Context providers (Auth, Notification)
      pages/          # Main pages (dashboard, courses, assignments, quizzes, etc.)
      services/       # API and content services
      utils/          # Utility functions (API helpers, etc.)
      styles/         # Tailwind and custom styles
      index.js        # App entry point
      App.js          # Main app and routing
    tailwind.config.js
    package.json
  server/
    controllers/      # Express controllers (auth, course, assignment, quiz, etc.)
    models/           # Mongoose models (User, Course, Assignment, Quiz, etc.)
    routes/           # Express routes (REST API)
    middleware/       # Auth and other middleware
    scripts/          # DB and utility scripts
    uploads/          # Uploaded files (materials, images)
    server.js         # Express app entry point
    package.json
  package.json        # Root scripts (concurrently, install-all, etc.)
  README.md           # This file
```

## Usage & Best Practices

- **Authentication**: JWT-based, with context providers for auth and notifications
- **Role-based Access**: Student, Teacher, and Admin routes and dashboards
- **Course Images**: Add cover images via URL or upload for a modern look
- **Quiz Types**: Teachers can create MCQs (single/multiple), text questions, and edit quizzes unless there are submissions
- **Assignments & Materials**: Teachers can upload, students can submit/download; robust error handling for file uploads
- **Notices**: Priority, pinning, and course/global scope
- **Modern UI**: Responsive, accessible, and consistent across all pages
- **Error Handling**: Defensive checks, user feedback, and loading states everywhere
- **Notifications**: In-app notifications for all major actions
- **Accessibility**: Keyboard navigation, ARIA labels, and accessible components

## License

[MIT](LICENSE)

