const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  
   
    {
      UserRoleID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "UserRole", // Reference to UserRole Model
      },
    Email: {
      type: String,
      maxlength: 128,
      unique: true,
    },
    Name: {
      type: String,
      maxlength: 255,
      required: true,
    },
    Password: {
      type: String,
      maxlength: 128,
      // required: true,
    },
    Country_code: {
      type: String,
      maxlength: 10,
    },
    Phone: {
      type: String,
      maxlength: 20,
    },
    Otp: {
      type: Number,
    },
    Is_paid_user: {
      type: Boolean,
      default: false,
    },
    Is_verified: {
      type: Boolean,
      default: false,
    },
    Login_type: {
      type: String,
      maxlength: 50,
    },
    AccessToken: {
      type: String,
      maxlength: 1500,
    },
    DeviceToken: {
      type: String,
      maxlength: 1500,
    },
    Is_deleted: {
      type: Boolean,
      default: false,
    },
    Created_at: {
      type: Date,
      default: Date.now,
    },
    Updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "User" } 
);

// UserSchema.index({ Email: 1 }, { unique: true });

module.exports = mongoose.model("User", UserSchema);
