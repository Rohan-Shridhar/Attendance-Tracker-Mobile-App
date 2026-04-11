const express = require('express');
const router = express.Router();
const { studentLogin, teacherLogin } = require('../controllers/authController');

// @route   POST /api/auth/student-login
router.post('/student-login', studentLogin);

// @route   POST /api/auth/teacher-login
router.post('/teacher-login', teacherLogin);

module.exports = router;
