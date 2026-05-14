const Order = require('../models/Order');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Create new order
// @route   POST /api/orders
const createOrder = async (req, res, next) => {
  try {
    console.log('=== CREATE ORDER REQUEST ===');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('User:', req.user ? req.user._id : 'guest');

    const {
      items, shippingAddress, paymentMethod,
      guestEmail, guestPhone
    } = req.body;

    if (!items || items.length === 0) {
      res.status(400);
      throw new Error('No order items');
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.city) {
      res.status(400);
      throw new Error('Shipping address is incomplete');
    }

    if (!paymentMethod) {
      res.status(400);
      throw new Error('Payment method is required');
    }

    // Verify products and calculate prices
    let itemsPrice = 0;
    const orderItems = [];

    for (const item of items) {
      console.log('Looking up product:', item.product);
      const product = await Product.findById(item.product);
      if (!product) {
        res.status(404);
        throw new Error(`Product not found: ${item.product}`);
      }
      if (product.stock < item.quantity) {
        res.status(400);
        throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        image: (product.images && product.images[0]) || item.image || '',
        price: product.price,
        quantity: item.quantity
      });

      itemsPrice += product.price * item.quantity;

      // Reduce stock
      product.stock -= item.quantity;
      await product.save();
    }

    const shippingPrice = itemsPrice > 5000 ? 0 : 150; // Free shipping over 5000 ETB
    const taxPrice = Math.round(itemsPrice * 0.15 * 100) / 100; // 15% VAT
    const totalPrice = itemsPrice + shippingPrice + taxPrice;
    
    // Enforce COD limit
    if (paymentMethod === 'cash_on_delivery' && totalPrice > 5000) {
      res.status(400);
      throw new Error('Cash on Delivery is only available for orders below 5,000 ETB');
    }

    // Ensure street field exists (required by model)
    const sanitizedAddress = {
      fullName: shippingAddress.fullName,
      phone: shippingAddress.phone,
      street: shippingAddress.street || shippingAddress.address || 'N/A',
      city: shippingAddress.city,
      state: shippingAddress.state || '',
      country: shippingAddress.country || 'Ethiopia'
    };

    console.log('Creating order with', orderItems.length, 'items, total:', totalPrice);

    const order = await Order.create({
      user: req.user ? req.user._id : null,
      guestEmail: guestEmail || '',
      guestPhone: guestPhone || '',
      items: orderItems,
      shippingAddress: sanitizedAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice
    });

    console.log('Order created successfully:', order._id);

    // Notify all admins about new order
    try {
      const admins = await User.find({ role: 'admin' });
      const notifications = admins.map(admin => ({
        recipient: admin._id,
        sender: req.user ? req.user._id : null,
        type: 'new_order',
        title: 'New Order Placed',
        message: `Order #${order._id.toString().slice(-6).toUpperCase()} for ETB ${totalPrice.toLocaleString()} needs processing.`,

        relatedId: order._id,
        link: `/admin/orders`
      }));
      await Notification.insertMany(notifications);
    } catch (nError) {
      console.error('Failed to send order notification:', nError.message);
    }

    res.status(201).json(order);
  } catch (error) {
    console.error('=== ORDER CREATION ERROR ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    next(error);
  }
};

// @desc    Get logged-in user's orders
// @route   GET /api/orders/mine
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email');

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Check authorization
    if (req.user) {
      if (order.user && order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to view this order');
      }
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
const getAllOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.isPaid === 'true') filter.isPaid = true;
    if (req.query.isPaid === 'false') filter.isPaid = false;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter)
    ]);

    res.json({
      orders,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    const newStatus = req.body.status || order.status;
    const prevStatus = order.status;

    order.status = newStatus;

    // Record status change in history
    if (prevStatus !== newStatus) {
      order.statusHistory.push({
        status: newStatus,
        timestamp: new Date(),
        note: req.body.note || `Status updated to ${newStatus}`,
        updatedBy: req.user._id
      });
    }

    // Assign delivery person if provided
    if (req.body.deliveryPerson) {
      if (req.user.role !== 'store_keeper') {
        res.status(403);
        throw new Error('Only Store Keeper can assign delivery personnel');
      }
      order.deliveryPerson = req.body.deliveryPerson;
    }

    if (req.body.trackingNumber) {
      order.trackingNumber = req.body.trackingNumber;
    }

    if (req.body.isPaid) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        transactionId: req.body.transactionId || `TXN-${Date.now()}`,
        status: 'completed',
        paidAt: Date.now(),
        phoneNumber: req.body.phoneNumber || ''
      };
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
};

// @desc    Get sales analytics (Admin)
// @route   GET /api/orders/analytics/summary
const getAnalytics = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    const recentOrders = await Order.find()
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const monthlySales = await Order.aggregate([
      { $match: { isPaid: true } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalPrice' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    const statusCounts = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Recent feedback
    const recentFeedback = await Order.find({ feedback: { $exists: true, $ne: null } })
      .populate('user', 'name')
      .sort({ 'feedback.createdAt': -1 })
      .limit(10)
      .select('trackingNumber feedback items user createdAt');

    // Delivery stats
    const deliveredToday = await Order.countDocuments({
      status: 'delivered',
      deliveredAt: { $gte: new Date(new Date().setHours(0,0,0,0)) }
    });

    res.json({
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentOrders,
      monthlySales,
      statusCounts,
      recentFeedback,
      deliveredToday
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm payment for an order (digital payments)
// @route   PUT /api/orders/:id/pay
const confirmPayment = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    if (order.isPaid) {
      return res.json({ message: 'Order already paid', order });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    
    // Only advance status to 'confirmed' if it's currently at an earlier stage
    if (['pending', 'processing'].includes(order.status)) {
      order.status = 'confirmed';
    }

    order.paymentResult = {
      transactionId: req.body.transactionId || `TXN-${Date.now()}`,
      status: 'completed',
      paidAt: Date.now(),
      phoneNumber: req.body.phoneNumber || '',
      method: order.paymentMethod
    };

    order.statusHistory.push({
      status: order.status,
      timestamp: new Date(),
      note: `Payment confirmed via ${order.paymentMethod}${req.user ? ` by ${req.user.name}` : ''}`,
      updatedBy: req.user ? req.user._id : null
    });

    const updatedOrder = await order.save();
    console.log('Payment confirmed for order:', updatedOrder._id, 'Status:', updatedOrder.status);

    // Notify all admins about payment
    try {
      const admins = await User.find({ role: 'admin' });
      const notifications = admins.map(admin => ({
        recipient: admin._id,
        sender: req.user ? req.user._id : null,
        type: 'order_status',
        title: 'Payment Received',
        message: `Payment confirmed for Order #${order._id.toString().slice(-6).toUpperCase()}.`,
        relatedId: order._id,
        link: `/admin/orders`
      }));
      await Notification.insertMany(notifications);
    } catch (nError) {
      console.error('Failed to send payment notification:', nError.message);
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error('Payment confirmation error:', error.message);
    next(error);
  }
};

// @desc    Track order by tracking number (Public)
// @route   GET /api/orders/track/:trackingNumber
const getOrderByTracking = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      trackingNumber: req.params.trackingNumber.toUpperCase()
    }).select(
      'trackingNumber status statusHistory items shippingAddress totalPrice ' +
      'paymentMethod isPaid createdAt deliveredAt feedback deliveryPerson'
    ).populate('deliveryPerson', 'name');

    if (!order) {
      res.status(404);
      throw new Error('No order found with that tracking number');
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

// @desc    Get delivery person's assigned orders
// @route   GET /api/orders/delivery/mine
const getDeliveryOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ deliveryPerson: req.user._id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    const stats = {
      total: orders.length,
      pending: orders.filter(o => ['shipped', 'out_for_delivery'].includes(o.status)).length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      todayDelivered: orders.filter(o =>
        o.status === 'delivered' &&
        o.deliveredAt &&
        new Date(o.deliveredAt).toDateString() === new Date().toDateString()
      ).length
    };

    res.json({ orders, stats });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete delivery (Delivery person enters tracking number)
// @route   PUT /api/orders/delivery/complete
const completeDelivery = async (req, res, next) => {
  try {
    const { trackingNumber } = req.body;

    if (!trackingNumber) {
      res.status(400);
      throw new Error('Tracking number is required');
    }

    const order = await Order.findOne({
      trackingNumber: trackingNumber.toUpperCase()
    });

    if (!order) {
      res.status(404);
      throw new Error('No order found with that tracking number');
    }

    if (order.status === 'delivered') {
      res.status(400);
      throw new Error('This order has already been delivered');
    }

    if (order.status === 'cancelled') {
      res.status(400);
      throw new Error('This order has been cancelled');
    }

    // Verify the delivery person is assigned to this order (Admins and Store Keepers can bypass)
    const isManager = ['admin', 'store'].includes(req.user.role);
    if (!isManager && order.deliveryPerson && order.deliveryPerson.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('You are not assigned to this delivery');
    }

    order.status = 'delivered';
    order.deliveredAt = new Date();
    order.deliveryPerson = req.user._id;

    // Mark as paid if cash on delivery
    if (order.paymentMethod === 'cash_on_delivery' && !order.isPaid) {
      order.isPaid = true;
      order.paidAt = new Date();
    }

    order.statusHistory.push({
      status: 'delivered',
      timestamp: new Date(),
      note: `Delivered by ${req.user.name}`,
      updatedBy: req.user._id
    });

    const updatedOrder = await order.save();
    console.log('Order delivered:', updatedOrder.trackingNumber, 'by', req.user.name);
    res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
};

// @desc    Submit feedback for a delivered order
// @route   POST /api/orders/:id/feedback
const submitFeedback = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    if (order.status !== 'delivered') {
      res.status(400);
      throw new Error('Can only leave feedback for delivered orders');
    }

    if (order.feedback && order.feedback.rating) {
      res.status(400);
      throw new Error('Feedback has already been submitted for this order');
    }

    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      res.status(400);
      throw new Error('Rating must be between 1 and 5');
    }

    order.feedback = {
      rating: Number(rating),
      comment: comment || '',
      createdAt: new Date()
    };

    const updatedOrder = await order.save();
    console.log('Feedback submitted for order:', updatedOrder.trackingNumber);
    res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all delivery personnel (Admin)
// @route   GET /api/orders/delivery/personnel
const getDeliveryPersonnel = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const personnel = await User.find({ role: 'delivery' }).select('name email');
    res.json(personnel);
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed financial report (Admin)
// @route   GET /api/orders/reports/financial
const getFinancialReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const filter = { isPaid: true, paidAt: { $type: 'date' } };
    if (startDate && endDate) {
      // Set endDate to the end of the day (23:59:59.999)
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      filter.paidAt = {
        $gte: new Date(startDate),
        $lte: end
      };
    }

    const dailyStats = await Order.aggregate([
      { $match: filter },

      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$paidAt" } },
          revenue: { $sum: "$totalPrice" },
          tax: { $sum: "$taxPrice" },
          shipping: { $sum: "$shippingPrice" },
          itemsCost: { $sum: "$itemsPrice" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Overall summary
    const summary = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
          totalTax: { $sum: "$taxPrice" },
          totalShipping: { $sum: "$shippingPrice" },
          totalItemsCost: { $sum: "$itemsPrice" },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    res.json({
      dailyStats,
      summary: summary[0] || {
        totalRevenue: 0,
        totalTax: 0,
        totalShipping: 0,
        totalItemsCost: 0,
        totalOrders: 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top selling products (Admin)
// @route   GET /api/orders/reports/top-products
const getTopProducts = async (req, res, next) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;

    const matchFilter = { isPaid: true, paidAt: { $type: 'date' } };
    if (startDate && endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      matchFilter.paidAt = { $gte: new Date(startDate), $lte: end };
    }


    const topProducts = await Order.aggregate([
      { $match: matchFilter },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: parseInt(limit) }
    ]);

    // Calculate grand total for % share
    const grandTotal = topProducts.reduce((sum, p) => sum + p.totalRevenue, 0);
    const result = topProducts.map(p => ({
      ...p,
      revenueShare: grandTotal > 0 ? ((p.totalRevenue / grandTotal) * 100).toFixed(1) : '0.0'
    }));

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly/yearly revenue summary for charts (Admin)
// @route   GET /api/orders/reports/revenue-chart
const getRevenueChart = async (req, res, next) => {
  try {
    const { groupBy = 'day', startDate, endDate } = req.query;

    const matchFilter = { isPaid: true, paidAt: { $type: 'date' } };
    if (startDate && endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      matchFilter.paidAt = { $gte: new Date(startDate), $lte: end };
    }


    const dateFormat = groupBy === 'month' ? '%Y-%m' : groupBy === 'year' ? '%Y' : '%Y-%m-%d';

    const data = await Order.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$paidAt' } },
          revenue: { $sum: '$totalPrice' },
          netSales: { $sum: '$itemsPrice' },
          tax: { $sum: '$taxPrice' },
          shipping: { $sum: '$shippingPrice' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(data);
  } catch (error) {
    next(error);
  }
};

// @desc    Create POS order (Cashier/Admin)
// @route   POST /api/orders/pos
const createPOSOrder = async (req, res, next) => {
  try {
    const { items, paymentMethod, customerId, discount = 0 } = req.body;
    
    if (!items || items.length === 0) {
      res.status(400);
      throw new Error('No order items');
    }

    let itemsPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        res.status(404);
        throw new Error(`Product not found: ${item.product}`);
      }
      if (product.stock < item.quantity) {
        res.status(400);
        throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        image: (product.images && product.images[0]) || item.image || '',
        price: product.price,
        quantity: item.quantity
      });

      itemsPrice += product.price * item.quantity;
      product.stock -= item.quantity;
      await product.save();
    }

    // Ensure discount isn't larger than itemsPrice
    const validDiscount = Math.min(Number(discount) || 0, itemsPrice);
    
    // Tax is calculated on the discounted subtotal
    const discountedSubtotal = itemsPrice - validDiscount;
    const taxPrice = Math.round(discountedSubtotal * 0.15 * 100) / 100;
    const totalPrice = discountedSubtotal + taxPrice;

    const order = await Order.create({
      user: customerId || null,
      cashier: req.user ? req.user._id : null,
      items: orderItems,
      shippingAddress: {
        fullName: 'In-Store Purchase',
        phone: 'N/A',
        street: 'Store Location',
        city: 'Store Location',
        country: 'Ethiopia'
      },
      paymentMethod: paymentMethod || 'cash',
      itemsPrice,
      discountPrice: validDiscount,
      shippingPrice: 0,
      taxPrice,
      totalPrice,
      isPaid: true,
      paidAt: Date.now(),
      status: 'delivered',
      deliveredAt: Date.now()
    });

    order.statusHistory.push({
      status: 'delivered',
      timestamp: Date.now(),
      note: 'In-store POS purchase',
      updatedBy: req.user._id
    });
    await order.save();

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getAnalytics,
  getFinancialReport,
  getTopProducts,
  getRevenueChart,
  confirmPayment,
  getOrderByTracking,
  getDeliveryOrders,
  completeDelivery,
  submitFeedback,
  getDeliveryPersonnel,
  createPOSOrder
};

