const express = require('express');
const router = express.Router();
const { getStudentCount } = require('../controllers/teacherController');

// @route   GET /api/teacher/student-count
router.get('/student-count', getStudentCount);

module.exports = router;
