const mongoose = require('mongoose');

const QRKeySchema = new mongoose.Schema({
  key_id: Number,
  timestamp: { type: String, default: null }
}, { 
  strict: false,
  collection: 'qr_keys' 
});

module.exports = mongoose.model('QRKey', QRKeySchema);
