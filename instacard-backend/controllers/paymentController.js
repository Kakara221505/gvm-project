const Payment = require('../models/Payment'); 
const Order = require('../models/Order');
const messages = require('../utils/messages');

async function payment(req, res, next) {
    try {
        const { orderId, sellerId, paymentMethod, amount, paymentStatus, transactionId } = req.body;

        // Validate if the order exists
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: messages.error.NOT_FOUND});
        }

        // Create a new payment record  
        const newPayment = new Payment({
            orderId,
            userId: req.user.id, // Get user ID from authentication token
            sellerId,
            paymentMethod,
            amount,
            paymentStatus,
            transactionId
        });

        await newPayment.save();

        res.status(201).json({
            message: messages.success.PAYMENT_CREATED,
            payment: newPayment
        });

    } catch (error) {
        next(error);
    }
}

module.exports = { payment };
