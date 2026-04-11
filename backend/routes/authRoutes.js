const express = require('express');
const router = express.Router();
const { studentLogin, teacherLogin, changePassword } = require('../controllers/authController');

// @route   POST /api/auth/student-login
router.post('/student-login', studentLogin);

// @route   POST /api/auth/teacher-login
router.post('/teacher-login', teacherLogin);

// @route   POST /api/auth/change-password
router.post('/change-password', changePassword);

module.exports = router;
