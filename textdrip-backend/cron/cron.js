const Channel = require("../models/Channel");
const Conversation = require("../models/Conversation");
const Chat = require("../models/Chat");
const Group = require("../models/Group");
const Message = require("../models/Message");
const cron = require("node-cron");
const { getIO, emitRefreshEvent } = require("../socket/socket");
const { sendNotification } = require("../utils/notification");
const BlockedUser = require("../models/BlockedUser");

function startCron() {
  cron.schedule("* * * * *", async () => {
    const now = new Date();

    const startOfMinute = new Date(now);
    startOfMinute.setSeconds(0, 0);

    const endOfMinute = new Date(now);
    endOfMinute.setSeconds(59, 999);

    try {
      const messages = await Message.find({
        sentTime: {
          $gte: startOfMinute,
          $lte: endOfMinute,
        },
        isScheduled: true,
      })
        .populate("conversationId")
        .populate("mediaId")
        .populate({
          path: "senderId",
          select: "userName name",
          populate: [
            { path: "mediaId", select: "mediaUrl" },
            { path: "avtarId", select: "avtarImage" },
          ],
        });

      console.log(`Found ${messages.length} messages for this minute`);

      const io = getIO();

      messages.forEach(async (message) => {
        try {
          if (message.isSent) return;
          let msg = message.toObject();
          if (!msg?.senderId) return;
          msg.mediaUrl = msg?.mediaId
            ? `${process.env.BASE_URL}${msg?.mediaId?.fileUrl}`
            : null;
          msg.senderId.userImage = msg?.senderId?.mediaId
            ? `${process.env.BASE_URL}${msg?.senderId?.mediaId?.mediaUrl}`
            : null;
          msg.senderId.avtarImage = msg?.senderId?.avtarId
            ? `${process.env.BASE_URL}${msg?.senderId?.avtarId?.avtarImage}`
            : null;
          msg.conversationId = msg.conversationId._id;

          io.to(`CONVERSATION__${message.conversationId._id}`).emit(
            "message-sent",
            { message: msg }
          );
          let target;
          switch (message.conversationId.originType) {
            case "chat":
              target = await Chat.findOne({
                conversationId: message.conversationId._id,
              });
              break;
            case "group":
              target = await Group.findOne({
                conversationId: message.conversationId._id,
              });
              break;
            case "channel":
              target = await Channel.findOne({
                conversationId: message.conversationId._id,
              });
              break;
          }
          if (!target) return;
          let isBlocked = false;
          if (message.conversationId.originType.toLowerCase() == "chat") {
            const otherUser = target.users.find(
              (ele) => String(ele) != String(msg.senderId._id)
            );
            const [blocked, hasBlocked] = await Promise.all([
              BlockedUser.findOne({
                blockedBy: otherUser,
                blockedTo: msg.senderId._id,
              }),
              BlockedUser.findOne({
                blockedBy: msg.senderId._id,
                blockedTo: otherUser,
              }),
            ]);

            if (blocked) isBlocked = true;
            if (hasBlocked) {
              return;
            }
          }
          message.isSent = true;
          if (isBlocked) {
            message.recievedBy = [msg.senderId._id];
            msg.recievedBy = [msg.senderId._id];
          }
          await message.save();

          if (!isBlocked) {
            sendNotification(
              target.users.filter(
                (ele) => ele.toString() !== msg.senderId._id.toString()
              ),
              message.conversationId.originType,
              target._id,
              msg,
              message.conversationId._id,
              msg.senderId._id
            );
          }
          emitRefreshEvent(
            isBlocked ? [msg.senderId._id] : target.users,
            message.conversationId.originType,
            target._id,
            msg
          );
        } catch (err) {
          console.error("Error sending message:", err);
        }
      });

      // Do something with messages here
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  });
}

module.exports = { startCron };
