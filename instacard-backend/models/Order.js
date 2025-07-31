const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller'
    },
    orderId: {
        type: String,
        unique: true
    },
    invoiceNumber: {
        type: String,
        unique: true
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    email: {
        type: String
    },
    billingAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address'
    },
    shippingAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address'
    },
    isDelivered: {
        type: Boolean,
        default: false
    },
    subtotalAmount: {
        type: Number
    },
    shippingCharges: {
        type: Number
    },
    discountAmount: {
        type: Number
    },
    totalAmount: {
        type: Number
    },
    deliveryStatus: {
        type: String
    },
    paymentStatus: {
        type: String
    },
    deliveredAt: {
        type: Date
    },
    Delivery_status: {
        type: String,
        enum: ['Pending', 'Out for delivery', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    Payment_status: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending'
    },
    deliveryPersonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DeliveryPerson'
    },
    isCancelled: {
        type: Boolean,
        default: false
    },
    canceledAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Helper to generate a 6-digit random number as a string
function generate6DigitId() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  
  // Generate unique orderId and invoiceNumber
  orderSchema.pre('save', async function (next) {
    if (!this.invoiceNumber) {
      this.invoiceNumber = 'INV-' + Date.now();
    }
  
    if (!this.orderId) {
      let unique = false;
      while (!unique) {
        const randomId = generate6DigitId();
        const existingOrder = await mongoose.models.Order.findOne({ orderId: randomId });
        if (!existingOrder) {
          this.orderId = randomId;
          unique = true;
        }
      }
    }
  
    next();
  });
  
  module.exports = mongoose.model('Order', orderSchema);
  
