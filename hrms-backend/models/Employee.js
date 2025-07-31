const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
  First_name: {
    type: String,
    maxlength: 255,
    required: true,
  },
  Last_name: {
    type: String,
    maxlength: 255,
  },
  Email: {
    type: String,
    maxlength: 128,
    required: true,
  },
  Alternate_Email: {
    type: String,
    maxlength: 128,
    default: null,
  },
  Phone: {
    type: String,
    maxlength: 20,
  },
  Alternate_Phone: {
    type: String,
    maxlength: 20,
    default: null,
  },
  Date_of_birth: {
    type: Date,
  },
  Date_of_join: {
    type: Date,
  },
  Designation: {
    type: String,
    maxlength: 255,
  },
  Report_To: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee', 
},
  Branch: {
    type: String,
    maxlength: 255,
  },
  Department: {
    type: String,
    maxlength: 255,
  },
  Experience: {
    type: String,
    maxlength: 255,
  },
  Password: {
    type: String,
    maxlength: 255,
    required: true,
  },
  Skills: {
    type: String,
    maxlength: 255,
  },
  AccessToken: {
    type: String,
    maxlength: 1000,
  },
  Otp: {
    type: String,
    maxlength: 255,
  },
  Otp_expiration_time: {
    type: Date,
  },
  Is_deleted: {
    type: Boolean,
    default: false,
  },
  Image: {
    type: String,
    maxlength: 1000,
  },
  Leave_Balance: {
    type: Number,
    default: 0,
  },
  Role: {
    type: Number,
    enum: [0, 1],
    default: 1,
  },
  notifications: [
    {
      title: String,
      message: String,
      read: {
        type: Boolean,
        default: false,
      },
      date: {
        type: Date,
        default: Date.now,
      },
      type: {
        type: String,
        enum: ["user", "admin", "pm"],
        default: "user",
      },
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
      },
    },
  ],
  Created_at: {
    type: Date,
    default: Date.now,
  },
  Updated_at: {
    type: Date,
    default: Date.now,
  },
});
// // Add a compound index on Email and Is_deleted
// EmployeeSchema.index({ Email: 1, Is_deleted: 1 }, { unique: true });

module.exports = mongoose.model("Employee", EmployeeSchema);
