const Chat = require("../models/Chat");
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Avtar = require("../models/Avtar");
const Message = require("../models/Message");
const Settings = require("../models/Setting");
const UserMedia = require("../models/UserMedia");
const { getAESKey, getRandomKey } = require("../utils/encryption");
const { default: mongoose } = require("mongoose");
const { pipeline } = require("winston-daily-rotate-file");
const BlockedUser = require("../models/BlockedUser");
const messages = require("../utils/messages");
// async function createChat(req, res) {
//   try {
//     const { user } = req.body;
//     if (!user) {
//       return res.json({ message: "User not found" });
//     }

//     const usr = await User.findById(user).select("publicKey");

//     if (!usr) {
//       return res.json({ message: "User not found" });
//     }

//     const users = [user, req.user.id].sort();

//     let chat = await Chat.findOne({
//       users,
//     });

//     if (chat) {
//       return res.json({ data: chat, message: "Chat created successfully" });
//     }
//     const secretKey = getRandomKey();

//     const keys = {};
//     [usr, req.user].forEach((ele) => {
//       keys[ele._id] = getAESKey(secretKey, ele.publicKey);
//     });

//     const convo = new Conversation({
//       secretKey,
//       AESKeyOfUser: keys,
//       originType: "chat",
//     });

//     const newConvo = await convo.save();
//     chat = new Chat({
//       users,
//       conversationId: newConvo._id,
//     });
//     await chat.save();

//     res.json({ data: chat, message: "Chat created successfully" });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: "Error creating chat" });
//   }
// }

async function createChat(req, res) {
  try {
    const { user } = req.body;
    if (!user) {
      return res.status(404).json({ message: messages.error.USER_NOT_FOUND });
    }

    const usr = await User.findById(user).select("publicKey");

    if (!usr) {
      return res.status(404).json({ message: messages.error.USER_NOT_FOUND });
    }

    const users = [user, req.user.id].sort();

    let chat = await Chat.findOne({
      users,
    });

    if (chat) {
      // Fetch the latest message for the conversation (if any)
      const [latestMessage, settings] = await Promise.all([
        Message.findOne({
          conversationId: chat.conversationId,
        })
          .sort({ sentTime: -1 })
          .lean(),
        Settings.findOne({
          userId: req.user.id,
          chatId: chat._id,
        }).lean(),
      ]);

      // Fetch the other user details (who is not the current user)
      const otherUserId = chat.users.find(
        (id) => id.toString() !== req.user.id.toString()
      );

      const otherUserProfile = await User.findById(otherUserId)
        .select("name userName email privacy mediaId avtarId phone countryCode")
        .lean();
      const background = settings?.background || null;
      const chatColor = settings?.chatColor || null;

      if (!otherUserProfile) {
        console.warn("Chat created, but other user data missing:", otherUserId);
        return res.status(200).json({
          data: {
            _id: chat._id,
            latestMessage: latestMessage || null,
            user: null,
            conversationId: {
              _id: chat.conversationId,
              AESKeyOfUser: null,
            },
            background,
            chatColor,
          },
          message: "Chat already exists, but other user profile missing",
        });
      }

      // Fetch avatar and media (if available)
      const [avtar, media, conversation,isBlockedRecord] = await Promise.all([
        otherUserProfile.avtarId
          ? Avtar.findById(otherUserProfile.avtarId).lean()
          : null,
        otherUserProfile.mediaId
          ? UserMedia.findById(otherUserProfile.mediaId).lean()
          : null,
        Conversation.findById(chat.conversationId).lean(),
        BlockedUser.findOne({ blockedBy: req.user.id, blockedTo: otherUserId }),
      ]);

      const avtarImage = avtar?.avtarImage
        ? `${process.env.BASE_URL}${avtar.avtarImage}`
        : null;
      const mediaUrl = media?.mediaUrl
        ? `${process.env.BASE_URL}${media.mediaUrl}`
        : null;

      const AESKey =
        conversation?.AESKeyOfUser?.[req.user.id.toString()] || null;

      const userObject = {
        ...otherUserProfile,
        avtarImage,
        mediaUrl,
        isBlocked: !!isBlockedRecord,
      };
      // Construct the response with full message details
      const response = {
        _id: chat._id,
        latestMessage: latestMessage || null,
        user: userObject,
        conversationId: {
          _id: chat.conversationId,
          AESKeyOfUser: AESKey,
        },
        background,
        chatColor,
      };

      return res
        .status(200)
        .json({ data: response, message: "Chat already exists" });
    }

    const secretKey = getRandomKey();

    const keys = {};
    [usr, req.user].forEach((ele) => {
      keys[ele._id] = getAESKey(secretKey, ele.publicKey);
    });

    const convo = new Conversation({
      secretKey,
      AESKeyOfUser: keys,
      originType: "chat",
    });

    const newConvo = await convo.save();
    chat = new Chat({
      users,
      conversationId: newConvo._id,
    });
    await chat.save();

    // Fetch the latest message for the conversation (if any)
    const latestMessage = null;

    // Fetch the other user details (who is not the current user)
    const otherUserId = chat.users.find(
      (id) => id.toString() !== req.user.id.toString()
    );

    const otherUserProfile = await User.findById(otherUserId)
      .select("name userName email privacy mediaId avtarId phone countryCode")
      .lean();

    if (!otherUserProfile) {
      console.warn("Chat created, but other user data missing:", otherUserId);
      return res.status(200).json({
        data: {
          _id: chat._id,
          latestMessage: latestMessage || null,
          user: null,
          conversationId: {
            _id: chat.conversationId,
            AESKeyOfUser: null,
          },
        },
        message: "Chat created, but other user profile missing",
      });
    }

    // Fetch avatar and media (if available)
    const [avtar, media, settings, isBlockedRecord] = await Promise.all([
      otherUserProfile.avtarId
        ? Avtar.findById(otherUserProfile.avtarId).lean()
        : null,
      otherUserProfile.mediaId
        ? UserMedia.findById(otherUserProfile.mediaId).lean()
        : null,
      Settings.findOne({
        userId: req.user.id,
        chatId: chat._id,
      }).lean(),
      BlockedUser.findOne({ blockedBy: req.user.id, blockedTo: otherUserId }),
    ]);

    const avtarImage = avtar?.avtarImage
      ? `${process.env.BASE_URL}${avtar.avtarImage}`
      : null;
    const mediaUrl = media?.mediaUrl
      ? `${process.env.BASE_URL}${media.mediaUrl}`
      : null;

    const conversation = newConvo;
    const AESKey =
      conversation?.AESKeyOfUser?.get?.(req.user.id.toString()) || null;

    const userObject = {
      ...otherUserProfile,
      avtarImage,
      mediaUrl,
      isBlocked: !!isBlockedRecord,
    };

    const background = settings?.background || null;
    const chatColor = settings?.chatColor || null;
    // Construct the response with full message details
    const response = {
      _id: chat._id,
      latestMessage: latestMessage || null,
      user: userObject,
      conversationId: {
        _id: chat.conversationId,
        AESKeyOfUser: AESKey,
      },
      background,
      chatColor,
    };

    return res
      .status(200)
      .json({ data: response, message: "Chat created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error creating chat" });
  }
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


async function getAllChatUsers(req, res) {
  try {
    let { search = "", page = 1, limit = 10 } = req.query;
    // const searchRegex = search;
    const searchRegex = escapeRegExp(search.trim());

    const userId = req.user.id;
    limit = Number(limit);

    // Common stages
    const matchStage = { $match: { users: userId } };

    const lookupUsersStage = {
      $lookup: {
        from: "User",
        localField: "users",
        foreignField: "_id",
        as: "allUsers",
      },
    };

    const lookupMessageStage = {
      $lookup: {
        from: "messages",
        let: { convId: "$conversationId", userId: userId },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$conversationId", "$$convId"] },
                  { $in: ["$$userId", "$recievedBy"] },
                  { $not: { $in: ["$$userId", "$seenBy"] } },
                  { $eq: ["$isDeleted", false] },
                  { $eq: ["$isSent", true] },
                  { $lte: ["$sentTime", new Date()] },
                ],
              },
            },
          },
        ],
        as: "messageCount",
      },
    };

    const addMessageCount = {
      $addFields: {
        unseenMessageCount: { $size: "$messageCount" },
      },
    };

    const projectAllUsersFields = {
      $addFields: {
        allUsers: {
          $map: {
            input: "$allUsers",
            as: "user",
            in: {
              _id: "$$user._id",
              name: "$$user.name",
              userName: "$$user.userName",
              email: "$$user.email",
              privacy: "$$user.privacy",
              mediaId: "$$user.mediaId",
              avtarId: "$$user.avtarId",
              about: "$$user.about",
              phone: "$$user.phone",
              countryCode: "$$user.countryCode",
            },
          },
        },
      },
    };

    const lookUpBlock = {
      $lookup: {
        from: "blockedusers",
        let: { blockedBy: userId, blockedTo: "$user._id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$blockedBy", "$$blockedBy"] },
                  { $eq: ["$blockedTo", "$$blockedTo"] },
                ],
              },
            },
          },
        ],
        as: "blockedUser",
      },
    };

    const markIfBlocked = {
      $addFields: {
        "user.isBlocked": {
          $ne: [{ $size: "$blockedUser" }, 0],
        },
      },
    };

    const filterOtherUsersStage = {
      $addFields: {
        otherUsers: {
          $filter: {
            input: "$allUsers",
            as: "user",
            cond: { $ne: ["$$user._id", userId] },
          },
        },
      },
    };

    const unwindOtherUserStage = {
      $unwind: { path: "$otherUsers", preserveNullAndEmptyArrays: true },
    };

    const searchStage = {
      $match: {
        $or: [
          { "otherUsers.name": { $regex: searchRegex, $options: "i" } },
          { "otherUsers.userName": { $regex: searchRegex, $options: "i" } },
          { "otherUsers.email": { $regex: searchRegex, $options: "i" } },
        ],
      },
    };

    // Flatten mediaId
    const exposeMediaId = {
      $addFields: {
        mediaId: "$otherUsers.mediaId",
      },
    };

    const lookupUserMedia = {
      $lookup: {
        from: "UserMedia",
        localField: "mediaId",
        foreignField: "_id",
        as: "media",
      },
    };

    const unwindUserMedia = {
      $unwind: {
        path: "$media",
        preserveNullAndEmptyArrays: true,
      },
    };

    const addMediaToUser = {
      $addFields: {
        user: {
          $cond: [
            { $gt: [{ $type: "$media" }, "missing"] },
            { $mergeObjects: ["$otherUsers", { media: "$media" }] },
            "$otherUsers",
          ],
        },
      },
    };

    const addMediaUrl = {
      $addFields: {
        "user.mediaUrl": {
          $cond: [
            { $ifNull: ["$media.mediaUrl", false] },
            { $concat: [process.env.BASE_URL, "$media.mediaUrl"] },
            null,
          ],
        },
      },
    };

    // Flatten avatarId
    const exposeAvatarId = {
      $addFields: {
        avatarId: "$otherUsers.avtarId",
      },
    };

    const lookupUserAvatar = {
      $lookup: {
        from: "Avtar",
        localField: "avatarId",
        foreignField: "_id",
        as: "avatar",
      },
    };

    const unwindUserAvatar = {
      $unwind: {
        path: "$avatar",
        preserveNullAndEmptyArrays: true,
      },
    };
    const addAvtarUrl = {
      $addFields: {
        "user.avtarImage": {
          $cond: [
            { $ifNull: ["$avatar.avtarImage", false] },
            { $concat: [process.env.BASE_URL, "$avatar.avtarImage"] },
            null,
          ],
        },
      },
    };

    const lookupLatestMessage = {
      $lookup: {
        from: "messages",
        let: { convId: "$conversationId", userId: userId }, // Assuming this pipeline is on a conversation model where _id = conversationId
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$conversationId", "$$convId"] },
                  { $in: ["$$userId", "$recievedBy"] },
                  { $eq: ["$isDeleted", false] },
                  { $lte: ["$sentTime", new Date()] },
                  {
                    $or: [
                      { $eq: ["$isSent", true] },
                      { $eq: ["$isSent", null] },
                    ],
                  },
                ],
              },
            },
          },
          { $sort: { sentTime: -1 } },
          { $limit: 1 },
          {
            $lookup: {
              from: "media",
              localField: "mediaId",
              foreignField: "_id",
              as: "mediaInfo",
            },
          },
          {
            $addFields: {
              fileType: {
                $ifNull: [{ $arrayElemAt: ["$mediaInfo.fileType", 0] }, ""],
              },
            },
          },
          {
            $project: {
              mediaInfo: 0,
            },
          },
        ],
        as: "latestMessage",
      },
    };

    const unwindLatest = {
      $unwind: {
        path: "$latestMessage",
        preserveNullAndEmptyArrays: true,
      },
    };

    const addSortField = {
      $addFields: {
        sortTime: {
          $ifNull: ["$latestMessage.sentTime", "$createdAt"],
        },
      },
    };

    const sort = {
      $sort: { sortTime: -1 },
    };

    const ensureLatestMessageField = {
      $addFields: {
        latestMessage: {
          $ifNull: ["$latestMessage", {}],
        },
      },
    };

    const cleanSeenByAndRecievedBy = {
      $addFields: {
        "latestMessage.seenBy": {
          $cond: [
            { $and: [
                { $ne: ["$latestMessage", {}] },
                { $isArray: "$latestMessage.seenBy" }
            ]},
            {
              $filter: {
                input: "$latestMessage.seenBy",
                as: "id",
                cond: { $ne: ["$$id", null] }
              }
            },
            "$$REMOVE"
          ]
        },
        "latestMessage.recievedBy": {
          $cond: [
            { $and: [
                { $ne: ["$latestMessage", {}] },
                { $isArray: "$latestMessage.recievedBy" }
            ]},
            {
              $filter: {
                input: "$latestMessage.recievedBy",
                as: "id",
                cond: { $ne: ["$$id", null] }
              }
            },
            "$$REMOVE"
          ]
        }
      }
    };

    const lookupConversation = {
      $lookup: {
        from: "Conversation",
        let: { convId: "$conversationId" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$convId"] },
            },
          },
          {
            $project: {
              _id: 1,
              AESKeyOfUser: 1,
            },
          },
        ],
        as: "conversation",
      },
    };

    const unwindConversation = {
      $unwind: { path: "$conversation", preserveNullAndEmptyArrays: true },
    };

    const extractAESKey = {
      $addFields: {
        AESKey: {
          $getField: {
            field: userId.toString(),
            input: "$conversation.AESOfUser",
          },
        },
      },
    };

    const replaceOtherAsUsers = {
      $addFields: {
        user: "$user", // already merged and updated
      },
    };

    const projectStage = {
      $project: {
        user: 1,
        latestMessage: 1,
        conversation: 1,
        createdAt: 1,
        AESKey: 1,
        background: "$settings.background",
        chatColor: "$settings.chatColor",
        muteNotification: "$settings.muteNotification",
        unseenMessageCount: 1,
        sortTime: 1,
      },
    };

    const lookupSettingsStage = {
      $lookup: {
        from: "settings", // collection name in MongoDB (should be lowercase)
        let: { chatId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$chatId", "$$chatId"] },
                  { $eq: ["$userId", new mongoose.Types.ObjectId(userId)] },
                ],
              },
            },
          },
          {
            $project: {
              background: 1,
              chatColor: 1,
              muteNotification: 1,
            },
          },
        ],
        as: "settings",
      },
    };

    const unwindSettingsStage = {
      $unwind: {
        path: "$settings",
        preserveNullAndEmptyArrays: true,
      },
    };

    // Final aggregation pipeline
    const dataPipeline = [
      matchStage,

      lookupUsersStage,
      projectAllUsersFields,
      filterOtherUsersStage,
      unwindOtherUserStage,
      ...(search ? [searchStage] : []),
      exposeMediaId,
      lookupUserMedia,
      unwindUserMedia,
      lookupMessageStage,
      addMessageCount,
      addMediaToUser,
      addMediaUrl,
      exposeAvatarId,
      lookupUserAvatar,
      unwindUserAvatar,
      // addAvatarToUser,
      addAvtarUrl,
      lookUpBlock,
      markIfBlocked,
      lookupLatestMessage,
      unwindLatest,
      addSortField,
      sort,
      { $skip: (page - 1) * limit },
      { $limit: limit },
      lookupConversation,
      unwindConversation,
      extractAESKey,
      replaceOtherAsUsers,
      lookupSettingsStage,
      unwindSettingsStage,
      projectStage,
    ];

    // Count pipeline
    const countPipeline = [
      matchStage,
      lookupUsersStage,
      projectAllUsersFields,
      filterOtherUsersStage,
      ...(search ? [searchStage] : []), // Only include if search is true
      { $count: "total" },
    ];

    let [data, countResult] = await Promise.all([
      Chat.aggregate(dataPipeline),
      Chat.aggregate(countPipeline),
    ]);

    data = data.map((ele) => {
      ele.conversationId = ele.conversation;
      delete ele.conversation;
      ele.conversationId.AESKeyOfUser =
        ele.conversationId.AESKeyOfUser[userId.toString()];
      return ele;
    });

    const totalCount = countResult[0]?.total || 0;

    return res.status(200).json({
      data: data,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalCount / limit),
        totalRecords: totalCount,
      },
    });
  } catch (error) {
    console.error("Error fetching chat users:", error);
    res.status(500).json({ error: "Error fetching chat" });
  }
}

async function getChatById(req, res) {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ error: "Invalid chat ID" });
    }

    const matchStage = {
      $match: {
        _id: new mongoose.Types.ObjectId(chatId),
        users: new mongoose.Types.ObjectId(userId),
      },
    };

    const lookupUsersStage = {
      $lookup: {
        from: "User",
        localField: "users",
        foreignField: "_id",
        as: "allUsers",
      },
    };

    const projectAllUsersFields = {
      $addFields: {
        allUsers: {
          $map: {
            input: "$allUsers",
            as: "user",
            in: {
              _id: "$$user._id",
              name: "$$user.name",
              userName: "$$user.userName",
              email: "$$user.email",
              privacy: "$$user.privacy",
              mediaId: "$$user.mediaId",
              avtarId: "$$user.avtarId",
              about: "$$user.about",
              phone: "$$user.phone",
              countryCode: "$$user.countryCode",
            },
          },
        },
      },
    };

    const filterOtherUsersStage = {
      $addFields: {
        otherUsers: {
          $filter: {
            input: "$allUsers",
            as: "user",
            cond: { $ne: ["$$user._id", new mongoose.Types.ObjectId(userId)] },
          },
        },
      },
    };

    const unwindOtherUserStage = {
      $unwind: { path: "$otherUsers", preserveNullAndEmptyArrays: true },
    };

    const exposeMediaId = {
      $addFields: {
        mediaId: "$otherUsers.mediaId",
      },
    };

    const lookupUserMedia = {
      $lookup: {
        from: "UserMedia",
        localField: "mediaId",
        foreignField: "_id",
        as: "media",
      },
    };

    const unwindUserMedia = {
      $unwind: { path: "$media", preserveNullAndEmptyArrays: true },
    };

    const lookupMessageStage = {
      $lookup: {
        from: "messages",
        let: { convId: "$conversationId", userId: new mongoose.Types.ObjectId(userId) },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$conversationId", "$$convId"] },
                  { $in: ["$$userId", "$recievedBy"] },
                  { $not: { $in: ["$$userId", "$seenBy"] } },
                  { $eq: ["$isDeleted", false] },
                  { $eq: ["$isSent", true] },
                  { $lte: ["$sentTime", new Date()] },
                ],
              },
            },
          },
        ],
        as: "messageCount",
      },
    };

    const addMessageCount = {
      $addFields: {
        unseenMessageCount: { $size: "$messageCount" },
      },
    };

    const addMediaToUser = {
      $addFields: {
        user: {
          $cond: [
            { $gt: [{ $type: "$media" }, "missing"] },
            { $mergeObjects: ["$otherUsers", { media: "$media" }] },
            "$otherUsers",
          ],
        },
      },
    };

    const addMediaUrl = {
      $addFields: {
        "user.mediaUrl": {
          $cond: [
            { $ifNull: ["$media.mediaUrl", false] },
            { $concat: [process.env.BASE_URL, "$media.mediaUrl"] },
            null,
          ],
        },
      },
    };

    const exposeAvatarId = {
      $addFields: {
        avatarId: "$otherUsers.avtarId",
      },
    };

    const lookupUserAvatar = {
      $lookup: {
        from: "Avtar",
        localField: "avatarId",
        foreignField: "_id",
        as: "avatar",
      },
    };

    const unwindUserAvatar = {
      $unwind: { path: "$avatar", preserveNullAndEmptyArrays: true },
    };

    const addAvtarUrl = {
      $addFields: {
        "user.avtarImage": {
          $cond: [
            { $ifNull: ["$avatar.avtarImage", false] },
            { $concat: [process.env.BASE_URL, "$avatar.avtarImage"] },
            null,
          ],
        },
      },
    };

    const lookUpBlock = {
      $lookup: {
        from: "blockedusers",
        let: { blockedBy: new mongoose.Types.ObjectId(userId), blockedTo: "$user._id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$blockedBy", "$$blockedBy"] },
                  { $eq: ["$blockedTo", "$$blockedTo"] },
                ],
              },
            },
          },
        ],
        as: "blockedUser",
      },
    };

    const markIfBlocked = {
      $addFields: {
        "user.isBlocked": { $ne: [{ $size: "$blockedUser" }, 0] },
      },
    };

    const lookupLatestMessage = {
      $lookup: {
        from: "messages",
        let: { convId: "$conversationId", userId: new mongoose.Types.ObjectId(userId) },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$conversationId", "$$convId"] },
                  { $in: ["$$userId", "$recievedBy"] },
                  { $eq: ["$isDeleted", false] },
                  { $lte: ["$sentTime", new Date()] },
                  {
                    $or: [
                      { $eq: ["$isSent", true] },
                      { $eq: ["$isSent", null] },
                    ],
                  },
                ],
              },
            },
          },
          { $sort: { sentTime: -1 } },
          { $limit: 1 },
          {
            $lookup: {
              from: "media",
              localField: "mediaId",
              foreignField: "_id",
              as: "mediaInfo",
            },
          },
          {
            $addFields: {
              fileType: {
                $ifNull: [{ $arrayElemAt: ["$mediaInfo.fileType", 0] }, ""],
              },
            },
          },
          {
            $project: {
              mediaInfo: 0,
            },
          },
        ],
        as: "latestMessage",
      },
    };

    const unwindLatest = {
      $unwind: { path: "$latestMessage", preserveNullAndEmptyArrays: true },
    };

    const addSortField = {
      $addFields: {
        sortTime: {
          $ifNull: ["$latestMessage.sentTime", "$createdAt"],
        },
      },
    };

    const lookupConversation = {
      $lookup: {
        from: "Conversation",
        let: { convId: "$conversationId" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$convId"] },
            },
          },
          {
            $project: {
              _id: 1,
              AESKeyOfUser: 1,
            },
          },
        ],
        as: "conversation",
      },
    };

    const unwindConversation = {
      $unwind: { path: "$conversation", preserveNullAndEmptyArrays: true },
    };

    const extractAESKey = {
      $addFields: {
        AESKey: {
          $getField: {
            field: userId.toString(),
            input: "$conversation.AESKeyOfUser",
          },
        },
      },
    };

    const lookupSettingsStage = {
      $lookup: {
        from: "settings",
        let: { chatId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$chatId", "$$chatId"] },
                  { $eq: ["$userId", new mongoose.Types.ObjectId(userId)] },
                ],
              },
            },
          },
          {
            $project: {
              background: 1,
              chatColor: 1,
              muteNotification: 1,
            },
          },
        ],
        as: "settings",
      },
    };

    const unwindSettingsStage = {
      $unwind: {
        path: "$settings",
        preserveNullAndEmptyArrays: true,
      },
    };

    const replaceOtherAsUsers = {
      $addFields: {
        user: "$user",
      },
    };

    const projectStage = {
      $project: {
        user: 1,
        latestMessage: 1,
        conversation: 1,
        createdAt: 1,
        AESKey: 1,
        background: "$settings.background",
        chatColor: "$settings.chatColor",
        muteNotification: "$settings.muteNotification",
        unseenMessageCount: 1,
        sortTime: 1,
      },
    };

    const pipeline = [
      matchStage,
      lookupUsersStage,
      projectAllUsersFields,
      filterOtherUsersStage,
      unwindOtherUserStage,
      exposeMediaId,
      lookupUserMedia,
      unwindUserMedia,
      lookupMessageStage,
      addMessageCount,
      addMediaToUser,
      addMediaUrl,
      exposeAvatarId,
      lookupUserAvatar,
      unwindUserAvatar,
      addAvtarUrl,
      lookUpBlock,
      markIfBlocked,
      lookupLatestMessage,
      unwindLatest,
      addSortField,
      lookupConversation,
      unwindConversation,
      extractAESKey,
      replaceOtherAsUsers,
      lookupSettingsStage,
      unwindSettingsStage,
      projectStage,
    ];

    let data = await Chat.aggregate(pipeline);

    if (!data.length) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const chat = data[0];
    chat.conversationId = chat.conversation;
    delete chat.conversation;
    chat.conversationId.AESKeyOfUser = chat.AESKey;

    return res.status(200).json({ data: chat });
  } catch (error) {
    console.error("Error in getChatById:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}



module.exports = {
  createChat,
  getAllChatUsers,
  getChatById
};
