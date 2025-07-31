const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CouponSchema = new Schema({
    code: {
        type: String,
        unique: true,
        trim: true
    },
    status: {
        type: String,
        enum: ["active", "expired", "disabled"],
        default: "active"
    },
    title: {
        type: String,

      },
      description: {
        type: String
      },
    // usedCount: {
    //     type: Number,
    //     default: 0
    // },
    discountAmount: {
        type: Number,
        min: 0
    },
    saveAmount: {
        type: Number,
        min: 0
    },
    expiresAt: {
        type: Date
    }
    // productId: [{
    //     type: Schema.Types.ObjectId,
    //     ref: 'Product'
    // }]
});

module.exports = mongoose.model('Coupon', CouponSchema);