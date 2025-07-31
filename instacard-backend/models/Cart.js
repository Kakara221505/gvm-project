const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    seller_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller'
    },
    variation_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Variation'
    },
    quantity: {
        type: Number,
        min: 1
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Cart', CartSchema);
