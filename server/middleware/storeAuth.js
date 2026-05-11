const storeAuth = (req, res, next) => {
  if (req.user && (req.user.role === 'store_keeper' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Store Keeper only.' });
  }
};

module.exports = storeAuth;
