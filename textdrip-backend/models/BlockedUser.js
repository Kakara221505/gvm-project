const mongoose = require("mongoose");

const BlockedUserSchema = new mongoose.Schema({
  blockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  blockedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

BlockedUserSchema.index({ blockedBy: 1, blockedTo: 1 });

module.exports = mongoose.model("BlockedUser", BlockedUserSchema);
