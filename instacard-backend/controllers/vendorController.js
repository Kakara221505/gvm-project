const Product = require('../models/Product');
const Order = require('../models/Order');
const moment = require('moment');
async function getVendorDashboard  (req, res,next)  {
  try {
    const vendorId = req.params.vendorId;

    // Total Products
    const totalProducts = await Product.countDocuments({ seller_id: vendorId });

    // Total Orders
    const totalOrders = await Order.countDocuments({ sellerId: vendorId });

    // Completed Orders to calculate earnings
    const completedOrders = await Order.find({
      sellerId: vendorId,
      Payment_status: 'Completed'
    });

    const totalEarnings = completedOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    // Total Returns
    const totalReturns = await Order.countDocuments({
      sellerId: vendorId,
      Delivery_status: 'Cancelled'
    });

    // Recent Orders (latest 5)
    const recentOrders = await Order.find({ sellerId: vendorId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderId totalAmount createdAt Delivery_status Payment_status'); // select fields to send

    res.status(200).json({
      totalProducts,
      totalOrders,
      totalEarnings: totalEarnings.toFixed(2),
      totalReturns,
      recentOrders
    });

  }  catch (error) {
    next(error);
  }
};
async function getVendorRevenue (req, res,next)  {
  try {
    const { vendorId } = req.params;
    const { range } = req.query;

    let startDate;
    const today = moment().endOf('day');

    switch (range) {
      case 'month':
        startDate = moment().subtract(1, 'months').startOf('day');
        break;
      case '3months':
        startDate = moment().subtract(3, 'months').startOf('day');
        break;
      case '6months':
        startDate = moment().subtract(6, 'months').startOf('day');
        break;
      case 'year':
        startDate = moment().subtract(1, 'years').startOf('day');
        break;
      default:
        startDate = moment().subtract(1, 'months').startOf('day'); // default to month
    }

    // Filter orders in date range
    const orders = await Order.find({
      sellerId: vendorId,
      createdAt: { $gte: startDate.toDate(), $lte: today.toDate() }
    });

    const completedOrders = orders.filter(o => o.Payment_status === 'Completed');
    const refundOrders = orders.filter(o => o.Delivery_status === 'Cancelled');

    const totalEarnings = completedOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalOrders = completedOrders.length;
    const totalRefunds = refundOrders.length;

    // Conversion rate (dummy example - replace with real visitor count)
    const visitors = 1000; // e.g., from Google Analytics API
    const conversionRate = visitors ? ((totalOrders / visitors) * 100).toFixed(2) : 0;

    // Group by month or day (for chart)
    const groupFormat = ['month', '3months', '6months', 'year'].includes(range) ? 'YYYY-MM' : 'YYYY-MM-DD';

    const chartMap = {};

    completedOrders.forEach(order => {
      const key = moment(order.createdAt).format(groupFormat);
      if (!chartMap[key]) chartMap[key] = 0;
      chartMap[key] += order.totalAmount || 0;
    });

    const chart = Object.entries(chartMap).map(([x, y]) => ({ x, y }));

    res.status(200).json({
      totalEarnings: totalEarnings.toFixed(2),
      totalOrders,
      totalRefunds,
      conversionRate,
      chart
    });

  }  catch (error) {
    next(error);
  }
};
module.exports = {
    getVendorDashboard,
    getVendorRevenue
};