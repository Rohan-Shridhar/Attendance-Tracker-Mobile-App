const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllRead, sendLowAttendanceAlerts } = require('../controllers/notificationController');

// @route   GET /api/notifications/:usn
router.get('/:usn', getNotifications);

// @route   POST /api/notifications/mark-read/:id
router.post('/mark-read/:id', markAsRead);

// @route   POST /api/notifications/mark-all-read/:usn
router.post('/mark-all-read/:usn', markAllRead);

// @route   POST /api/notifications/send-alerts
router.post('/send-alerts', sendLowAttendanceAlerts);

module.exports = router;
