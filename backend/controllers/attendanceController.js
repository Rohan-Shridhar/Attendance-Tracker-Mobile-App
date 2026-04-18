const { getAttendanceModel } = require('../db/models/Attendance');
const Student = require('../db/models/Student');
const QRKey = require('../db/models/QRKey');

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

/**
 * Helper to parse various date strings into a JS Date object
 * Supported: "DD-MM-YYYY", "YYYY-MM-DD", "Day, DD Mon YYYY"
 */
const parseDateString = (dateStr) => {
  if (!dateStr) return new Date(0);
  
  // Handle DD-MM-YYYY
  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts[0].length === 2) { // DD-MM-YYYY
      const [d, m, y] = parts;
      return new Date(y, m - 1, d);
    }
  }
  
  // Default JS parsing (handles YYYY-MM-DD and human readable formats)
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date(0) : d;
};

/**
 * @desc    Mark attendance for a student
 * @route   POST /api/attendance/mark
 * @access  Public (for now)
 */
const markAttendance = async (req, res) => {
  const { token } = req.body;
  console.log("Token received:", token);

  try {
    // STEP 1 — Parse the token
    const parts = token.split("_");
    if (parts.length < 3) {
      return res.status(400).json({ message: "Invalid token format" });
    }

    const timestampBlock = parts[0];
    const subjectId = parts[1];
    const usn = parts[2].toUpperCase();

    // STEP 2 — Get collection name from subjectId
    const collectionName = subjectId.slice(-3).toLowerCase();
    
    // format is HHMMSS + YYYYMMDD
    const datePart = timestampBlock.slice(6); // "20260418"
    const day = datePart.slice(6);           // "18"
    const month = datePart.slice(4, 6);       // "04"
    const year = datePart.slice(0, 4);        // "2026"
    const date = `${day}-${month}-${year}`;   // "18-04-2026"

    console.log(`Parsed: date=${date} subject=${collectionName} usn=${usn}`);

    // STEP 4 — Validate token against qr_keys
    const [qrKey1, qrKey2] = await Promise.all([
      QRKey.findOne({ key_id: 1 }),
      QRKey.findOne({ key_id: 2 })
    ]);

    console.log("QR Key 1 timestamp:", qrKey1?.timestamp);
    console.log("QR Key 2 timestamp:", qrKey2?.timestamp);

    let isValid = false;
    let validKeyId = null;

    if (qrKey1?.timestamp && qrKey1.timestamp.split("_")[0] === timestampBlock) {
      isValid = true;
      validKeyId = 1;
    } else if (qrKey2?.timestamp && qrKey2.timestamp.split("_")[0] === timestampBlock) {
      isValid = true;
      validKeyId = 2;
    }

    if (!isValid) {
      console.log("Validation: FAILED");
      return res.status(401).json({ message: "Invalid or expired QR code" });
    }

    console.log(`Validation: PASSED via key ${validKeyId}`);

    // STEP 5 — Mark attendance in the correct collection
    const AttendanceModel = getAttendanceModel(collectionName);
    const existing = await AttendanceModel.findOne({ date: date });

    if (existing) {
      await AttendanceModel.updateOne(
        { date: date },
        { $set: { [usn]: "Present" } }
      );
      console.log(`Attendance written to collection: ${collectionName} (Updated)`);
      return res.status(200).json({ message: "Attendance updated to Present", date, usn });
    } else {
      const newDoc = {
        date: date,
        "1WN24CS001": null,
        "1WN24CS002": null,
        "1WN24CS003": null,
        "1WN24CS004": null,
        "1WN24CS005": null
      };
      newDoc[usn] = "Present";
      await AttendanceModel.create(newDoc);
      console.log(`Attendance written to collection: ${collectionName} (Created)`);
      return res.status(201).json({ message: "Attendance marked Present", date, usn });
    }

  } catch (error) {
    console.error("markAttendance error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get detailed attendance for a student and subject
 * @route   GET /api/attendance/student/:usn/subject/:collectionName
 * @access  Public (for now)
 */
const getStudentSubjectDetail = async (req, res) => {
  const { usn, collectionName } = req.params;

  try {
    const AttendanceModel = getAttendanceModel(collectionName);
    const records = await AttendanceModel.find({});
    
    const history = [];
    records.forEach(doc => {
      const status = doc.get(usn);
      if (status !== undefined && status !== null) {
        history.push({
          id: doc._id?.toString() || Math.random().toString(),
          date: doc.date,
          status: status
        });
      }
    });

    // Sort by date descending
    history.sort((a, b) => parseDateString(b.date).getTime() - parseDateString(a.date).getTime());

    res.status(200).json(history);
  } catch (error) {
    console.error("getStudentSubjectDetail error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get preview of attendance counts for today
 * @route   GET /api/attendance/preview/:subject_id/:date
 * @access  Public (for now)
 */
const getAttendancePreview = async (req, res) => {
  const { subject_id, date } = req.params;
  const collectionName = subject_id.slice(-3).toLowerCase();

  const allUSNs = [
    "1WN24CS001", "1WN24CS002", "1WN24CS003", "1WN24CS004", "1WN24CS005"
  ];

  try {
    const AttendanceModel = getAttendanceModel(collectionName);
    const doc = await AttendanceModel.findOne({ date: date });

    if (!doc) {
      return res.status(200).json({ presentCount: 0, absentCount: 5 });
    }

    let presentCount = 0;
    allUSNs.forEach(usn => {
      if (doc.get(usn) === "Present") {
        presentCount++;
      }
    });

    res.status(200).json({ 
      presentCount, 
      absentCount: 5 - presentCount 
    });
  } catch (error) {
    console.error("getAttendancePreview error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Finalize and save attendance (mark missing as Absent)
 * @route   POST /api/attendance/save
 * @access  Public (for now)
 */
const saveAttendance = async (req, res) => {
  const { subject_id, date } = req.body;
  const collectionName = subject_id.slice(-3).toLowerCase();

  const allUSNs = [
    "1WN24CS001", "1WN24CS002", "1WN24CS003", "1WN24CS004", "1WN24CS005"
  ];

  console.log(`Saving attendance for collection: ${collectionName} date: ${date}`);

  try {
    const AttendanceModel = getAttendanceModel(collectionName);
    const doc = await AttendanceModel.findOne({ date: date });

    if (doc) {
      const setObj = {};
      let absentCount = 0;
      allUSNs.forEach(usn => {
        if (doc.get(usn) !== "Present") {
          setObj[usn] = "Absent";
          absentCount++;
        }
      });

      await AttendanceModel.updateOne({ date: date }, { $set: setObj });
      
      const presentCount = 5 - absentCount;
      console.log(`Present: ${presentCount} Absent: ${absentCount}`);
      
      res.status(200).json({ 
        message: "Attendance saved", 
        absentCount, 
        presentCount 
      });
    } else {
      const newDoc = { date: date };
      allUSNs.forEach(usn => {
        newDoc[usn] = "Absent";
      });

      await AttendanceModel.create(newDoc);
      console.log(`Present: 0 Absent: 5`);
      
      res.status(201).json({ 
        message: "Attendance saved", 
        absentCount: 5, 
        presentCount: 0 
      });
    }
  } catch (error) {
    console.error("saveAttendance error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get count of students who have scanned today
 * @route   GET /api/attendance/scanned-count/:subject_id/:date
 * @access  Public (for now)
 */
const getScannedCount = async (req, res) => {
  const { subject_id, date } = req.params;
  const collectionName = subject_id.slice(-3).toLowerCase();

  const allUSNs = [
    "1WN24CS001", "1WN24CS002", "1WN24CS003", "1WN24CS004", "1WN24CS005"
  ];

  try {
    const AttendanceModel = getAttendanceModel(collectionName);
    const doc = await AttendanceModel.findOne({ date: date });

    if (!doc) {
      return res.status(200).json({ count: 0 });
    }

    let count = 0;
    allUSNs.forEach(usn => {
      if (doc.get(usn) === "Present") {
        count++;
      }
    });

    res.status(200).json({ count });
  } catch (error) {
    console.error("getScannedCount error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStudentAttendance,
  getClassAttendance,
  getSubjectDetail,
  markAttendance,
  getStudentSubjectDetail,
  getAttendancePreview,
  saveAttendance,
  getScannedCount,
};
