const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./connection');
const QRKey = require('./models/QRKey');

const seedQRKeys = async () => {
  try {
    await connectDB();
    const count = await QRKey.countDocuments();
    
    if (count === 0) {
      await QRKey.insertMany([
        { key_id: 1, timestamp: null },
        { key_id: 2, timestamp: null }
      ]);
      console.log('Successfully seeded 2 QR keys.');
    } else {
      console.log('Collection qr_keys is not empty. Seed skipped.');
    }
  } catch (error) {
    console.error('Error seeding QR keys:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

seedQRKeys();
