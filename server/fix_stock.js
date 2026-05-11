// Quick fix: restore stock for all products
const mongoose = require('mongoose');

async function fixStock() {
  await mongoose.connect('mongodb://localhost:27017/ecommerce');
  console.log('Connected to MongoDB');

  const result = await mongoose.connection.collection('products').updateMany(
    { stock: { $lte: 0 } },
    { $set: { stock: 50 } }
  );
  console.log(`Updated ${result.modifiedCount} products with stock=0 → stock=50`);

  // Also update all to have reasonable stock
  const result2 = await mongoose.connection.collection('products').updateMany(
    {},
    { $set: { status: 'published' } }
  );
  console.log(`Published ${result2.modifiedCount} products`);

  const products = await mongoose.connection.collection('products').find({}, { projection: { name: 1, stock: 1, status: 1 } }).toArray();
  console.log('\nAll products after fix:');
  products.forEach(p => console.log(`  - ${p.name}: stock=${p.stock}, status=${p.status}`));

  await mongoose.disconnect();
  console.log('\nDone!');
}

fixStock().catch(console.error);
