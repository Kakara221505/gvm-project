const mongoose = require("mongoose");

const UserMediaSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
    mediaUrl: {
      type: String,
      // required: true,
    },
    mediaType: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
    isMainMedia: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now, // Automatically set creation date
    },
    updatedAt: {
      type: Date,
      default: Date.now, // Automatically set updated date
    },
  },
  {
    collection: "UserMedia", 
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }, 
  }
);

const UserMedia = mongoose.model("UserMedia", UserMediaSchema);

module.exports = UserMedia;
