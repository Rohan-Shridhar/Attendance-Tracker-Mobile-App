const mongoose = require('mongoose');
const connectDB = require('./connection');
const { getAttendanceModel } = require('./models/Attendance');

const allUSNs = [
  "1WN24CS001",
  "1WN24CS002", 
  "1WN24CS003",
  "1WN24CS004",
  "1WN24CS005"
];

const collections = ["dst", "dbm", "oop", "ops", "cns"];

const dates = [
  "06-04-2026",
  "07-04-2026",
  "08-04-2026",
  "09-04-2026",
  "10-04-2026",
  "13-04-2026",
  "14-04-2026",
  "15-04-2026",
  "16-04-2026",
  "17-04-2026"
];

/**
 * Attendance pattern per USN
 */
const getStatus = (usn, date) => {
  if (usn === "1WN24CS001") return "Present";
  
  if (usn === "1WN24CS002") {
    if (date === "08-04-2026" || date === "14-04-2026") return "Absent";
    return "Present";
  }
  
  if (usn === "1WN24CS003") {
    if (["07-04-2026", "09-04-2026", "15-04-2026", "17-04-2026"].includes(date)) return "Absent";
    return "Present";
  }
  
  if (usn === "1WN24CS004") {
    if (["06-04-2026", "10-04-2026", "13-04-2026"].includes(date)) return "Absent";
    return "Present";
  }
  
  if (usn === "1WN24CS005") {
    if (["07-04-2026", "08-04-2026", "14-04-2026", "15-04-2026", "16-04-2026"].includes(date)) return "Absent";
    return "Present";
  }
  
  return "Absent";
};

async function seed() {
  try {
    await connectDB();
    console.log('Connected to MongoDB for seeding.');

    let insertedTotal = 0;
    let skippedTotal = 0;

    for (const collName of collections) {
      const AttendanceModel = getAttendanceModel(collName);
      
      for (const date of dates) {
        const existing = await AttendanceModel.findOne({ date: date });
        
        if (existing) {
          console.log(`Skipped ${collName} ${date} (exists)`);
          skippedTotal++;
          continue;
        }

        const doc = { date: date };
        allUSNs.forEach(usn => {
          doc[usn] = getStatus(usn, date);
        });

        await AttendanceModel.create(doc);
        console.log(`Inserted ${collName} ${date}`);
        insertedTotal++;
      }
    }

    console.log(`\nSeeding complete. ${insertedTotal} documents inserted, ${skippedTotal} skipped.`);
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
