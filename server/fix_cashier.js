const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const fixCashier = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const cashier = await User.findOne({ email: 'cashier@store.com' });
    if (cashier) {
      cashier.password = 'cashier123'; // pre-save hook will hash this
      await cashier.save();
      console.log('✅ Fixed cashier password');
    } else {
      console.log('Cashier not found');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixCashier();
