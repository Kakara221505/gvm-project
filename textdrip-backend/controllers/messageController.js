const Conversation = require("../models/Conversation");
const MessageModal = require("../models/Message");
const UserModal = require("../models/User");
const MessageMediaModal = require("../models/MessageMedia");
const Chat = require("../models/Chat");
const Group = require("../models/Group");
const {
  getIO,
  emitRefreshEvent,
  emitRemoveCountEvent,
} = require("../socket/socket");
const Message = require("../models/Message");
const Channel = require("../models/Channel");
const { default: mongoose } = require("mongoose");
const { categorizeFile } = require("../utils/utils");
const { sendNotification } = require("../utils/notification");
const { isDuration } = require("moment/moment");
const BlockedUser = require("../models/BlockedUser");

async function addMessage(data) {
  const message = new Message(data);
  const newMessage = await message.save();
  const msg = await Message.findById(newMessage._id)
    .populate("mediaId")
    .populate({
      path: "senderId",
      select: "userName name email phone privacy",
      populate: [
        { path: "mediaId", select: "mediaUrl" },
        { path: "avtarId", select: "avtarImage" },
      ],
    })
    .populate({ path: "senderId.mediaId" });

  const dt = msg.toObject();
  dt.mediaUrl = dt.mediaId
    ? `${process.env.BASE_URL}${dt.mediaId.fileUrl}`
    : null;
  dt.mediaUrl = dt?.mediaId
    ? `${process.env.BASE_URL}${dt?.mediaId?.fileUrl}`
    : null;
  if (dt.senderId) {
    dt.senderId.userImage = dt?.senderId?.mediaId
      ? `${process.env.BASE_URL}${dt?.senderId?.mediaId?.mediaUrl}`
      : null;
    dt.senderId.avtarImage = dt?.senderId?.avtarId
      ? `${process.env.BASE_URL}${dt?.senderId?.avtarId?.avtarImage}`
      : null;
  }
  dt.fileType = dt?.mediaId?.fileType || "";
  return dt;
}

// async function storeMessage(
//   iv = "",
//   cipherText,
//   medias,
//   target,
//   userId,
//   conversation,
//   sentDate,
//   isScheduled,
//   isLink,
//   isLocation = false,
//   messageId
// ) {
//   const affectedUsers = target.users;
//   const io = getIO();

//   let isBlocked = false;

//   if (conversation.originType.toLowerCase() === "chat") {
//     const otherUser = affectedUsers.find(
//       (ele) => String(ele) !== String(userId)
//     );

//     const [blocked, hasBlocked] = await Promise.all([
//       BlockedUser.findOne({
//         blockedBy: otherUser,
//         blockedTo: userId,
//       }),
//       BlockedUser.findOne({
//         blockedBy: userId,
//         blockedTo: otherUser,
//       }),
//     ]);

//     if (blocked) isBlocked = true;
//     if (hasBlocked) throw new Error("You have been blocked by this user");
//   }

//   const event = `CONVERSATION__${conversation._id}`;
//   const type = conversation.originType;

//   const buildMessagePayload = (extra = {}) => ({
//     senderId: userId,
//     messageId,
//     seenBy: [userId],
//     originType: conversation.originType,
//     recievedBy: isBlocked ? [userId] : target.users,
//     ...extra,
//     conversationId: conversation._id,
//     sentTime: sentDate || new Date(),
//     isScheduled,
//     isSent: !isScheduled,
//   });

//   const determineMessageType = () => {
//     if (isLocation) return "LOCATION";
//     if (isLink) return "LINK";
//     return "TEXT";
//   };

//   const notify = (msg) => {
//     if (!isScheduled) {
//       io.to(event).emit("message-sent", { message: msg });

//       sendNotification(
//         isBlocked
//           ? [String(userId)]
//           : affectedUsers.filter((ele) => ele.toString() !== userId.toString()),
//         type,
//         target._id,
//         msg,
//         conversation._id,
//         userId
//       );

//       emitRefreshEvent(
//         isBlocked ? [userId] : affectedUsers,
//         type,
//         target._id,
//         msg
//       );
//     }
//   };

//   // Helper to save media and message inside a session if provided
//   const saveMediaAndMessage = async (file, session = null) => {
//     const fileUrl = `${process.env.MESSAGE_MEDIA_ROUTE}${file.filename}`;

//     const media = new MessageMediaModal({
//       userId,
//       fileType: categorizeFile(file),
//       fileUrl,
//       fileSize: file.size,
//     });

//     const newMedia = await media.save({ session });

//     const newMsg = await addMessage(
//       buildMessagePayload({
//         iv: iv || "",
//         cipherText,
//         messageType: "MEDIA",
//         mediaId: newMedia._id,
//       }),
//       session ? { session } : undefined
//     );

//     notify(newMsg);
//     return newMsg;
//   };

//   // 1️⃣ Handle single media (no transaction needed)
//   if (medias.length === 1) {
//     await saveMediaAndMessage(medias[0]);
//     return;
//   }

//   // 2️⃣ Handle no media (no transaction needed)
//   if (medias.length === 0) {
//     const newMsg = await addMessage(
//       buildMessagePayload({
//         iv: iv || "",
//         cipherText,
//         messageType: determineMessageType(),
//       })
//     );

//     notify(newMsg);
//     return;
//   }

//   // 3️⃣ Handle multiple media (with transaction)
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     if (cipherText) {
//       const textMsg = await addMessage(
//         buildMessagePayload({
//           iv: iv || "",
//           cipherText,
//           messageType: determineMessageType(),
//         }),
//         { session }
//       );
//       notify(textMsg);
//     }

//     let lastMsg = null;
//     for (const file of medias) {
//       lastMsg = await saveMediaAndMessage(file, session);
//     }

//     await session.commitTransaction();
//     session.endSession();
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     throw error;
//   }
// }

// async function sendMessage(req, res) {
//   try {
//     const { cipherText, conversationId, isLink, iv, messageId, isLocation } =
//       req.body;
//     if (!messageId) {
//       return res.status(404).json({ message: "MessageId not found" });
//     }
//     const userId = req.user.id;
//     const sender = await UserModal.findById(userId);
//     if (!sender) return res.status(404).json({ message: "Sender not found" });

//     const conversation = await Conversation.findById(conversationId);

//     if (!conversation)
//       return res.status(404).json({ message: "Conversation not found" });

//     if (conversation.originType === "chat") {
//       const chat = await Chat.findOne({
//         conversationId: conversationId,
//         users: userId,
//       });
//       if (!chat) return res.status(404).json({ message: "Chat not found" });
//       await storeMessage(
//         iv,
//         cipherText,
//         req?.files?.messageMedia || [],
//         chat,
//         userId,
//         conversation,
//         null,
//         false,
//         typeof isLink == "string" ? isLink == "true" : Boolean(isLink),
//         typeof isLocation === "string"
//           ? isLocation === "true"
//           : Boolean(isLocation),
//         messageId
//       );
//     } else if (conversation.originType === "group") {
//       const group = await Group.findOne({
//         conversationId: conversationId,
//         users: userId,
//       });
//       if (!group) return res.status(404).json({ message: "Group not found" });
//       await storeMessage(
//         iv,
//         cipherText,
//         req?.files?.messageMedia || [],
//         group,
//         userId,
//         conversation,
//         null,
//         false,
//         typeof isLink == "string" ? isLink == "true" : Boolean(isLink),
//         typeof isLocation === "string"
//           ? isLocation === "true"
//           : Boolean(isLocation),
//         messageId
//       );
//     } else if (conversation.originType === "channel") {
//       const channel = await Channel.findOne({
//         conversationId: conversationId,
//         users: userId,
//       });
//       if (!channel)
//         return res.status(404).json({ message: "Channel not found" });
//       await storeMessage(
//         iv,
//         cipherText,
//         req?.files?.messageMedia || [],
//         channel,
//         userId,
//         conversation,
//         null,
//         false,
//         typeof isLink == "string" ? isLink == "true" : Boolean(isLink),
//         typeof isLocation === "string"
//           ? isLocation === "true"
//           : Boolean(isLocation),
//         messageId
//       );
//     } else {
//       return res.status(400).json({ message: "Invalid type" });
//     }

//     return res.status(201).json({ message: "Message sent successfully" });
//   } catch (error) {
//     if (error.message === "You have been blocked by this user") {
//       return res.status(403).json({ message: error.message });
//     }
//     console.error("Send Message Error:", error);
//     res.status(500).json({ message: "Error sending message" });
//   }
// }


async function storeMessage(
  iv = "",
  cipherText,
  medias,
  target,
  userId,
  conversation,
  sentDate,
  isScheduled,
  isLink,
  isLocation = false,
  messageId,
  sharedContact = null
) {
  const affectedUsers = target.users;
  const io = getIO();

  let isBlocked = false;

  if (conversation.originType.toLowerCase() === "chat") {
    const otherUser = affectedUsers.find(
      (ele) => String(ele) !== String(userId)
    );

    const [blocked, hasBlocked] = await Promise.all([
      BlockedUser.findOne({
        blockedBy: otherUser,
        blockedTo: userId,
      }),
      BlockedUser.findOne({
        blockedBy: userId,
        blockedTo: otherUser,
      }),
    ]);

    if (blocked) isBlocked = true;
    if (hasBlocked) throw new Error("You have been blocked by this user");
  }

  const event = `CONVERSATION__${conversation._id}`;
  const type = conversation.originType;

  const buildMessagePayload = (extra = {}) => ({
    senderId: userId,
    messageId,
    seenBy: [userId],
    originType: conversation.originType,
    recievedBy: isBlocked ? [userId] : target.users,
    ...extra,
    conversationId: conversation._id,
    sentTime: sentDate || new Date(),
    isScheduled,
    isSent: !isScheduled,
  });

  const determineMessageType = () => {
    if (isLocation) return "LOCATION";
    if (isLink) return "LINK";
    if (sharedContact) return "CONTACT";
    return "TEXT";
  };

  const notify = (msg) => {
    if (!isScheduled) {
      io.to(event).emit("message-sent", { message: msg });

      sendNotification(
        isBlocked
          ? [String(userId)]
          : affectedUsers.filter((ele) => ele.toString() !== userId.toString()),
        type,
        target._id,
        msg,
        conversation._id,
        userId
      );

      emitRefreshEvent(
        isBlocked ? [userId] : affectedUsers,
        type,
        target._id,
        msg
      );
    }
  };

  // Helper to save media and message inside a session if provided
  const saveMediaAndMessage = async (file, session = null) => {
    const fileUrl = `${process.env.MESSAGE_MEDIA_ROUTE}${file.filename}`;

    const media = new MessageMediaModal({
      userId,
      fileType: categorizeFile(file),
      fileUrl,
      fileSize: file.size,
    });

    const newMedia = await media.save({ session });

    const newMsg = await addMessage(
      buildMessagePayload({
        iv: iv || "",
        cipherText,
        messageType: "MEDIA",
        mediaId: newMedia._id,
      }),
      session ? { session } : undefined
    );

    notify(newMsg);
    return newMsg;
  };

  // 1️⃣ Handle single media (no transaction needed)
  if (medias.length === 1) {
    await saveMediaAndMessage(medias[0]);
    return;
  }

  // 2️⃣ Handle no media (no transaction needed)
  if (medias.length === 0) {
    const newMsg = await addMessage(
      buildMessagePayload({
        iv: iv || "",
        cipherText,
        messageType: determineMessageType(),
        sharedContact: sharedContact || undefined,
      })
    );

    notify(newMsg);
    return;
  }

  // 3️⃣ Handle multiple media (with transaction)
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (cipherText || sharedContact) {
      const textMsg = await addMessage(
        buildMessagePayload({
          iv: iv || "",
          cipherText,
          messageType: determineMessageType(),
          sharedContact: sharedContact || undefined,
        }),
        { session }
      );
      notify(textMsg);
    }

    let lastMsg = null;
    for (const file of medias) {
      lastMsg = await saveMediaAndMessage(file, session);
    }

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

async function sendMessage(req, res) {
  try {
    const { cipherText, conversationId, isLink, iv, messageId, isLocation, sharedContact } =
      req.body;
    if (!messageId) {
      return res.status(404).json({ message: "MessageId not found" });
    }
    const userId = req.user.id;
    const sender = await UserModal.findById(userId);
    if (!sender) return res.status(404).json({ message: "Sender not found" });

    const conversation = await Conversation.findById(conversationId);

    if (!conversation)
      return res.status(404).json({ message: "Conversation not found" });

    const parsedContact =
    typeof sharedContact === "string"
      ? JSON.parse(sharedContact)
      : sharedContact;
console.log("dfd",parsedContact)
    if (conversation.originType === "chat") {
      const chat = await Chat.findOne({
        conversationId: conversationId,
        users: userId,
      });
      if (!chat) return res.status(404).json({ message: "Chat not found" });
      await storeMessage(
        iv,
        cipherText,
        req?.files?.messageMedia || [],
        chat,
        userId,
        conversation,
        null,
        false,
        typeof isLink == "string" ? isLink == "true" : Boolean(isLink),
        typeof isLocation === "string"
          ? isLocation === "true"
          : Boolean(isLocation),
        messageId,
        parsedContact
      );
    } else if (conversation.originType === "group") {
      const group = await Group.findOne({
        conversationId: conversationId,
        users: userId,
      });
      if (!group) return res.status(404).json({ message: "Group not found" });
      await storeMessage(
        iv,
        cipherText,
        req?.files?.messageMedia || [],
        group,
        userId,
        conversation,
        null,
        false,
        typeof isLink == "string" ? isLink == "true" : Boolean(isLink),
        typeof isLocation === "string"
          ? isLocation === "true"
          : Boolean(isLocation),
        messageId,
        parsedContact
      );
    } else if (conversation.originType === "channel") {
      const channel = await Channel.findOne({
        conversationId: conversationId,
        users: userId,
      });
      if (!channel)
        return res.status(404).json({ message: "Channel not found" });
      await storeMessage(
        iv,
        cipherText,
        req?.files?.messageMedia || [],
        channel,
        userId,
        conversation,
        null,
        false,
        typeof isLink == "string" ? isLink == "true" : Boolean(isLink),
        typeof isLocation === "string"
          ? isLocation === "true"
          : Boolean(isLocation),
        messageId,
        parsedContact
      );
    } else {
      return res.status(400).json({ message: "Invalid type" });
    }

    return res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    if (error.message === "You have been blocked by this user") {
      return res.status(403).json({ message: error.message });
    }
    console.error("Send Message Error:", error);
    res.status(500).json({ message: "Error sending message" });
  }
}

async function seenMessage(conversation, userId) {
  try {
    const userIdObject = new mongoose.Types.ObjectId(userId);

    const io = getIO();

    await Message.updateMany(
      {
        sentTime: {
          $lte: new Date(),
        },
        conversationId: conversation._id,
        recievedBy: userId,
        seenBy: { $ne: userIdObject },
      },
      { $addToSet: { seenBy: userIdObject } }
    );

    const messagesToUpdate = await Message.find({
      conversationId: conversation._id,
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
    });

    // update data
    const messageIds = messagesToUpdate.map((msg) => msg._id);
    if (messageIds.length > 0) {
      await Message.updateMany(
        { _id: { $in: messageIds } },
        { $set: { isSeen: true } }
      );
      const event = `CONVERSATION__${conversation._id.toString()}`;
      io.to(event).emit("seen-message", { messages: messageIds });
    }
    io.emit(`seen-message-${userId}`, {
      conversationId: conversation._id.toString(),
    });
  } catch (err) {
    console.log("Err making msg seen...", err);
  }
}

// Get messages between two users, in a group, or in a channel
async function getMessages(req, res) {
  try {
    let { conversationId, page = 1, limit = 10 } = req.body;

    const userId = req.user.id;
    const sender = await UserModal.findById(userId);
    if (!sender) return res.status(404).json({ message: "Sender not found" });

    const conversation = await Conversation.findById(conversationId);

    if (!conversation)
      return res.status(404).json({ message: "Conversation not found" });

    await seenMessage(conversation, userId);

    // const isChannel = conversation.originType === "channel";

    const filter = {
      sentTime: { $lte: new Date() },
      conversationId: conversationId,
      recievedBy: userId,
      isDeleted: false,
    };

    // if (!isChannel) {
    // filter.recievedBy = userId;
    // }
    //   sentTime: {
    //     $lte: new Date(),
    //   },
    //   conversationId: conversationId,
    //   recievedBy: userId,
    // })

    const messagePromise = Message.find(filter)

      .sort({ sentTime: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate("mediaId")
      .populate({
        path: "senderId",
        select: "userName name email phone privacy",
        populate: [
          { path: "mediaId", select: "mediaUrl" },
          { path: "avtarId", select: "avtarImage" },
        ],
      });

    // const totalRecordsPromise = Message.countDocuments({
    //   sentTime: {
    //     $lte: new Date(),
    //   },
    //   conversationId: conversationId,
    //   recievedBy: userId,
    // });
    const totalRecordsPromise = Message.countDocuments(filter);

    const [message, totalRecords] = await Promise.all([
      messagePromise,
      totalRecordsPromise,
    ]);

    return res.status(200).json({
      data: message.map((ele) => {
        const dt = ele.toObject();
        dt.mediaUrl = dt?.mediaId
          ? `${process.env.BASE_URL}${dt?.mediaId?.fileUrl}`
          : null;
        if (dt.senderId) {
          dt.senderId.userImage = dt?.senderId?.mediaId
            ? `${process.env.BASE_URL}${dt?.senderId?.mediaId?.mediaUrl}`
            : null;
          dt.senderId.avtarImage = dt?.senderId?.avtarId
            ? `${process.env.BASE_URL}${dt?.senderId?.avtarId?.avtarImage}`
            : null;
        }
        return dt;
      }),
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalRecords / limit),
        totalRecords: totalRecords,
      },
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Error fetching messages" });
  }
}

// Get messages between two users, in a group, or in a channel
async function getMediaMessages(req, res) {
  try {
    let { conversationId, page = 1, limit = 10, mediaType } = req.body;

    const userId = req.user.id;
    const sender = await UserModal.findById(userId);
    if (!sender) return res.status(404).json({ message: "Sender not found" });

    if (
      !mediaType ||
      !["MEDIA", "LINK", "DOCUMENT"].includes(mediaType?.toUpperCase())
    ) {
      return res.status(400).json({ message: "Invalid media type" });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation)
      return res.status(404).json({ message: "Conversation not found" });

    let message = [];
    let totalRecord = 0;
    const allTotalRecordsPromise = Message.aggregate([
      {
        $lookup: {
          from: "media",
          localField: "mediaId",
          foreignField: "_id",
          as: "mediaId",
        },
      },
      {
        $unwind: {
          path: "$mediaId",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          sentTime: { $lte: new Date() },
          recievedBy: { $in: [userId] },
          isDeleted: false,
          isSent: true,
          conversationId: conversation._id,
          messageType: { $in: ["MEDIA", "LINK"] },
          $or: [
            { "mediaId.fileType": { $in: ["image", "video", "document"] } },
            { messageType: "LINK" },
          ],
        },
      },
      {
        $facet: {
          totalCount: [{ $count: "count" }],
        },
      },
    ]);

    if (
      mediaType.toUpperCase() == "MEDIA" ||
      mediaType.toUpperCase() == "DOCUMENT"
    ) {
      const matchConditions = {
        sentTime: { $lte: new Date() },
        recievedBy: { $in: [userId] },
        isDeleted: false,
        isSent: true,
        conversationId: conversation._id,
        messageType: "MEDIA",
      };
      const messages = await Message.aggregate([
        {
          $lookup: {
            from: "media",
            localField: "mediaId",
            foreignField: "_id",
            as: "mediaId",
          },
        },
        {
          $lookup: {
            from: "User",
            let: { senderId: "$senderId" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$senderId"] },
                },
              },
              {
                $project: {
                  _id: 1,
                  userName: 1,
                  name: 1,
                  email: 1,
                  phone: 1,
                  privacy: 1,
                },
              },
            ],
            as: "senderId",
          },
        },
        {
          $unwind: {
            path: "$senderId",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$mediaId",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            ...matchConditions,
            "mediaId.fileType":
              mediaType.toUpperCase() === "MEDIA"
                ? { $in: ["image", "video"] }
                : { $in: ["document"] },
          },
        },
        {
          $facet: {
            data: [
              { $sort: { sentTime: -1 } },
              { $skip: (page - 1) * limit },
              { $limit: limit },
            ],
            totalCount: [{ $count: "count" }],
          },
        },
      ]);

      message = messages[0].data;
      totalRecord = messages[0].totalCount[0]?.count || 0;
    } else if (mediaType.toUpperCase() == "LINK") {
      const filter = {
        sentTime: { $lte: new Date() },
        conversationId: conversation._id,
        recievedBy: userId,
        isDeleted: false,
        isSent: true,
        messageType: "LINK",
      };
      const messagesPromise = Message.find(filter)
        .sort({ sentTime: -1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .populate({ path: "mediaId" })
        .populate({ path: "senderId", select: "userName name" })
        .populate({ path: "senderId.mediaId" });

      const totalRecordsPromise = Message.countDocuments(filter);

      [message, totalRecord] = await Promise.all([
        messagesPromise,
        totalRecordsPromise,
      ]);
    }
    const allTotalRecords = await allTotalRecordsPromise;
    return res.status(200).json({
      data: message.map((ele) => {
        ele.mediaUrl = ele.mediaId
          ? `${process.env.BASE_URL}${ele.mediaId.fileUrl}`
          : null;
        return ele;
      }),
      allTotalRecords: allTotalRecords[0].totalCount[0]?.count || 0,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalRecord / limit),
        totalRecords: totalRecord,
      },
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Error fetching messages" });
  }
}

async function getScheduledMessages(req, res) {
  try {
    let { conversationId, page = 1, limit = 10 } = req.body;
    const userId = req.user.id;
    const sender = await UserModal.findById(userId);
    if (!sender) return res.status(404).json({ message: "Sender not found" });

    const conversation = await Conversation.findById(conversationId);

    if (!conversation)
      return res.status(404).json({ message: "Conversation not found" });

    const messagePromise = await Message.find({
      senderId: userId,
      isScheduled: true,
      conversationId: conversation._id,
    })
      .sort({ sentTime: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate("mediaId")
      .populate({
        path: "senderId",
        select: "userName name",
        populate: [
          { path: "mediaId", select: "mediaUrl" },
          { path: "avtarId", select: "avtarImage" },
        ],
      });

    const totalRecordsPromise = Message.countDocuments({
      senderId: userId,
      isScheduled: true,
      conversationId: conversation._id,
    });

    const futureScheduledCountPromise = Message.countDocuments({
      senderId: userId,
      isScheduled: true,
      sentTime: { $gt: new Date() },
      conversationId: conversation._id,
    });

    const [message, totalRecords,futureScheduledCount] = await Promise.all([
      messagePromise,
      totalRecordsPromise,
      futureScheduledCountPromise
    ]);
    return res.status(200).json({
      data: message.map((msg) => {
        const ele = msg.toObject();
        ele.mediaUrl = ele.mediaId
          ? `${process.env.BASE_URL}${ele.mediaId.fileUrl}`
          : null;
        ele.senderId.mediaUrl = ele.senderId.mediaId
          ? `${process.env.BASE_URL}${ele?.senderId?.mediaId?.mediaUrl}`
          : null;
        ele.senderId.avtarImage = ele.senderId.avtarId
          ? `${process.env.BASE_URL}${ele?.senderId?.avtarId?.avtarImage}`
          : null;
        delete ele.senderId.avtarId;
        return ele;
      }),
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalRecords / limit),
        totalRecords: totalRecords,
      },
      futureScheduledCount
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Error fetching messages" });
  }
}

// Mark message as read
async function markAsRead(req, res, io) {
  try {
    const { messageId } = req.params;
    const message = await MessageModal.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Only mark as read if it is unread
    if (!message.isRead) {
      message.isRead = true;
      await message.save();

      // Log when the message is marked as read
      console.log(
        `Message ${messageId} marked as read by Receiver: ${message.receiverId}`
      );

      // Emit WebSocket message to the sender that the message was read
      io.to(message.senderId.toString()).emit("messageRead", message);
      console.log("Emitted message read event for sender:", message);
    }

    res.status(200).json({ message: "Message marked as read" });
  } catch (error) {
    console.error("Error updating message status:", error);
    res.status(500).json({ message: "Error updating message status" });
  }
}

async function scheduleMessage(req, res) {
  try {
    const { date, conversationId, cipherText, isLink, iv, messageId } =
      req.body;
    if (!messageId) {
      return res.status(404).json({ message: "MessageId not found" });
    }
    const userId = req.user.id;
    const sender = await UserModal.findById(userId);
    if (!sender) return res.status(404).json({ message: "Sender not found" });

    if (!date) {
      return res.status(404).json({ message: "Date not found" });
    }

    let sentDate = new Date(date);
    if (!sentDate || sentDate <= new Date()) {
      return res
        .status(400)
        .json({ message: "Invalid or past scheduled date" });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation)
      return res.status(404).json({ message: "Conversation not found" });

    if (conversation.originType === "chat") {
      const chat = await Chat.findOne({
        conversationId: conversationId,
        users: userId,
      });
      if (!chat) return res.status(404).json({ message: "Chat not found" });
      await storeMessage(
        iv,
        cipherText,
        req.files?.messageMedia || [],
        chat,
        userId,
        conversation,
        sentDate,
        true,
        typeof isLink == "string" ? isLink == "true" : Boolean(isLink),
        false,
        messageId
      );
    } else if (conversation.originType === "group") {
      const group = await Group.findOne({
        conversationId: conversationId,
        users: userId,
      });
      if (!group) return res.status(404).json({ message: "Group not found" });
      await storeMessage(
        iv,
        cipherText,
        req.files?.messageMedia || [],
        group,
        userId,
        conversation,
        sentDate,
        true,
        typeof isLink == "string" ? isLink == "true" : Boolean(isLink),
        false,
        messageId
      );
    } else if (conversation.originType === "channel") {
      const channel = await Channel.findOne({
        conversationId: conversationId,
        users: userId,
      });
      if (!channel)
        return res.status(404).json({ message: "Channel not found" });
      await storeMessage(
        iv,
        cipherText,
        req.files?.messageMedia || [],
        channel,
        userId,
        conversation,
        sentDate,
        true,
        typeof isLink == "string" ? isLink == "true" : Boolean(isLink),
        false,
        messageId
      );
    } else {
      return res.status(400).json({ message: "Invalid type" });
    }

    return res.status(201).json({ message: "Message scheduled successfully" });
  } catch (error) {
    console.error("Send Message Error:", error);
    if (error.message === "You have been blocked by this user") {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({ message: "Error sending message" });
  }
}

// async function sendScheduledMessage(req, res) {
//   try {
//     const { messageId } = req.params;
//     const userId = req.user.id;

//     const message = await Message.findById(messageId)
//       .populate("conversationId")
//       .populate("mediaId")
//       .populate({
//         path: "senderId",
//         select: "userName name",
//         populate: [
//           { path: "mediaId", select: "mediaUrl" },
//           { path: "avtarId", select: "avtarImage" },
//         ],
//       });
//     if (!message) return res.status(404).json({ message: "Message not found" });

//     if (!message.isScheduled || new Date(message.sentTime) <= new Date()) {
//       return res.status(400).json({ message: "Cannot send scheduled message" });
//     }

//     if (message.senderId._id.toString() !== userId.toString()) {
//       return res
//         .status(403)
//         .json({ message: "You are not authorized to send this message" });
//     }

//     message.sentTime = new Date();
//     message.isSent = true;
//     await message.save();

//     const io = getIO();

//     let msg = message.toObject();
//     msg.mediaUrl = msg?.mediaId
//       ? `${process.env.BASE_URL}${msg?.mediaId?.fileUrl}`
//       : null;
//     msg.senderId.userImgase = msg?.senderId?.mediaId
//       ? `${process.env.BASE_URL}${msg?.senderId?.mediaId?.mediaUrl}`
//       : null;
//     msg.senderId.avtarImage = msg?.senderId?.avtarId
//       ? `${process.env.BASE_URL}${msg?.senderId?.mediaId?.avtarImage}`
//       : null;
//     msg.conversationId = msg.conversationId._id;

//     io.to(`CONVERSATION__${message.conversationId._id}`).emit("message-sent", {
//       message: msg,
//     });
//     let target;
//     switch (message.conversationId.originType) {
//       case "chat":
//         target = await Chat.findOne({
//           conversationId: message.conversationId._id,
//         });
//         break;
//       case "group":
//         target = await Group.findOne({
//           conversationId: message.conversationId._id,
//         });
//         break;
//       case "channel":
//         target = await Channel.findOne({
//           conversationId: message.conversationId._id,
//         });
//         break;
//     }

//     // target.latestMessage = messageId;
//     // await target.save();

//     sendNotification(
//       target.users.filter(
//         (ele) => ele.toString() !== msg.senderId._id.toString()
//       ),
//       message.conversationId.originType,
//       target._id,
//       msg,
//       message.conversationId._id,
//       userId
//     );

//     emitRefreshEvent(
//       target.users,
//       message.conversationId.originType,
//       target._id,
//       msg
//     );

//     return res
//       .status(200)
//       .json({ message: "Scheduled message sent successfully" });
//   } catch (error) {
//     console.error("Send Message Error:", error);
//     res.status(500).json({ message: "Error sending message" });
//   }
// }

async function sendScheduledMessage(req, res) {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(messageId)
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
    if (!message) return res.status(404).json({ message: "Message not found" });

    if (!message.isScheduled || new Date(message.sentTime) <= new Date()) {
      return res.status(400).json({ message: "Cannot send scheduled message" });
    }

    if (message.senderId._id.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to send this message" });
    }

    message.sentTime = new Date();
    message.isSent = true;
    await message.save();

    const io = getIO();

    let msg = message.toObject();
    msg.mediaUrl = msg?.mediaId
      ? `${process.env.BASE_URL}${msg?.mediaId?.fileUrl}`
      : null;
    msg.senderId.userImgase = msg?.senderId?.mediaId
      ? `${process.env.BASE_URL}${msg?.senderId?.mediaId?.mediaUrl}`
      : null;
    msg.senderId.avtarImage = msg?.senderId?.avtarId
      ? `${process.env.BASE_URL}${msg?.senderId?.mediaId?.avtarImage}`
      : null;
    msg.conversationId = msg.conversationId._id;

    io.to(`CONVERSATION__${message.conversationId._id}`).emit("message-sent", {
      message: msg,
    });
    let target;
    let skipNotification = false;
    switch (message.conversationId.originType) {
      case "chat":
        target = await Chat.findOne({
          conversationId: message.conversationId._id,
        });
        if (target) {
          const otherUser = target.users.find(
            (ele) => ele.toString() !== userId.toString()
          );

          const [blocked, hasBlocked] = await Promise.all([
            BlockedUser.findOne({
              blockedBy: otherUser,
              blockedTo: userId,
            }),
            BlockedUser.findOne({
              blockedBy: userId,
              blockedTo: otherUser,
            }),
          ]);

          if (hasBlocked) {
            return res.status(403).json({ message: "You have been blocked by this user" });
          }

          if (blocked) {
            skipNotification = true; // Don't send notification if blocked
          }
        }
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

    // target.latestMessage = messageId;
    // await target.save();

    if (!skipNotification && target) {
      sendNotification(
        target.users.filter(
          (ele) => ele.toString() !== msg.senderId._id.toString()
        ),
        message.conversationId.originType,
        target._id,
        msg,
        message.conversationId._id,
        userId
      );

      emitRefreshEvent(
        target.users,
        message.conversationId.originType,
        target._id,
        msg
      );
    }


    return res
      .status(200)
      .json({ message: "Scheduled message sent successfully" });
  } catch (error) {
    console.error("Send Message Error:", error);
    res.status(500).json({ message: "Error sending message" });
  }
}

async function updateScheduledMessage(req, res) {
  try {
    const { messageId } = req.params;
    const { date, cipherText, isLink, iv } = req.body;

    const userId = req.user.id;
    const sender = await UserModal.findById(userId);
    if (!sender) return res.status(404).json({ message: "Sender not found" });

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    if (!message.isScheduled || new Date(message.sentTime) <= new Date()) {
      return res
        .status(400)
        .json({ message: "Cannot update sent or unscheduled message" });
    }

    // if (message.senderId.toString() !== userId.toString()) {
    //   return res.status(403).json({ message: "You are not authorized to update this message" });
    // }

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    let sentDate = new Date(date);

    if (!sentDate || sentDate <= new Date()) {
      return res
        .status(400)
        .json({ message: "Invalid or past scheduled date" });
    }

    const conversation = await Conversation.findById(message.conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // if (conversation.originType === "chat") {
    //   const chat = await Chat.findOne({
    //     conversationId: conversation._id,
    //     users: userId,
    //   });
    //   if (!chat) return res.status(404).json({ message: "Chat not found" });
    // } else if (conversation.originType === "group") {
    //   const group = await Group.findOne({
    //     conversationId: conversation._id,
    //     users: userId,
    //   });
    //   console.log(conversation.originType)
    //   if (!group) return res.status(404).json({ message: "Group not found" });
    // } else if (conversation.originType === "channel") {
    //   const channel = await Channel.findOne({
    //     conversationId: conversation._id,
    //     users: userId,
    //   });
    //   if (!channel) return res.status(404).json({ message: "Channel not found" });
    // } else {
    //   return res.status(400).json({ message: "Invalid originType" });
    // }

    // Update message fields
    if (cipherText) message.cipherText = cipherText;
    if (iv) message.iv = iv;
    if (typeof isLink !== "undefined") {
      message.messageType =
        isLink === "true" || isLink === true ? "LINK" : "TEXT";
    }
    message.sentTime = sentDate;

    await message.save();

    return res
      .status(200)
      .json({ message: "Scheduled message updated successfully" });
  } catch (error) {
    console.error("Update Error:", error);
    return res
      .status(500)
      .json({ message: "Error updating scheduled message" });
  }
}

async function deleteScheduledMessage(req, res) {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (!message.isScheduled || new Date(message.sentTime) <= new Date()) {
      return res
        .status(400)
        .json({ message: "Cannot delete sent or unscheduled messages" });
    }

    if (message.senderId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this message" });
    }

    await Message.findByIdAndDelete(messageId);

    return res
      .status(200)
      .json({ message: "Scheduled message deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    return res.status(500).json({ message: "Error deleting message" });
  }
}

async function deleteConversation(req, res) {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    await Message.updateMany(
      {
        conversationId: conversationId,
        recievedBy: userId,
      },
      {
        $pull: {
          recievedBy: userId,
        },
      }
    );

    return res.status(200).json({ message: "Conversation deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error deleting chat conversation" });
  }
}

async function updateMessage(req, res) {
  const { messageId, iv, cipherText, isLink } = req.body;

  if (!messageId || !iv || !cipherText) {
    return res.status(400).json({
      message: "messageId, iv, and cipherText are required.",
    });
  }

  try {
    // Update and fetch message in one step
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      {
        iv,
        cipherText,
        isEdited: true,
        messageType: isLink === "true" || isLink === true ? "LINK" : "TEXT",
      },
      { new: true }
    )
      .populate("mediaId")
      .populate({
        path: "senderId",
        select: "userName name email phone privacy",
        populate: [
          { path: "mediaId", select: "mediaUrl" },
          { path: "avtarId", select: "avtarImage" },
        ],
      });

    if (!updatedMessage) {
      return res.status(404).json({ message: "Message not found." });
    }

    const dt = updatedMessage.toObject();

    // Build media URL
    dt.mediaUrl = dt.mediaId
      ? `${process.env.BASE_URL}${dt.mediaId.fileUrl}`
      : null;

    if (dt.senderId) {
      dt.senderId.userImage = dt.senderId.mediaId
        ? `${process.env.BASE_URL}${dt.senderId.mediaId.mediaUrl}`
        : null;

      dt.senderId.avtarImage = dt.senderId.avtarId
        ? `${process.env.BASE_URL}${dt.senderId.avtarId.avtarImage}`
        : null;
    }

    dt.fileType = dt.mediaId?.fileType || "";

    const io = getIO();

    // Fetch conversation and corresponding target (chat/group/channel) in parallel
    const [conversation, chat, group, channel] = await Promise.all([
      Conversation.findById(dt.conversationId),
      Chat.findOne({ conversationId: dt.conversationId }),
      Group.findOne({ conversationId: dt.conversationId }),
      Channel.findOne({ conversationId: dt.conversationId }),
    ]);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found." });
    }

    let target;
    const originType = conversation.originType;

    switch (originType) {
      case "chat":
        target = chat;
        break;
      case "group":
        target = group;
        break;
      case "channel":
        target = channel;
        break;
      default:
        return res.status(400).json({ message: "Invalid conversation type." });
    }

    if (!target) {
      return res.status(404).json({ message: `${originType} not found.` });
    }

    const affectedUsers = target.users || [];
    const event = `CONVERSATION__${conversation._id}`;

    io.to(event).emit("message-sent", { message: dt });

    emitRefreshEvent(affectedUsers, originType, target._id, dt);

    return res.status(200).json({
      message: "Message updated successfully.",
      data: dt,
    });
  } catch (error) {
    console.error("Edit message error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}

// async function deleteMessage(req, res) {
//   const { messageId } = req.params;
//   const loggedInUserId = req.user?._id;

//   if (!messageId) {
//     return res
//       .status(400)
//       .json({ message: "messageId is required in params." });
//   }

//   if (!mongoose.Types.ObjectId.isValid(messageId)) {
//     return res.status(400).json({ message: "Invalid messageId format." });
//   }

//   try {
//     const message = await Message.findById(messageId);

//     if (!message) {
//       return res.status(404).json({ message: "Message not found." });
//     }

//     if (message.senderId._id.toString() !== loggedInUserId.toString()) {
//       return res
//         .status(403)
//         .json({ message: "You are not authorized to delete this message." });
//     }

//     message.isDeleted = true;

//     await message.save();
//     const io = getIO();

//     const [conversation, chat, group, channel] = await Promise.all([
//       Conversation.findById(message.conversationId),
//       Chat.findOne({ conversationId: message.conversationId }),
//       Group.findOne({ conversationId: message.conversationId }),
//       Channel.findOne({ conversationId: message.conversationId }),
//     ]);

//     const newLatestMessage = await Message.findOne({
//       conversationId: message.conversationId,
//       isDeleted: false,
//       isSent: true,
//     }).sort({ sentTime: -1 });

//     if (!conversation) {
//       return res
//         .status(404)
//         .json({ message: "Associated conversation not found." });
//     }

//     let target;
//     const originType = conversation.originType;

//     switch (originType) {
//       case "chat":
//         target = chat;
//         break;
//       case "group":
//         target = group;
//         break;
//       case "channel":
//         target = channel;
//         break;
//       default:
//         return res.status(400).json({ message: "Invalid conversation type." });
//     }

//     if (!target) {
//       return res
//         .status(404)
//         .json({ message: `${originType} not found for message.` });
//     }

//     const affectedUsers = target.users || [];
//     const event = `CONVERSATION__${conversation._id}`;

//     const dt = newLatestMessage ? newLatestMessage.toObject() : {};

//     // Add additional fields for UI if needed
//     if (newLatestMessage) {
//       dt.mediaUrl = dt.mediaId
//         ? `${process.env.BASE_URL}${dt.mediaId.fileUrl}`
//         : null;

//       if (dt.senderId) {
//         dt.senderId.userImage = dt.senderId.mediaId
//           ? `${process.env.BASE_URL}${dt.senderId.mediaId.mediaUrl}`
//           : null;

//         dt.senderId.avtarImage = dt.senderId.avtarId
//           ? `${process.env.BASE_URL}${dt.senderId.avtarId.avtarImage}`
//           : null;
//       }

//       dt.fileType = dt.mediaId?.fileType || "";
//     }

//     const oldDt = message.toObject();

//     // Add additional fields for UI if needed
//     oldDt.mediaUrl = oldDt.mediaId
//       ? `${process.env.BASE_URL}${oldDt.mediaId.fileUrl}`
//       : null;

//     if (oldDt.senderId) {
//       oldDt.senderId.userImage = oldDt.senderId.mediaId
//         ? `${process.env.BASE_URL}${oldDt.senderId.mediaId.mediaUrl}`
//         : null;

//       oldDt.senderId.avtarImage = oldDt.senderId.avtarId
//         ? `${process.env.BASE_URL}${oldDt.senderId.avtarId.avtarImage}`
//         : null;
//     }

//     oldDt.fileType = oldDt.mediaId?.fileType || "";

//     // Emit socket event for deletion
//     io.to(event).emit("message-sent", { message: oldDt });

//     // Emit refresh event
//     emitRefreshEvent(affectedUsers, originType, target._id, dt);

//     return res.status(200).json({
//       message: "Message deleted successfully.",
//     });
//   } catch (error) {
//     console.error("Delete message error:", error);
//     return res.status(500).json({ message: "Internal server error." });
//   }
// }

async function deleteMessage(req, res) {
  const { messageId } = req.params;
  const loggedInUserId = req.user?._id;

  if (!messageId) {
    return res
      .status(400)
      .json({ message: "messageId is required in params." });
  }

  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    return res.status(400).json({ message: "Invalid messageId format." });
  }

  try {
    const message = await MessageModal.findById(messageId)
      .populate({
        path: "senderId",
        select: "mediaId avtarId",
        populate: [
          { path: "mediaId", model: "UserMedia" },
          { path: "avtarId", model: "Avtar" },
        ],
      })
      .populate("mediaId");

    if (!message) {
      return res.status(404).json({ message: "Message not found." });
    }

    if (message.senderId._id.toString() !== loggedInUserId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this message." });
    }

    // Soft delete the message
    message.isDeleted = true;
    await message.save();

    const io = getIO();

    const [conversation, chat, group, channel] = await Promise.all([
      Conversation.findById(message.conversationId),
      Chat.findOne({ conversationId: message.conversationId }),
      Group.findOne({ conversationId: message.conversationId }),
      Channel.findOne({ conversationId: message.conversationId }),
    ]);

    if (!conversation) {
      return res
        .status(404)
        .json({ message: "Associated conversation not found." });
    }

    const newLatestMessage = await MessageModal.findOne({
      conversationId: message.conversationId,
      isDeleted: false,
      isSent: true,
    })
      .sort({ sentTime: -1 })
      .populate({
        path: "senderId",
        select: "mediaId avtarId",
        populate: [
          { path: "mediaId", model: "UserMedia" },
          { path: "avtarId", model: "Avtar" },
        ],
      })
      .populate("mediaId");

    let target;
    const originType = conversation.originType;

    switch (originType) {
      case "chat":
        target = chat;
        break;
      case "group":
        target = group;
        break;
      case "channel":
        target = channel;
        break;
      default:
        return res.status(400).json({ message: "Invalid conversation type." });
    }

    if (!target) {
      return res
        .status(404)
        .json({ message: `${originType} not found for message.` });
    }

    const affectedUsers = target.users || [];
    const event = `CONVERSATION__${conversation._id}`;

    // Prepare old deleted message data
    const oldDt = message.toObject();
    oldDt.mediaUrl = message.mediaId
      ? `${process.env.BASE_URL}${message.mediaId.fileUrl}`
      : null;
    oldDt.fileType = message.mediaId?.fileType || "";

    if (message.senderId) {
      oldDt.senderId.userImage = message.senderId.mediaId
        ? `${process.env.BASE_URL}${message.senderId.mediaId.mediaUrl}`
        : null;

      oldDt.senderId.avtarImage = message.senderId.avtarId
        ? `${process.env.BASE_URL}${message.senderId.avtarId.avtarImage}`
        : null;
    }

    // Prepare new latest message data (if any)
    const dt = newLatestMessage ? newLatestMessage.toObject() : {};
    if (newLatestMessage) {
      dt.mediaUrl = newLatestMessage.mediaId
        ? `${process.env.BASE_URL}${newLatestMessage.mediaId.fileUrl}`
        : null;
      dt.fileType = newLatestMessage.mediaId?.fileType || "";

      if (newLatestMessage.senderId) {
        dt.senderId.userImage = newLatestMessage.senderId.mediaId
          ? `${process.env.BASE_URL}${newLatestMessage.senderId.mediaId.mediaUrl}`
          : null;

        dt.senderId.avtarImage = newLatestMessage.senderId.avtarId
          ? `${process.env.BASE_URL}${newLatestMessage.senderId.avtarId.avtarImage}`
          : null;
      }
    }

    // Emit socket event for message deletion
    io.to(event).emit("message-sent", { message: oldDt });
    // Emit event to refresh last message in UI
    emitRefreshEvent(affectedUsers, originType, target._id, {
      ...dt,
      isPrevDeleted: true,
    });
    const seenByIds = oldDt.seenBy.map((ele) => String(ele));
    const toRemoveSeen = oldDt.recievedBy.filter(
      (ele) => !seenByIds.includes(String(ele))
    );
    emitRemoveCountEvent(toRemoveSeen, originType, target._id);

    return res.status(200).json({ message: "Message deleted successfully." });
  } catch (error) {
    console.error("Delete message error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}


async function deleteMessageForMe(req, res) {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ message: "Invalid messageId format" });
    }

    // Find the message
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Convert userId to ObjectId for comparison
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Check if user is a receiver or the sender (optional: allow sender to delete for self)
    const isReceiver = message.recievedBy.some(id => id.equals(userObjectId));
    const isSender = message.senderId.equals(userObjectId);

    if (!isReceiver && !isSender) {
      return res.status(403).json({ message: "You cannot delete this message" });
    }

    // Pull the user from recievedBy array (one-sided delete)
    message.recievedBy = message.recievedBy.filter(
      id => !id.equals(userObjectId)
    );

    await message.save();

    return res.status(200).json({ message: "Message deleted for you only" });
  } catch (error) {
    console.error("Error deleting message for user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  sendMessage,
  getMessages,
  markAsRead,
  scheduleMessage,
  getScheduledMessages,
  getMediaMessages,
  deleteScheduledMessage,
  updateScheduledMessage,
  sendScheduledMessage,
  deleteConversation,
  updateMessage,
  deleteMessage,
  deleteMessageForMe
};
