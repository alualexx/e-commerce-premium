const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const createCashier = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if cashier exists
    const existingCashier = await User.findOne({ email: 'cashier@store.com' });
    if (existingCashier) {
      console.log('Cashier already exists: cashier@store.com / cashier123');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('cashier123', salt);

    const cashier = await User.create({
      name: 'Cashier User',
      email: 'cashier@store.com',
      password: hashedPassword,
      role: 'cashier'
    });

    console.log('✅ Created cashier user');
    console.log('Email: cashier@store.com');
    console.log('Password: cashier123');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createCashier();
