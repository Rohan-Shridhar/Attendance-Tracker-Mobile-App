const mongoose = require('../node_modules/mongoose');
require('../node_modules/dotenv').config({ path: '../.env' });
const { getAttendanceModel } = require('../db/models/Attendance');

const usns = [
  "1WN24CS001", 
  "1WN24CS002", 
  "1WN24CS003", 
  "1WN24CS004", 
  "1WN24CS005"
];

const subjects = ['dst', 'dbm', 'oop', 'ops', 'cns'];

const dates = [
  'Wed, 01 Apr 2026',
  'Thu, 02 Apr 2026',
  'Fri, 03 Apr 2026',
  'Sat, 04 Apr 2026',
  'Sun, 05 Apr 2026'
];

async function seed() {
  try {
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.DB_NAME || 'college';
    await mongoose.connect(uri, { dbName: dbName });
    console.log('Connected to MongoDB.');

    for (const sub of subjects) {
      const AttendanceDoc = getAttendanceModel(sub);
      
      // Clear existing records
      await AttendanceDoc.deleteMany({});
      console.log(`Cleared existing records for collection: ${sub}`);

      const docsToInsert = [];

      for (const dateStr of dates) {
        const doc = { date: dateStr };
        // Randomly assign Present / Absent to each USN
        for (const usn of usns) {
          // 80% chance of being Present
          const isPresent = Math.random() < 0.8;
          doc[usn] = isPresent ? 'Present' : 'Absent';
        }
        docsToInsert.push(doc);
      }

      await AttendanceDoc.insertMany(docsToInsert);
      console.log(`Inserted 5 days of attendance for collection: ${sub}`);
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

seed();
