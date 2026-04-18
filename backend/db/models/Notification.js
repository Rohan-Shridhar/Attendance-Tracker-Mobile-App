const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  usn: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ["absent_alert", "low_attendance_alert"],
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  subject_id: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  attendance_percentage: {
    type: Number,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  is_read: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'notifications'
});

module.exports = mongoose.model('Notification', notificationSchema);
