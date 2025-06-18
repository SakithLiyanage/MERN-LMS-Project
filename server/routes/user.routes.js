const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');

// Placeholder for user controller
// We'll need to create these functions later
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updatePassword
} = require('../controllers/user.controller');

// Routes for admin only
router.get('/', protect, authorize('admin'), getUsers);

// Routes for the user's own profile
router.get('/me', protect, getUser);
router.put('/me', protect, updateUser);
router.put('/me/password', protect, updatePassword);

// Admin route for managing users
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
