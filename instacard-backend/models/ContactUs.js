const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the schema for the ContactUs model
const contactUsSchema = new Schema(
  {
    Name: {
      type: String,
      maxlength: 100,
      required: true
    },
    Email: {
      type: String,
      maxlength: 100,
      required: true,
      match: [/\S+@\S+\.\S+/, 'Please enter a valid email address'] // Basic email validation regex
    },
    Subject: {
      type: String,
      maxlength: 255,
      required: true
    },
    Message: {
      type: String,
      required: true
    },
    Phone: {
      type: String,
      maxlength: 20
    },
    Created_at: {
      type: Date,
      default: Date.now
    },
    Updated_at: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false,
    versionKey: false
  }
);

// Create the model
const ContactUs = mongoose.model('ContactUs', contactUsSchema);

module.exports = ContactUs;
