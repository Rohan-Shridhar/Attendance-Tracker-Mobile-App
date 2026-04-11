const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  subject_id: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
}, { 
  collection: 'teachers',
  versionKey: false 
});

module.exports = mongoose.model('Teacher', teacherSchema);
