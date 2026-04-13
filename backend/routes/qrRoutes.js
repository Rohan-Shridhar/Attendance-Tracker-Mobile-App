const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qrController');

router.post('/update', qrController.updateQRToken);
router.post('/clear', qrController.clearQRToken);
router.get('/current', qrController.getQRToken);

router.post('/update-key1', qrController.updateQRKey1);
router.post('/update-key2', qrController.updateQRKey2);
router.post('/clear-key1', qrController.clearQRKey1);
router.post('/clear-key2', qrController.clearQRKey2);

module.exports = router;
