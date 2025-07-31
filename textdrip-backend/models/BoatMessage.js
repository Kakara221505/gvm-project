const mongoose = require("mongoose");

const BotMessageSchema = new mongoose.Schema({
    sentBy: { type: String, enum: ['USER', 'BOT'], required: true },
    content: { type: String, required: true },
    messageType: { type: String },
    mediaId: { type: mongoose.Schema.Types.ObjectId, ref: 'MessageMedia' },
    timestamp: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
},{ timestamps: true });


module.exports = mongoose.model("BoatMessage", BotMessageSchema);
