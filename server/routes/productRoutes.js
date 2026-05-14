const express = require('express');
const router = express.Router();
const {
  getProducts, getProduct, getProductById, getFeaturedProducts,
  getCategories, createProduct, updateProduct, deleteProduct, createReview
} = require('../controllers/productController');
const { protect, optionalAuth } = require('../middleware/auth');
const admin = require('../middleware/admin');
const storeAuth = require('../middleware/storeAuth');
const { getInventoryStats, updateStock, createProductForReview } = require('../controllers/productController');

router.get('/featured/list', getFeaturedProducts);
router.get('/categories/list', getCategories);
router.get('/', optionalAuth, getProducts);
router.get('/:slug', getProduct);
router.get('/id/:id', getProductById);
router.post('/:id/reviews', protect, createReview);

// Admin
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

// Store Keeper / Admin Inventory Management
router.get('/inventory/stats', protect, storeAuth, getInventoryStats);
router.put('/:id/stock', protect, storeAuth, updateStock);
router.post('/review', protect, storeAuth, createProductForReview);

module.exports = router;
