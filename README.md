# MERN Learning Management System

A comprehensive Learning Management System built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- User authentication and role-based access control (Student, Teacher, Admin)
- Course creation and management
- Assignment submission and grading
- Quiz creation and attempts
- Material uploads and distribution
- Student enrollment system
- Notices and announcements

## Tech Stack

- **Frontend**: React, TailwindCSS, Framer Motion
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT

## Installation

1. Clone the repository
   ```bash
   git clone https://github.com/YOUR_USERNAME/MERN-LMS-Project.git
   cd MERN-LMS-Project
   ```

2. Install dependencies
   ```bash
   # Install server dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

3. Set up environment variables
   Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/lms_db
   JWT_SECRET=your_secret_key
   JWT_EXPIRE=30d
   ```

4. Run the application
   ```bash
   # Run server & client concurrently
   npm run dev
   
   # Run server only
   npm run server
   
   # Run client only
   npm run client
   ```

## License

[MIT](LICENSE)
3. Set up environment variables:
   - Create a `.env` file in the server directory based on the `.env.example` file

4. Seed the database with example data (optional):
```bash
npm run seed
```

5. Start the development servers:
```bash
npm run dev
```

This will start both the backend server and frontend development server concurrently.

### Default Ports
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Project Structure

