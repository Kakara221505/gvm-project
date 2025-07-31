const mongoose = require('mongoose');
const { Schema } = mongoose;

const productMediaSchema = new Schema({
  ProductID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',  // assuming you have a Product model, this is optional
    required: false,
  },
  VariationID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Variation',
  },
  Media_url: {
    type: String,
    maxlength: 255,
    required: true,
  },
  Media_type: {
    type: String,
    enum: ['image', 'video'],
    required: true,
  },
  Is_main_media: {
    type: Boolean,
    default: false,
  },
  Created_at: {
    type: Date,
    default: Date.now,
    required: true,
  },
  
  Updated_at: {
    type: Date,
    default: Date.now,
    required: true,
  },
 
}, {
  timestamps: false, // MongoDB will not automatically add createdAt and updatedAt fields
  collection: 'ProductMedia',
});

// Create the model based on the schema
const ProductMedia = mongoose.model('ProductMedia', productMediaSchema);

module.exports = ProductMedia;
