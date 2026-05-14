const express = require('express');
const router = express.Router();
const { 
  getUsers, 
  getUserById, 
  updateUser, 
  deleteUser, 
  getUserStats,
  updateMyLocation,
  getDeliveryLocations
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const admin = require('../middleware/admin');
const cashierAuth = require('../middleware/cashierAuth');

router.get('/stats/summary', protect, cashierAuth, getUserStats);
router.get('/delivery/locations', protect, admin, getDeliveryLocations);
router.put('/me/location', protect, updateMyLocation);
router.get('/', protect, cashierAuth, getUsers);
router.get('/:id', protect, admin, getUserById);
router.put('/:id', protect, admin, updateUser);
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;
