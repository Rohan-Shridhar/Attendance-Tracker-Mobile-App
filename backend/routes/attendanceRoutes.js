const express = require('express');
const router = express.Router();
const { 
  getStudentAttendance, 
  getClassAttendance,
  getSubjectDetail
} = require('../controllers/attendanceController');

// @route   GET /api/attendance/student/:usn
router.get('/student/:usn', getStudentAttendance);

// @route   GET /api/attendance/class/:subject_id
router.get('/class/:subject_id', getClassAttendance);

// @route   GET /api/attendance/student/:usn/:subject_id
router.get('/student/:usn/:subject_id', getSubjectDetail);

module.exports = router;
