const QRKey = require('../db/models/QRKey');

exports.updateQRToken = async (req, res) => {
  try {
    const { token } = req.body;
    
    // Update by key_id explicitly, not by _id
    const update = { $set: { timestamp: token } };
    const options = { upsert: false };
    
    const [result1, result2] = await Promise.all([
      QRKey.updateOne({ key_id: 1 }, update, options),
      QRKey.updateOne({ key_id: 2 }, update, options)
    ]);
    
    console.log("QR update result 1:", result1);
    console.log("QR update result 2:", result2);
    
    if (result1.matchedCount === 0 || result2.matchedCount === 0) {
      return res.status(404).json({ 
        message: "QR key documents not found. Run fixQRKeys.js first." 
      });
    }
    
    return res.status(200).json({ message: "QR keys updated", token });
  } catch (err) {
    console.error("updateQRToken error:", err);
    return res.status(500).json({ message: "Failed to update QR keys" });
  }
};

exports.clearQRToken = async (req, res) => {
  try {
    const update = { $set: { timestamp: null } };
    const options = { upsert: false };
    
    const [result1, result2] = await Promise.all([
      QRKey.updateOne({ key_id: 1 }, update, options),
      QRKey.updateOne({ key_id: 2 }, update, options)
    ]);
    
    if (result1.matchedCount === 0 || result2.matchedCount === 0) {
      return res.status(404).json({ 
        message: "QR key documents not found. Run fixQRKeys.js first." 
      });
    }
    
    return res.status(200).json({ message: "QR keys cleared" });
  } catch (err) {
    console.error("clearQRToken error:", err);
    return res.status(500).json({ message: "Failed to clear QR keys" });
  }
};

exports.getQRToken = async (req, res) => {
  try {
    const keys = await QRKey.find();
    const key1 = keys.find(k => k.key_id === 1);
    const key2 = keys.find(k => k.key_id === 2);
    
    res.status(200).json({
      key1: key1 ? { key_id: key1.key_id, timestamp: key1.timestamp } : null,
      key2: key2 ? { key_id: key2.key_id, timestamp: key2.timestamp } : null
    });
  } catch (error) {
    console.error('Error fetching QR token:', error);
    res.status(500).json({ message: 'Failed to get QR keys' });
  }
};

exports.updateQRKey1 = async (req, res) => {
  try {
    const { token } = req.body;
    const update = { $set: { timestamp: token } };
    const options = { upsert: false };
    await QRKey.updateOne({ key_id: 1 }, update, options);
    return res.status(200).json({ message: "Key 1 updated", token });
  } catch (err) {
    console.error("updateQRKey1 error:", err);
    return res.status(500).json({ message: "Failed to update Key 1" });
  }
};

exports.updateQRKey2 = async (req, res) => {
  try {
    const { token } = req.body;
    const update = { $set: { timestamp: token } };
    const options = { upsert: false };
    await QRKey.updateOne({ key_id: 2 }, update, options);
    return res.status(200).json({ message: "Key 2 updated", token });
  } catch (err) {
    console.error("updateQRKey2 error:", err);
    return res.status(500).json({ message: "Failed to update Key 2" });
  }
};

exports.clearQRKey1 = async (req, res) => {
  try {
    const update = { $set: { timestamp: null } };
    const options = { upsert: false };
    await QRKey.updateOne({ key_id: 1 }, update, options);
    return res.status(200).json({ message: "Key 1 cleared" });
  } catch (err) {
    console.error("clearQRKey1 error:", err);
    return res.status(500).json({ message: "Failed to clear Key 1" });
  }
};

exports.clearQRKey2 = async (req, res) => {
  try {
    const update = { $set: { timestamp: null } };
    const options = { upsert: false };
    await QRKey.updateOne({ key_id: 2 }, update, options);
    return res.status(200).json({ message: "Key 2 cleared" });
  } catch (err) {
    console.error("clearQRKey2 error:", err);
    return res.status(500).json({ message: "Failed to clear Key 2" });
  }
};
