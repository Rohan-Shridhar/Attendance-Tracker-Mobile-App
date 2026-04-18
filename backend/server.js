const express = require('express');
const cors = require('cors');
const connectDB = require('./db/connection');
const authRoutes = require('./routes/authRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors()); // Basic CORS to allow all origins
app.use(express.json()); // JSON body parser

// Logger middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.method === 'POST') {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Connect to Database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/attendance', attendanceRoutes);
const qrRoutes = require('./routes/qrRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/qr', qrRoutes);
app.use('/api/notifications', notificationRoutes);

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Attendance Tracker API is running...');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
