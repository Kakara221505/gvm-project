const { default: mongoose } = require("mongoose");
const Message = require("../models/Message");

function categorizeFile(file) {
  if (!file || !file.mimetype) return "document";

  const type = file.mimetype;

  if (type.startsWith("image/")) return "image";
  if (type.startsWith("video/")) return "video";
  if (type.startsWith("audio/")) return "audio";

  return "document";
}

async function seenSingleMessage(messageId, userIds, io) {
  try {
    const message = await Message.findOne({
      _id: messageId,
      isSeen: false,
    });

    if (message.recievedBy.length == message.seenBy.length) return;

    // Filter userIds to only include those who are in recievedBy
    const validUserIds = userIds.filter((userId) =>
      message.recievedBy.some((id) => id.toString() === userId.toString())
    );

    message.seenBy = [
      ...new Set([
        ...message.seenBy.map((ele) => ele.toString()),
        ...validUserIds,
      ]),
    ];

    await message.save();

    const messagesToUpdate = await Message.find({
      conversationId: message.conversationId,
      isSeen: false,
      $expr: {
        $and: [
          {
            $eq: [{ $size: "$recievedBy" }, { $size: "$seenBy" }],
          },
          {
            $gt: [{ $size: "$recievedBy" }, 1],
          },
        ],
      },
    }).select("_id");

    const messageIds = messagesToUpdate.map((msg) => msg._id);
    if (messageIds.length > 0) {
      await Message.updateMany(
        { _id: { $in: messageIds } },
        { $set: { isSeen: true } }
      );
      const event = `CONVERSATION__${message.conversationId.toString()}`;
      io.to(event).emit("seen-message", { messages: messageIds });
    }
  } catch (err) {
    console.log("Err making msg seen...", err);
  }
}

module.exports = { categorizeFile, seenSingleMessage };
