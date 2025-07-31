const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the schema for the Product model
const productSchema = new Schema({
  UserID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a 'User' model, you can reference it
    required: true,
  },
  Name: {
    type: String,
    maxlength: 100,
    required: true,
  },
  BrandID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand', // Assuming you have a 'Brand' model, you can reference it
    required: true,
  },
  CategoryID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category', // Assuming you have a 'Category' model, you can reference it
    required: true,
  },
  SubCategoryID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubCategory', // Reference to SubCategory model
    required: false,
  },
  Model_number: {
    type: String,
    maxlength: 100,
    required: false, // If optional, set to false
  },
  Model_series: {
    type: String,
    maxlength: 100,
    required: false,
  },
  Description: {
    type: String, // Mongoose doesn't have a `TEXT` type, but String can handle large text fields
    required: false,
  },
  Price: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
  },
  Sale_price: {
    type: mongoose.Schema.Types.Decimal128,
    required: false, // If optional, set to false
  },
  Is_price: {
    type: Boolean,
    required: true,
    default: false,
  },
  Is_price_range: {
    type: Boolean,
    required: true,
    default: false,
  },
  Min_price: {
    type: mongoose.Schema.Types.Decimal128,
    required: false,
  },
  Max_price: {
    type: mongoose.Schema.Types.Decimal128,
    required: false,
  },
  Quantity: {
    type: Number,
    required: true,
    default: 0,
  },
  Status: {
    type: String,
    maxlength: 20,
    required: true,
    default: 'Published',  //ENUM('Published', 'Draft', 'Inactive'),

  },
  Is_available: {
    type: Boolean,
    default: true,
  },
  Is_featured: {
    type: Boolean,
    default: false,
  },
  Is_new_arrival: {
    type: Boolean,
    default: false,
  },
  Is_exclusive: {
    type: Boolean,
    default: false,
  },
  Is_best_seller: {
    type: Boolean,
    default: false,
  },
  Color: {
    type: String,
    maxlength: 50,
    required: false,
  },
  seller_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  Warranty_period: {
    type: Number, 
    required: false,
  },
  Created_at: {
    type: Date,
    default: Date.now, 
  },
  Updated_at: {
    type: Date,
    default: Date.now, 
  },
}, {
  timestamps: false, 
  collection: 'products', 
});

// Create the model based on the schema
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
