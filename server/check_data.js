const mongoose = require('mongoose');
const Order = require('./models/Order');
require('dotenv').config();

async function checkData() {
  await mongoose.connect(process.env.MONGO_URI);
  const orders = await Order.find({ isPaid: true }).limit(5);
  console.log('Sample Paid Orders:');
  console.log(JSON.stringify(orders, null, 2));
  process.exit(0);
}

checkData().catch(err => {
  console.error(err);
  process.exit(1);
});
