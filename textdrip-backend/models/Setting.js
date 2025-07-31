const mongoose = require("mongoose");

const SettingsSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    channelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel' },
    muteNotification: { type: Boolean, default: false },
    // muteUntil: { type: Date },
    background: { type: String },
    chatColor: { type: String }
});

module.exports = mongoose.model('Settings', SettingsSchema);
