const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  usn: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  password: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    enum: ['M', 'F'],
    required: true,
  },
}, { 
  collection: 'students',
  versionKey: false 
});

module.exports = mongoose.model('Student', studentSchema);
