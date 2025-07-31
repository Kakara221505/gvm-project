const mongoose = require('mongoose');

const VariationSchema = new mongoose.Schema({
  ProductID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  Type: {
    type: String,
    maxlength: 20,
    required: true
  },
  Value: {
    type: String,
    maxlength: 255,
    required: true
  },
  Created_at: {
    type: Date,
    default: Date.now
  },

  Updated_at: {
    type: Date,
    default: Date.now
  },

}, {
  collection: 'Variation',
  timestamps: { createdAt: 'Created_at', updatedAt: 'Updated_at' }
});

module.exports = mongoose.model('Variation', VariationSchema);
