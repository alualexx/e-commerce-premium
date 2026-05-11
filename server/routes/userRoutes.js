const express = require('express');
const router = express.Router();
const { getUsers, getUserById, updateUser, deleteUser, getUserStats } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/stats/summary', protect, admin, getUserStats);
router.get('/', protect, admin, getUsers);
router.get('/:id', protect, admin, getUserById);
router.put('/:id', protect, admin, updateUser);
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;
