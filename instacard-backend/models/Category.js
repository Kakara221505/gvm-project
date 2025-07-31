const mongoose = require('mongoose');

// Define the schema for Category
const categorySchema = new mongoose.Schema({
  Name: {
    type: String,
    maxlength: 100
  },
  Description: {
    type: String,
    maxlength: 1000
  },
  Image_url: {
    type: String,
    maxlength: 255
  },
  Created_at: {
    type: Date,
    default: Date.now
  },
  Updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'Category',
  timestamps: false // Disable automatic `createdAt` and `updatedAt` fields
});

// Create the Category model from the schema
const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
