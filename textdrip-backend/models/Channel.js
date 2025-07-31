const mongoose = require("mongoose");

const ChannelSchema = new mongoose.Schema(
  {
    channelName: { type: String, required: true },
    description: { type: String },
    latestMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    adminId: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    profileUrl: { type: String },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    mediaId: { type: mongoose.Schema.Types.ObjectId, ref: "Media" },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    reportedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    slug: { type: String, unique: true },
    isPublic: { type: Boolean, default: false },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Channel", ChannelSchema);
