const mongoose = require("mongoose");

const UserMediaSchema = new mongoose.Schema(
  {
    UserID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
    Media_url: {
      type: String,
      required: true,
    },
    Media_type: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
    Is_main_media: {
      type: Boolean,
      default: false,
    },
    Created_at: {
      type: Date,
      default: Date.now, // Automatically set creation date
    },
    Updated_at: {
      type: Date,
      default: Date.now, // Automatically set updated date
    },
  },
  {
    collection: "UserMedia", 
    timestamps: { createdAt: "Created_at", updatedAt: "Updated_at" }, 
  }
);

const UserMedia = mongoose.model("UserMedia", UserMediaSchema);

module.exports = UserMedia;
