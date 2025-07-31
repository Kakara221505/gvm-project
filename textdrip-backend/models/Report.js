const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    channelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel' },
    description: { type: String }
});

module.exports = mongoose.model('Report', ReportSchema);
