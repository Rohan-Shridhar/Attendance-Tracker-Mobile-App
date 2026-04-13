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

// Connect to Database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/attendance', attendanceRoutes);
const qrRoutes = require('./routes/qrRoutes');
app.use('/api/qr', qrRoutes);

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Attendance Tracker API is running...');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
