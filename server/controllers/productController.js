const Product = require('../models/Product');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get all products with filtering, sorting, pagination
// @route   GET /api/products
const getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { status: 'published' }; // Default only published

    // If admin/store_keeper, allow seeing all statuses via query
    if (req.user && (req.user.role === 'admin' || req.user.role === 'store_keeper')) {
      if (req.query.status) {
        filter.status = req.query.status;
      } else {
        delete filter.status; // Staff sees everything by default
      }
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }

    if (req.query.rating) {
      filter.rating = { $gte: Number(req.query.rating) };
    }

    if (req.query.inStock === 'true') {
      filter.stock = { $gt: 0 };
    }

    if (req.query.featured === 'true') {
      filter.featured = true;
    }

    if (req.query.brand) {
      filter.brand = req.query.brand;
    }

    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { brand: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Build sort
    let sort = {};
    switch (req.query.sort) {
      case 'price_asc':
        sort = { price: 1 }; break;
      case 'price_desc':
        sort = { price: -1 }; break;
      case 'rating':
        sort = { rating: -1 }; break;
      case 'newest':
        sort = { createdAt: -1 }; break;
      case 'name_asc':
        sort = { name: 1 }; break;
      case 'name_desc':
        sort = { name: -1 }; break;
      default:
        sort = { createdAt: -1 };
    }

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limit),
      Product.countDocuments(filter)
    ]);

    res.json({
      products,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by slug
// @route   GET /api/products/:slug
const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    const reviews = await Review.find({ product: product._id })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ ...product.toJSON(), reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product by ID
// @route   GET /api/products/id/:id
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured/list
const getFeaturedProducts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const products = await Product.find({ featured: true }).limit(limit);
    res.json(products);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all categories
// @route   GET /api/products/categories/list
const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

// @desc    Create product (Admin)
// @route   POST /api/products
const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Update product (Admin)
// @route   PUT /api/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product (Admin)
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Delete associated reviews
    await Review.deleteMany({ product: req.params.id });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product review
// @route   POST /api/products/:id/reviews
const createReview = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    const existingReview = await Review.findOne({
      user: req.user._id,
      product: req.params.id
    });

    if (existingReview) {
      res.status(400);
      throw new Error('You have already reviewed this product');
    }

    const review = await Review.create({
      user: req.user._id,
      product: req.params.id,
      rating: req.body.rating,
      title: req.body.title,
      comment: req.body.comment
    });

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name avatar');

    res.status(201).json(populatedReview);
  } catch (error) {
    next(error);
  }
};

// @desc    Get inventory stats (Store Keeper/Admin)
// @route   GET /api/products/inventory/stats
const getInventoryStats = async (req, res, next) => {
  try {
    const [totalProducts, outOfStock, lowStock] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ stock: 0 }),
      Product.countDocuments({ stock: { $gt: 0, $lte: 10 } })
    ]);

    const categories = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.json({
      totalProducts,
      outOfStock,
      lowStock,
      categories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product stock (Store Keeper/Admin)
// @route   PUT /api/products/:id/stock
const updateStock = async (req, res, next) => {
  try {
    const { stock } = req.body;
    
    if (stock === undefined || stock < 0) {
      res.status(400);
      throw new Error('Valid stock quantity is required');
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stock },
      { new: true, runValidators: true }
    );

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Submit product for review (Store Keeper)
// @route   POST /api/products/review
const createProductForReview = async (req, res, next) => {
  try {
    const { name, category, stock, supplier, images, brand } = req.body;

    const product = await Product.create({
      name,
      category,
      stock,
      supplier,
      images,
      brand,
      status: 'pending_review',
      addedBy: req.user._id
    });

    // Notify all admins
    const admins = await User.find({ role: 'admin' });
    const notifications = admins.map(admin => ({
      recipient: admin._id,
      sender: req.user._id,
      type: 'product_review',
      title: 'New Product for Review',
      message: `Store Keeper ${req.user.name} added "${name}" for review.`,
      relatedId: product._id,
      link: `/admin/products?status=pending_review`
    }));

    await Notification.insertMany(notifications);

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProduct,
  getProductById,
  getFeaturedProducts,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  createReview,
  getInventoryStats,
  updateStock,
  createProductForReview
};
