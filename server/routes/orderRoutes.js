const express = require('express');
const router = express.Router();
const {
  createOrder, getMyOrders, getOrderById,
  getAllOrders, updateOrderStatus, getAnalytics,
  getFinancialReport, getTopProducts, getRevenueChart,
  confirmPayment, getOrderByTracking, getDeliveryOrders,
  completeDelivery, submitFeedback, getDeliveryPersonnel,
  createPOSOrder
} = require('../controllers/orderController');
const { protect, optionalAuth } = require('../middleware/auth');
const admin = require('../middleware/admin');
const deliveryAuth = require('../middleware/deliveryAuth');
const storeAuth = require('../middleware/storeAuth');
const cashierAuth = require('../middleware/cashierAuth');

// Public
router.post('/', optionalAuth, createOrder);

// POS Route (Cashier/Admin)
router.post('/pos', protect, cashierAuth, createPOSOrder);

router.get('/track/:trackingNumber', getOrderByTracking);

// Auth required
router.get('/mine', protect, getMyOrders);
router.put('/:id/pay', optionalAuth, confirmPayment);
router.post('/:id/feedback', optionalAuth, submitFeedback);

// Delivery personnel
router.get('/delivery/mine', protect, deliveryAuth, getDeliveryOrders);
router.put('/delivery/complete', protect, deliveryAuth, completeDelivery);

// Admin & Cashier — Analytics & Finance Reports
router.get('/analytics/summary', protect, cashierAuth, getAnalytics);
router.get('/reports/financial', protect, cashierAuth, getFinancialReport);
router.get('/reports/top-products', protect, cashierAuth, getTopProducts);
router.get('/reports/revenue-chart', protect, cashierAuth, getRevenueChart);
// Store Keeper & Admin — Manage Orders & Assignment
router.get('/store/orders', protect, storeAuth, getAllOrders);
router.get('/delivery/personnel', protect, storeAuth, getDeliveryPersonnel);
router.put('/:id/status', protect, storeAuth, updateOrderStatus);
router.get('/', protect, admin, getAllOrders);
router.get('/:id', protect, getOrderById);

module.exports = router;
