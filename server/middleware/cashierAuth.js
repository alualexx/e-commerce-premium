const cashierAuth = (req, res, next) => {
  if (req.user && (req.user.role === 'cashier' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Cashier only.' });
  }
};

module.exports = cashierAuth;
