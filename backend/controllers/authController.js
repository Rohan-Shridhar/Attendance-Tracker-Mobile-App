/**
 * Auth Controller for Student and Teacher Login
 * 
 * Example Requests & Responses:
 * 
 * POST /api/auth/student-login
 * Request Body: { "usn": "1wn24cs001", "password": "123" }
 * Success Response (200): { "role": "student", "name": "John Doe", "usn": "1WN24CS001", "gender": "M", "token": "mock-token-student" }
 * Error Response (404): { "message": "Student not found" }
 * Error Response (401): { "message": "Invalid password" }
 * 
 * POST /api/auth/teacher-login
 * Request Body: { "email": "NAME.CSE@BMSCE.AC.IN" }
 * Success Response (200): { "role": "teacher", "name": "Jane Smith", "email": "name.cse@bmsce.ac.in", "subject_id": "CS01", "subject": "DST", "token": "mock-token-teacher" }
 * Error Response (404): { "message": "Teacher not found" }
 */

const Student = require('../db/models/Student');
const Teacher = require('../db/models/Teacher');

// @desc    Student login
// @route   POST /api/auth/student-login
// @access  Public
const studentLogin = async (req, res) => {
  const { usn, password } = req.body;

  try {
    // Normalize USN for case-insensitive lookup
    const id = usn.toUpperCase();
    
    const student = await Student.findOne({ usn: id });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Passwords in DB are Number (Int32), req body password might be string
    if (Number(password) !== student.password) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    res.status(200).json({
      role: 'student',
      name: student.name,
      usn: student.usn,
      gender: student.gender,
      token: 'mock-token-student',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Teacher login
// @route   POST /api/auth/teacher-login
// @access  Public
const teacherLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Normalize email for case-insensitive lookup
    const id = email.toLowerCase();

    const teacher = await Teacher.findOne({ email: id });

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Passwords in DB are Number (Int32), req body password might be string
    if (Number(password) !== teacher.password) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    res.status(200).json({
      role: 'teacher',
      name: teacher.name,
      email: teacher.email,
      subject_id: teacher.subject_id,
      subject: teacher.subject,
      token: 'mock-token-teacher',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  studentLogin,
  teacherLogin,
};
