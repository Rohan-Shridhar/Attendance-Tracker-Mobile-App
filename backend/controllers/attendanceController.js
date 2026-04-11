const { getAttendanceModel } = require('../db/models/Attendance');
const Student = require('../db/models/Student');

/**
 * @desc    Get student attendance percentages for all subjects
 * @route   GET /api/attendance/student/:usn
 * @access  Public (for now)
 */
const getStudentAttendance = async (req, res) => {
  const { usn } = req.params;
  const subjects = {
    dst: "Data Structures",
    dbm: "Database Management",
    oop: "Object Oriented Programming",
    ops: "Operating Systems",
    cns: "Computer Networks"
  };

  try {
    const results = {};

    for (const [key, name] of Object.entries(subjects)) {
      const Attendance = getAttendanceModel(key);
      const records = await Attendance.find({});
      
      let totalClasses = 0;
      let presentCount = 0;

      records.forEach(doc => {
        // Doc is a plain object because of strict: false in Mongoose
        // But Mongoose still returns documents. Let's use doc[usn]
        const status = doc.get(usn);
        if (status !== undefined && status !== null) {
          totalClasses++;
          if (status === "Present") {
            presentCount++;
          }
        }
      });

      const percentage = totalClasses === 0 ? 0 : Math.round((presentCount / totalClasses) * 100);
      
      results[key] = {
        subject: name,
        percentage: percentage
      };
    }

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get attendance percentages for all students in a class
 * @route   GET /api/attendance/class/:subject_id
 * @access  Public (for now)
 */
const getClassAttendance = async (req, res) => {
  const { subject_id } = req.params;
  
  // Extract last 3 chars and lowercase: "23CS4PCDST" -> "dst"
  const collectionName = subject_id.slice(-3).toLowerCase();
  const usns = [
    "1WN24CS001", "1WN24CS002", "1WN24CS003", "1WN24CS004", "1WN24CS005"
  ];

  try {
    const Attendance = getAttendanceModel(collectionName);
    const records = await Attendance.find({});
    const students = await Student.find({ usn: { $in: usns } });

    const results = usns.map(usn => {
      const student = students.find(s => s.usn === usn);
      
      let totalClasses = 0;
      let presentCount = 0;

      records.forEach(doc => {
        const status = doc.get(usn);
        if (status !== undefined && status !== null) {
          totalClasses++;
          if (status === "Present") {
            presentCount++;
          }
        }
      });

      const percentage = totalClasses === 0 ? 0 : Math.round((presentCount / totalClasses) * 100);

      return {
        usn: usn,
        name: student ? student.name : `Student ${usn.slice(-3)}`,
        percentage: percentage
      };
    });

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get detailed attendance timeline (dates) for a specific student and subject
 * @route   GET /api/attendance/student/:usn/:subject_id
 * @access  Public (for now)
 */
const getSubjectDetail = async (req, res) => {
  const { usn, subject_id } = req.params;
  // subject_id might be "23CS4PCDST" or just "dst"
  const collectionName = subject_id.slice(-3).toLowerCase();

  try {
    const Attendance = getAttendanceModel(collectionName);
    const records = await Attendance.find({});
    
    const history = [];
    records.forEach(doc => {
      const status = doc.get(usn);
      if (status !== undefined && status !== null && doc.date) {
        history.push({
          id: doc._id?.toString() || Math.random().toString(),
          date: doc.date,
          isPresent: status === "Present"
        });
      }
    });

    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStudentAttendance,
  getClassAttendance,
  getSubjectDetail,
};
