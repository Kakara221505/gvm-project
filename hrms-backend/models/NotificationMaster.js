const mongoose = require("mongoose");

const GlobalNotificationSchema = new mongoose.Schema(
  {
    title: String,
    message: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",  // this id i am taking for annivery and birthday notification so i can skip those notification for particular users
    },
    date: {
      type: Date,
      default: Date.now,
    },
    type: {
      type: String,
      enum: ["global", "birthday", "workAnniversary"],
      default: "global",
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
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
  { collection: "GlobalNotification", timestamps: false }
);

module.exports = mongoose.model("GlobalNotification", GlobalNotificationSchema);
