const express = require('express');
const router = express.Router();
const { 
  getStudentAttendance, 
  getClassAttendance,
  getSubjectDetail,
  markAttendance,
  getStudentSubjectDetail,
  getAttendancePreview,
  saveAttendance,
  getScannedCount
} = require('../controllers/attendanceController');

// @route   GET /api/attendance/student/:usn
router.get('/student/:usn', getStudentAttendance);

// @route   GET /api/attendance/class/:subject_id
router.get('/class/:subject_id', getClassAttendance);

// @route   GET /api/attendance/student/:usn/:subject_id
router.get('/student/:usn/:subject_id', getSubjectDetail);

// @route   POST /api/attendance/mark
router.post('/mark', markAttendance);

// @route   GET /api/attendance/student/:usn/subject/:collectionName
router.get('/student/:usn/subject/:collectionName', getStudentSubjectDetail);

// @route   GET /api/attendance/preview/:subject_id/:date
router.get('/preview/:subject_id/:date', getAttendancePreview);

// @route   POST /api/attendance/save
router.post('/save', saveAttendance);

// @route   GET /api/attendance/scanned-count/:subject_id/:date
router.get('/scanned-count/:subject_id/:date', getScannedCount);

module.exports = router;
