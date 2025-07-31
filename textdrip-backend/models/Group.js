const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema(
  {
    groupName: { type: String, required: true },
    description: { type: String },
    latestMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    adminId: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
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
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
    groupCreatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Group", GroupSchema);
