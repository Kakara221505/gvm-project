const mongoose = require('mongoose');

const orderItemDetailSchema = new mongoose.Schema({
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    variation_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Variation'
    },
    seller_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller'
    },
    quantity: {
        type: Number
    },
    price: {
        type: Number
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('OrderItemDetail', orderItemDetailSchema);