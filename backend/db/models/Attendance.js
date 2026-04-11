const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
}, { 
  strict: false, // Allow dynamic USN fields
  versionKey: false 
});

/**
 * Factory function to get or create a Mongoose model for a specific attendance collection.
 * 
 * @param {string} collectionName - One of: 'dst', 'dbm', 'oop', 'ops', 'cns'
 * @returns {mongoose.Model}
 */
const getAttendanceModel = (collectionName) => {
  const validCollections = ['dst', 'dbm', 'oop', 'ops', 'cns'];
  
  if (!validCollections.includes(collectionName.toLowerCase())) {
    throw new Error(`Invalid attendance collection name: ${collectionName}`);
  }

  const modelName = collectionName.toLowerCase();
  
  // Check if model already exists to avoid OverwriteModelError
  if (mongoose.models[modelName]) {
    return mongoose.models[modelName];
  }

  // Create new model with specific collection name
  return mongoose.model(modelName, attendanceSchema, modelName);
};

module.exports = { getAttendanceModel };
