const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define SubCategory schema
const subCategorySchema = new Schema({
  CategoryID: {
    type: Schema.Types.ObjectId,  // Mongoose uses ObjectId for referencing other collections
    ref: 'Category', // Assuming you have a 'Category' model, you can reference it
    required: true,
  },
  SubCategoryName: {
    type: String,
    required: false,  // optional
  },
  SubCategoryImageUrl: {
    type: String,
    maxlength: 255,
    required: false, // optional
  },
  Created_at: {
    type: Date,
    default: Date.now,  // Default to current timestamp
  },
  Updated_at: {
    type: Date,
    default: null, // Set default as null
  }
}, {
  timestamps: false,  // Disable automatic createdAt and updatedAt fields
  versionKey: false,  // Disable __v version key field
});

// Create and export the SubCategory model
const SubCategory = mongoose.model('SubCategory', subCategorySchema);

module.exports = SubCategory;
