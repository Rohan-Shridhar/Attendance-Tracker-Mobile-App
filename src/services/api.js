const BASE_URL = 'http://192.168.1.96:3000/api';

/**
 * Handle API responses and shared error logic
 */
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

/**
 * Student Login API
 * @param {string} usn 
 * @param {string} password 
 */
export const studentLogin = async (usn, password) => {
  const response = await fetch(`${BASE_URL}/auth/student-login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ usn, password }),
  });
  return handleResponse(response);
};

/**
 * Teacher Login API
 * @param {string} email 
 * @param {string} password
 */
export const teacherLogin = async (email, password) => {
  const response = await fetch(`${BASE_URL}/auth/teacher-login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
};

/**
 * Get total student count from backend
 */
export const getStudentCount = async () => {
  const response = await fetch(`${BASE_URL}/teacher/student-count`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse(response);
};

/**
 * Get student attendance percentages
 * @param {string} usn
 */
export const getStudentAttendance = async (usn) => {
  const response = await fetch(`${BASE_URL}/attendance/student/${usn}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse(response);
};

/**
 * Get attendance percentages for all students in a class
 * @param {string} subjectId 
 */
export const getClassAttendance = async (subjectId) => {
  const response = await fetch(`${BASE_URL}/attendance/class/${subjectId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse(response);
};

/**
 * Get detailed attendance timeline for a specific student and subject
 * @param {string} usn
 * @param {string} subjectId 
 */
export const getSubjectDetail = async (usn, subjectId) => {
  const response = await fetch(`${BASE_URL}/attendance/student/${usn}/${subjectId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse(response);
};

/**
 * Change the user's password
 * @param {string} role 
 * @param {string} identifier 
 * @param {string} currentPassword 
 * @param {string} newPassword 
 */
export const changePassword = async (role, identifier, currentPassword, newPassword) => {
  const response = await fetch(`${BASE_URL}/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ role, identifier, currentPassword, newPassword }),
  });
  return handleResponse(response);
};
