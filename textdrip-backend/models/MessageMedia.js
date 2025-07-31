const mongoose = require("mongoose");

const MediaSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fileType: {
    type: String,
    enum: ["image", "video", "document", "audio"],
    required: true,
  },
  fileUrl: { type: String, required: true },
  fileSize: { type: String },
  uploadTimestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Media", MediaSchema);
