const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema(
  {
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    latestMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", ChatSchema);
