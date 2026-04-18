const Notification = require('../db/models/Notification');
const Teacher = require('../db/models/Teacher');
const { getAttendanceModel } = require('../db/models/Attendance');

/**
 * @desc    Get all notifications for a student
 * @route   GET /api/notifications/:usn
 * @access  Public (for now)
 */
const getNotifications = async (req, res) => {
  const { usn } = req.params;

  try {
    const notifications = await Notification.find({ usn })
      .sort({ created_at: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    console.error("getNotifications error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Mark a specific notification as read
 * @route   POST /api/notifications/mark-read/:id
 * @access  Public (for now)
 */
const markAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    await Notification.findByIdAndUpdate(id, { is_read: true });
    res.status(200).json({ message: "Marked as read" });
  } catch (error) {
    console.error("markAsRead error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Mark all notifications for a student as read
 * @route   POST /api/notifications/mark-all-read/:usn
 * @access  Public (for now)
 */
const markAllRead = async (req, res) => {
  const { usn } = req.params;

  try {
    const result = await Notification.updateMany(
      { usn, is_read: false },
      { is_read: true }
    );

    res.status(200).json({ 
      message: "All marked as read", 
      count: result.modifiedCount 
    });
  } catch (error) {
    console.error("markAllRead error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Calculate class attendance and send alerts to students below 75%
 * @route   POST /api/notifications/send-alerts
 * @access  Public (for now)
 */
const sendLowAttendanceAlerts = async (req, res) => {
  const { subject_id } = req.body;
  const collectionName = subject_id.slice(-3).toLowerCase();
  
  const usns = [
    "1WN24CS001", "1WN24CS002", "1WN24CS003", "1WN24CS004", "1WN24CS005"
  ];

  try {
    // 1. Get Subject Name
    const teacher = await Teacher.findOne({ subject_id });
    const subjectName = teacher ? teacher.subject : "Subject";

    // 2. Fetch all records
    const AttendanceModel = getAttendanceModel(collectionName);
    const records = await AttendanceModel.find({});

    const todayObj = new Date();
    const todayStr = 
      String(todayObj.getDate()).padStart(2, '0') + "-" +
      String(todayObj.getMonth() + 1).padStart(2, '0') + "-" +
      todayObj.getFullYear();

    let alertsSent = 0;
    let alreadySentToday = 0;

    // 3. Process each student
    for (const usn of usns) {
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

      // 4. Check Threshold (75%)
      if (percentage < 75) {
        // Check for duplicates today
        const existing = await Notification.findOne({
          usn,
          type: "low_attendance_alert",
          subject_id,
          date: todayStr
        });

        if (existing) {
          alreadySentToday++;
          continue;
        }

        // Create notification
        await Notification.create({
          usn,
          type: "low_attendance_alert",
          subject: subjectName,
          subject_id,
          date: todayStr,
          attendance_percentage: percentage,
          message: `Alert: Your attendance in ${subjectName} is ${percentage}%. Minimum required is 75%.`,
          is_read: false,
          created_at: new Date()
        });

        alertsSent++;
      }
    }

    res.status(200).json({
      message: "Alerts processed",
      alertsSent,
      alreadySentToday
    });

  } catch (error) {
    console.error("sendLowAttendanceAlerts error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllRead,
  sendLowAttendanceAlerts
};
