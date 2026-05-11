const Order = require('../models/Order');

// @desc    Initiate payment
// @route   POST /api/payments/initiate
const initiatePayment = async (req, res, next) => {
  try {
    const { orderId, paymentMethod, phoneNumber, amount } = req.body;

    if (!orderId || !paymentMethod || !phoneNumber || !amount) {
      res.status(400);
      throw new Error('Missing required payment fields');
    }

    // Verify order exists
    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Simulate payment initiation
    const paymentProviders = {
      telebirr: { name: 'Telebirr', prefix: 'TLB', processingTime: '2-3 minutes' },
      cbe_birr: { name: 'CBE Birr', prefix: 'CBE', processingTime: '1-2 minutes' },
      amole: { name: 'Amole', prefix: 'AML', processingTime: '1-2 minutes' }
    };

    const provider = paymentProviders[paymentMethod];
    if (!provider) {
      res.status(400);
      throw new Error('Invalid payment method');
    }

    // Generate mock transaction ID
    const transactionId = `${provider.prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Update order with transaction details (pending)
    order.paymentResult = {
      transactionId,
      status: 'pending',
      phoneNumber
    };
    await order.save();

    res.json({
      transactionId,
      provider: provider.name,
      phoneNumber,
      amount,
      message: `Payment request sent to your ${provider.name} app. Please confirm on your phone.`,
      status: 'pending'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify payment status (mock)
// @route   GET /api/payments/verify/:transactionId
const verifyPayment = async (req, res, next) => {
  try {
    const { transactionId } = req.params;

    // Find order with this transaction ID
    const order = await Order.findOne({ 'paymentResult.transactionId': transactionId });

    if (!order) {
      res.status(404);
      throw new Error('Transaction record not found');
    }

    // Mock: Simulating logic that would normally check with the provider API
    // Always returns success in this demo
    order.isPaid = true;
    order.paidAt = Date.now();
    order.status = 'confirmed';
    order.paymentResult.status = 'completed';
    order.paymentResult.paidAt = Date.now();

    await order.save();

    res.json({
      transactionId,
      status: 'completed',
      message: 'Payment verified successfully and order updated',
      orderId: order._id
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get available payment methods
// @route   GET /api/payments/methods
const getPaymentMethods = async (req, res, next) => {
  try {
    const methods = [
      {
        id: 'telebirr',
        name: 'Telebirr',
        description: 'Instant mobile money payment via Telebirr',
        icon: '📱',
        color: '#0066CC',
        available: true
      },
      {
        id: 'cbe_birr',
        name: 'CBE Birr',
        description: 'Secure payment via Commercial Bank of Ethiopia',
        icon: '🏦',
        color: '#006B3F',
        available: true
      },
      {
        id: 'amole',
        name: 'Amole',
        description: 'Digital wallet payment via Dashen Bank',
        icon: '💳',
        color: '#FF6B00',
        available: true
      },
      {
        id: 'cash_on_delivery',
        name: 'COD',
        description: 'Settlement upon physical delivery (Addis Only)',
        icon: '💵',
        color: '#28A745',
        available: true
      }
    ];

    res.json(methods);
  } catch (error) {
    next(error);
  }
};

module.exports = { initiatePayment, verifyPayment, getPaymentMethods };

