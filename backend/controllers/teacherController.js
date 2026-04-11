const Student = require('../db/models/Student');

/**
 * @desc    Get real student count from students collection
 * @route   GET /api/teacher/student-count
 * @access  Public (for now)
 */
const getStudentCount = async (req, res) => {
  try {
    const count = await Student.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStudentCount,
};
