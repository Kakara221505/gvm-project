const { Schema, model } = require("mongoose");

const ConversationSchema = new Schema(
  {
    secretKey: {
      select: false,
      type: String,
    },
    AESKeyOfUser: {
      type: Map,
      of: String,
      maxlength: 10000,
    },
    originType: {
      type: String,
      enum: ["chat", "group", "channel"],
      required: true,
    },
  },
  { collection: "Conversation", timestamps: true, versionKey: false }
);

module.exports = model("Conversation", ConversationSchema);
