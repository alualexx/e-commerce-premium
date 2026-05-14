const User = require('../models/User');

// @desc    Get all users (Admin)
// @route   GET /api/users
const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter)
    ]);

    res.json({ users, page, pages: Math.ceil(total / limit), total });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID (Admin)
// @route   GET /api/users/:id
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role (Admin)
// @route   PUT /api/users/:id
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.role = req.body.role || user.role;
    user.isActive = req.body.isActive !== undefined ? req.body.isActive : user.isActive;

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (Admin)
// @route   DELETE /api/users/:id
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (user.role === 'admin') {
      res.status(400);
      throw new Error('Cannot delete admin user');
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user stats (Admin)
// @route   GET /api/users/stats/summary
const getUserStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });

    res.json({ totalUsers, totalCustomers, totalAdmins, newUsersThisMonth });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user's location (Delivery)
// @route   PUT /api/users/me/location
const updateMyLocation = async (req, res, next) => {
  try {
    const { lat, lng } = req.body;
    if (lat === undefined || lng === undefined) {
      res.status(400);
      throw new Error('Latitude and Longitude are required');
    }

    const user = await User.findById(req.user._id);
    user.currentLocation = {
      lat,
      lng,
      updatedAt: new Date()
    };

    await user.save();
    res.json({ message: 'Location updated' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all delivery locations (Admin)
// @route   GET /api/users/delivery/locations
const getDeliveryLocations = async (req, res, next) => {
  try {
    const Order = require('../models/Order');

    const deliveryPersonnel = await User.find({ 
      role: 'delivery',
      'currentLocation.updatedAt': { $exists: true }
    }).select('name email phone currentLocation');

    // Attach active order info for each person
    const enriched = await Promise.all(
      deliveryPersonnel.map(async (person) => {
        const activeOrders = await Order.find({
          deliveryPerson: person._id,
          status: { $in: ['shipped', 'out_for_delivery', 'processing', 'confirmed'] }
        })
        .select('trackingNumber status items shippingAddress totalPrice paymentMethod createdAt')
        .populate('user', 'name email phone');

        const completedCount = await Order.countDocuments({
          deliveryPerson: person._id,
          status: 'delivered'
        });

        return {
          ...person.toObject(),
          activeOrdersCount: activeOrders.length,
          activeOrders: activeOrders, // Full list of active orders
          completedOrders: completedCount
        };
      })
    );

    res.json(enriched);
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  getUsers, 
  getUserById, 
  updateUser, 
  deleteUser, 
  getUserStats,
  updateMyLocation,
  getDeliveryLocations
};
