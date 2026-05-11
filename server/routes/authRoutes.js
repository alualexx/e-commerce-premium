const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, updateAddress, toggleWishlist } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/address', protect, updateAddress);
router.put('/wishlist/:productId', protect, toggleWishlist);

module.exports = router;
