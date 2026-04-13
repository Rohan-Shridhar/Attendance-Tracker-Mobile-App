const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./connection');
const QRKey = require('./models/QRKey');

const fixQRKeys = async () => {
  try {
    await connectDB();
    
    await QRKey.updateOne(
      { _id: "69d9f74935a373c872049077" },
      { $set: { key_id: 1, timestamp: null } }
    );
    console.log("QR Key 1 updated");
    
    await QRKey.updateOne(
      { _id: "69d9f74935a373c872049078" },
      { $set: { key_id: 2, timestamp: null } }
    );
    console.log("QR Key 2 updated");
    
  } catch (error) {
    console.error('Error fixing QR keys:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

fixQRKeys();
