const express = require('express');
const router = express.Router();
const { getRecentActivities } = require('../controllers/activity.controller');
const { protect } = require('../middleware/auth.middleware');

// All routes here are protected
router.use(protect);

// Get recent activities for dashboard
router.get('/recent', getRecentActivities);

module.exports = router;
