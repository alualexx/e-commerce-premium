const mongoose = require('mongoose');
const Order = require('./models/Order');
require('dotenv').config();

async function testAggregations() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const startDate = '2026-05-01';
  const endDate = '2026-05-11';
  const filter = { 
    isPaid: true,
    paidAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  };

  try {
    console.log('Testing getFinancialReport aggregation...');
    const dailyStats = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$paidAt" } },
          revenue: { $sum: "$totalPrice" },
          tax: { $sum: "$taxPrice" },
          shipping: { $sum: "$shippingPrice" },
          itemsCost: { $sum: "$itemsPrice" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    console.log('dailyStats length:', dailyStats.length);
  } catch (err) {
    console.error('Error in dailyStats aggregation:', err);
  }

  try {
    console.log('Testing getTopProducts aggregation...');
    const topProducts = await Order.aggregate([
      { $match: filter },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ]);
    console.log('topProducts length:', topProducts.length);
  } catch (err) {
    console.error('Error in topProducts aggregation:', err);
  }

  try {
    console.log('Testing getRevenueChart aggregation...');
    const data = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: '$paidAt' } },
          revenue: { $sum: '$totalPrice' },
          netSales: { $sum: '$itemsPrice' },
          tax: { $sum: '$taxPrice' },
          shipping: { $sum: '$shippingPrice' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    console.log('revenueChart length:', data.length);
  } catch (err) {
    console.error('Error in revenueChart aggregation:', err);
  }

  process.exit(0);
}

testAggregations().catch(err => {
  console.error(err);
  process.exit(1);
});
