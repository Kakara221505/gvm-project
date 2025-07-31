const Order = require("../models/Order");
const messages = require("../utils/messages");
const User = require("../models/User");
const OrderItemDetail = require("../models/OrderItemDetail");
async function placeOrder(req, res, next) {
    try {
        const userId = req.user.id; // Extract user ID from token

        const { 
            productId, 
            sellerId, 
            email, 
            billingAddress, 
            shippingAddress, 
            subtotalAmount = 0, 
            shippingCharges = 0, 
            discountAmount = 0, 
            totalAmount = 0,
            variationId, // Get variationId from request
            quantity, 
            price 
        } = req.body;

        // Create the order
        const newOrder = await Order.create({
            userId,
            productId,
            sellerId,
            email,
            billingAddress,
            shippingAddress,
            subtotalAmount,
            shippingCharges,
            discountAmount,
            totalAmount
        });

        // Create order item detail entry
        const newOrderItemDetail = await OrderItemDetail.create({
            order_id: newOrder._id,  // Link to the created order
            variation_id: variationId,
            seller_id: sellerId,
            quantity,
            price
        });

        res.status(200).json({
            status: messages.success.STATUS,
            message: messages.success.ORDER_PLACED,
            order: newOrder,
            orderItemDetail: newOrderItemDetail
        });

    } catch (error) {
        next(error);
    }
}



async function getMyOrders(req, res, next) {
    try {
        const userId = req.user.id;

        // Fetch and sort orders by createdAt (newest first)
        const orders = await Order.find({ userId })
            .sort({ createdAt: -1 }); 

        res.status(200).json({
            status: messages.success.STATUS,
            message: messages.success.ORDER_FETCHED,
            data: orders
        });
    } catch (error) {
        next(error);
    }
}



async function cancelOrder(req, res, next) {
    try {
        const userId = req.user.id;
        const { id } = req.params;

       // Find the order
       const order = await Order.findOne({ _id: id, userId });

       if (!order) {
           return res.status(404).json({ status: messages.error.STATUS, message: "Order not found" });
       }

       // Soft delete: update isCancelled flag and timestamp
       order.isCancelled = true;
       order.canceledAt = new Date();
       await order.save();

       res.status(200).json({
           status: messages.success.STATUS,
           message: messages.success.ORDER_CANCELED,
           data: order
       });

   } catch (error) {
       next(error);
   }
}

async function trackOrder(req, res, next) {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const order = await Order.findOne({ _id: id, userId });

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({
            message: messages.success.ORDER_FETCHED,
            deliveryStatus: order.deliveryStatus,
            paymentStatus: order.paymentStatus
        });
    } catch (error) {
        next(error);
    }
}
//not using this function
async function updateShippingAddress(req, res, next) {
    try {
        const userId = req.user.id;
        const { orderId } = req.params;
        const { newAddress } = req.body;

        const order = await Order.findOne({ _id: orderId, userId });

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.deliveryStatus !== "Pending") {
            return res.status(400).json({ message: "Cannot update address after shipping" });
        }

        order.shippingAddress = newAddress;
        await order.save();

        res.status(200).json({status: messages.success.STATUS, message: messages.success.SHIPPING_ADDRESS_UPDATED,data:order });
    } catch (error) {
        next(error);
    }
}

async function getCancelledOrders(req, res, next) {
    try {
        const userId = req.user.id; // Get user ID from token
        const { page = 1, limit = 10 } = req.query; // Default pagination

        // Fetch canceled orders with pagination
        const cancelledOrders = await Order.find({ userId, isCancelled: true })
            .sort({ canceledAt: -1 }) // Sort by latest cancellations
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.status(200).json({
            status: messages.success.STATUS,
            message: messages.success.CANCELLED_ORDERS,
            data: cancelledOrders
        });

    } catch (error) {
        next(error);
    }
}
const getOrdersBySellerId = async (req, res, next) => {
    try {
      const sellerId = req.params.id;
      const { search = '', page = 1, limit = 10 } = req.query;
  
      if (!sellerId) {
        return res.status(400).json({ message: 'Seller ID is required' });
      }
  
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const query = { sellerId };
  
      // Optional search
      if (search) {
        query.$or = [
          { orderId: { $regex: search, $options: 'i' } },
        ];
      }
  
      // First, find matching user IDs by name (if search is name-based)
      let userIds = [];
      if (search) {
        const users = await User.find({ name: { $regex: search, $options: 'i' } }, '_id');
        userIds = users.map(u => u._id);
        if (userIds.length > 0) {
          query.$or.push({ userId: { $in: userIds } });
        }
      }
  
      const [orders, total] = await Promise.all([
        Order.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .populate('userId', 'Name Email') // populate user name
          .populate('productId', 'Name Model_number') // product name & model
          .populate('billingAddress')
          .populate('shippingAddress'),
        Order.countDocuments(query)
      ]);
  
      res.status(200).json({
        status: true,
        data: orders,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        }
      });
    } catch (err) {
      console.error(err);
      next(err);
    }
  };

module.exports = { 
    placeOrder,
    getMyOrders,
    cancelOrder,
    trackOrder,
    updateShippingAddress,
    getCancelledOrders,
    getOrdersBySellerId
}