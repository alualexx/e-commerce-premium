// Middleware to verify user has delivery or management role
const deliveryAuth = (req, res, next) => {
  const allowedRoles = ['delivery', 'admin', 'store'];
  if (req.user && allowedRoles.includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Delivery personnel only.' });
  }
};

module.exports = deliveryAuth;
