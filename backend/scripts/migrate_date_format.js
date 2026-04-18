const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const subjects = ['dst', 'dbm', 'oop', 'ops', 'cns'];

/**
 * Convert various formats to DD-MM-YYYY
 */
const convertToNewFormat = (oldDate) => {
  if (!oldDate || typeof oldDate !== 'string') return oldDate;

  // Already DD-MM-YYYY (e.g. "18-04-2026")
  if (oldDate.includes('-')) {
    const parts = oldDate.split('-');
    if (parts[0].length === 2 && parts[1]?.length === 2 && parts[2]?.length === 4) {
      return oldDate;
    }
    
    // YYYY-MM-DD
    if (parts[0].length === 4) {
      const [y, m, d] = parts;
      return `${d}-${m}-${y}`;
    }
  }

  // English format: "Sat, 04 Apr 2026"
  const d = new Date(oldDate);
  if (!isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  return oldDate;
};

async function migrate() {
  try {
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.DB_NAME || 'college';
    
    console.log(`Connecting to: ${uri}, DB: ${dbName}`);
    await mongoose.connect(uri, { dbName: dbName });
    console.log('Connected to MongoDB.');

    for (const sub of subjects) {
      console.log(`\nMigrating collection: ${sub}...`);
      const collection = mongoose.connection.collection(sub);
      const cursor = collection.find({});

      let count = 0;
      let documents = await cursor.toArray();
      
      for (const doc of documents) {
        const newDate = convertToNewFormat(doc.date);
        
        if (newDate !== doc.date) {
          await collection.updateOne(
            { _id: doc._id },
            { $set: { date: newDate } }
          );
          count++;
        }
      }
      console.log(`Updated ${count} documents in ${sub}.`);
    }

    console.log('\nMigration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
