const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String },
    type: { type: String, enum: ['message', 'group', 'channel'], required: true },
    timestamp: { type: Date, default: Date.now },
    seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    channelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel' },
    sentTime: { type: Date },
    sentTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model("Notification", NotificationSchema);
