const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register user
// @route   POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists with this email');
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token: generateToken(user._id)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token: generateToken(user._id)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.avatar = req.body.avatar || user.avatar;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      token: generateToken(updatedUser._id)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add/remove address
// @route   PUT /api/auth/address
const updateAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (req.body.action === 'add') {
      if (req.body.address.isDefault) {
        user.addresses.forEach(addr => addr.isDefault = false);
      }
      user.addresses.push(req.body.address);
    } else if (req.body.action === 'remove') {
      user.addresses = user.addresses.filter(
        addr => addr._id.toString() !== req.body.addressId
      );
    } else if (req.body.action === 'update') {
      const idx = user.addresses.findIndex(
        addr => addr._id.toString() === req.body.address._id
      );
      if (idx !== -1) {
        if (req.body.address.isDefault) {
          user.addresses.forEach(addr => addr.isDefault = false);
        }
        user.addresses[idx] = { ...user.addresses[idx].toObject(), ...req.body.address };
      }
    }

    await user.save();
    res.json(user.addresses);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle wishlist item
// @route   PUT /api/auth/wishlist/:productId
const toggleWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const productId = req.params.productId;

    const index = user.wishlist.indexOf(productId);
    if (index > -1) {
      user.wishlist.splice(index, 1);
    } else {
      user.wishlist.push(productId);
    }

    await user.save();
    res.json(user.wishlist);
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updateProfile, updateAddress, toggleWishlist };
