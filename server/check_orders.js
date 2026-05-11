const mongoose = require('mongoose');
const Order = require('./models/Order');
require('dotenv').config();

async function check() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI not found in environment');
    process.exit(1);
  }
  
  await mongoose.connect(process.env.MONGO_URI);

  console.log('Connected to MongoDB');

  const badOrders = await Order.find({ 
    isPaid: true, 
    $or: [
      { paidAt: { $exists: false } },
      { paidAt: null }
    ]
  });
  
  console.log('Orders with isPaid:true but missing paidAt:', badOrders.length);
  
  for (const o of badOrders) {
    console.log('Order ID:', o._id, 'Created At:', o.createdAt);
    // Fix it by setting paidAt to createdAt as a fallback
    o.paidAt = o.createdAt;
    await o.save();
    console.log('Fixed Order:', o._id);
  }
  
  console.log('Check complete.');
  process.exit(0);
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
