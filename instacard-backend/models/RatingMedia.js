const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the RatingMedia schema
const ratingMediaSchema = new Schema({
  RatingID: {
    type: Schema.Types.ObjectId, 
    ref: 'Rating',
    required: true
  },
  Media_url: {
    type: String,
    maxlength: 255,
    required: true
  },
  Media_type: {
    type: String,
    enum: ['image', 'video'],
    required: true
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
  },
 
}, {
  timestamps: false // To match the 'timestamps: false' from Sequelize
});

// Define the model
const RatingMedia = mongoose.model('RatingMedia', ratingMediaSchema);

module.exports = RatingMedia;
