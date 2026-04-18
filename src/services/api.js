const BASE_URL = 'http://192.168.0.104:3000/api';

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

/**
 * Update the global active QR token in the database
 * @param {string} token 
 */
export const updateQRToken = async (token) => {
  const response = await fetch(`${BASE_URL}/qr/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  });
  return handleResponse(response);
};

/**
 * Clear the global active QR token from the database
 */
export const clearQRToken = async () => {
  const response = await fetch(`${BASE_URL}/qr/clear`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse(response);
};

export const updateQRKey1 = async (token) => {
  const response = await fetch(`${BASE_URL}/qr/update-key1`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  return handleResponse(response);
};

export const updateQRKey2 = async (token) => {
  const response = await fetch(`${BASE_URL}/qr/update-key2`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  return handleResponse(response);
};

export const clearQRKey1 = async () => {
  const response = await fetch(`${BASE_URL}/qr/clear-key1`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return handleResponse(response);
};

export const clearQRKey2 = async () => {
  const response = await fetch(`${BASE_URL}/qr/clear-key2`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return handleResponse(response);
};

/**
 * Mark student attendance with full token (token + USN)
 * @param {string} fullToken 
 */
export const markAttendance = async (fullToken) => {
  const response = await fetch(`${BASE_URL}/attendance/mark`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token: fullToken }),
  });
  return handleResponse(response);
};

/**
 * Get detailed attendance records for a student and subject collection
 * @param {string} usn 
 * @param {string} collectionName 
 */
export const getStudentSubjectDetail = async (usn, collectionName) => {
  const response = await fetch(`${BASE_URL}/attendance/student/${usn}/subject/${collectionName}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse(response);
};

/**
 * Get preview of attendance counts
 * @param {string} subject_id 
 * @param {string} date 
 */
export const getAttendancePreview = async (subject_id, date) => {
  const response = await fetch(`${BASE_URL}/attendance/preview/${subject_id}/${date}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse(response);
};

/**
 * Finalize and save attendance
 * @param {string} subject_id 
 * @param {string} date 
 */
export const saveAttendance = async (subject_id, date) => {
  const response = await fetch(`${BASE_URL}/attendance/save`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ subject_id, date }),
  });
  return handleResponse(response);
};

/**
 * Get count of students who have scanned
 * @param {string} subject_id 
 * @param {string} date 
 */
export const getScannedCount = async (subject_id, date) => {
  const response = await fetch(`${BASE_URL}/attendance/scanned-count/${subject_id}/${date}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse(response);
};

/**
 * Get all notifications for a student
 * @param {string} usn 
 */
export const getNotifications = async (usn) => {
  const response = await fetch(`${BASE_URL}/notifications/${usn}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse(response);
};

/**
 * Mark a notification as read
 * @param {string} id Notification ID
 */
export const markAsRead = async (id) => {
  const response = await fetch(`${BASE_URL}/notifications/mark-read/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse(response);
};

/**
 * Mark all notifications for a student as read
 * @param {string} usn 
 */
export const markAllRead = async (usn) => {
  const response = await fetch(`${BASE_URL}/notifications/mark-all-read/${usn}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse(response);
};

/**
 * Send low attendance alerts to students below threshold
 * @param {string} subject_id 
 */
export const sendLowAttendanceAlerts = async (subject_id) => {
  const response = await fetch(`${BASE_URL}/notifications/send-alerts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ subject_id }),
  });
  return handleResponse(response);
};


