const mongoose = require("mongoose");

const scheduleMail = new mongoose.Schema(
  {
    toMail: {
      type: String,
    },
    ccMail: {
      type: Array,
    },
    note: {
      type: String,
    },
    eventType: {
      type: String,
      enum: ["Birthday", "Anniversary"],
      default: "Birthday",
    },
    name: {
      type: String,
    },
    scheduleTime: {
      type: String,
    },
    scheduleDate: {
      type: String,
    },
    isMailSent: {
      type: Boolean,
      default: false,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ScheduleMail", scheduleMail);
