const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messageId: {
      type: String,
      required: true,
    },
    seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    recievedBy: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    cipherText: { type: String },
    // content: { type: String },
    messageType: {
      type: String,
      enum: ["MEDIA", "TEXT", "LINK", "LOCATION","CONTACT"],
      required: true,
    },
    mediaId: { type: mongoose.Schema.Types.ObjectId, ref: "Media" },
    isEdited: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    // chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    // groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
    // channelId: { type: mongoose.Schema.Types.ObjectId, ref: "Channel" },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
    iv: {
      type: String,
    },
    originType: {
      type: String,
      enum: ["chat", "group", "channel"],
      required: true,
    },
    sentTime: { type: Date, default: Date.now },
    isScheduled: { type: Boolean, default: false },
    isSeen: { type: Boolean, default: false },
    isSent: { type: Boolean, default: true },
    isEdited: { type: Boolean, default: false },
    sharedContact: {
      name: String,
      phone: String,
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      avtarImage: String,
      userImage: String
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);
