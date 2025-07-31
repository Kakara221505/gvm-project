const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the Rating schema
const ratingSchema = new Schema({
  UserID: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  Rated_item_id: {
    type: Schema.Types.ObjectId,
    required: true
  },
  Rated_item_type: {
    type: String,
    enum: ['product', 'delivery_person', 'order', 'vendor'],
    required: true
  },
  Rating: {
    type: String,
    enum: ['1','1.5', '2','2.5', '3','3.5', '4','4.5', '5'],
    required: true
  },
  Name: {
    type: String,
  },
  Title: {
    type: String,
  },
  IsAnonymous: {
    type: Boolean,
    default: false
  },
  Review: {
    type: String,
    required: false
  },
  Created_at: {
    type: Date,
    default: Date.now,
    required: true
  },
  Updated_at: {
    type: Date,
    default: Date.now,
    required: true
  }
}, {
  timestamps: false 
});

// Define the model
const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;
