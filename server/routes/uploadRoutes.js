const express = require('express');
const router = express.Router();
const { uploadArray, processMultipleImages } = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/auth');
const admin = require('../middleware/admin');

// @desc    Premium Batch Image Upload
// @route   POST /api/upload
router.post('/', protect, admin, uploadArray, processMultipleImages, (req, res) => {
  if (!req.body.images || req.body.images.length === 0) {
    return res.status(400).json({ message: 'SECURITY PROTOCOL: NO VALID IMAGE ASSETS DETECTED' });
  }

  res.json({ 
    success: true,
    message: 'ASSETS OPTIMIZED AND PERSISTED',
    images: req.body.images 
  });
});

module.exports = router;
