const mongoose = require('mongoose');
const Order = require('./server/models/Order');
require('dotenv').config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const badOrders = await Order.find({ isPaid: true, paidAt: { $exists: false } });
  console.log('Orders with isPaid:true but missing paidAt:', badOrders.length);
  for (const o of badOrders) {
    console.log('Order ID:', o._id, 'Created At:', o.createdAt);
    // Fix it by setting paidAt to createdAt as a fallback
    o.paidAt = o.createdAt;
    await o.save();
    console.log('Fixed Order:', o._id);
  }
  process.exit(0);
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
