const { default: slugify } = require("slugify");
const ChannelModal = require("../models/Channel");
const AvtarModal = require("../models/Avtar");
const UserMediaModal = require("../models/UserMedia");
const MessageMediaModal = require("../models/MessageMedia");
const { getRandomKey, getAESKey } = require("../utils/encryption");
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const { getIO, emitUpdateEvent } = require("../socket/socket");
const mongoose = require("mongoose");
const { sendNotificationToAddUserInGroup } = require("../utils/notification");

async function seenMessageForDeleteUser(conversationId, userIdsToRemove) {
  try {
    await Message.updateMany(
      {
        conversationId: conversationId,
        $or: [
          { recievedBy: { $in: userIdsToRemove } },
          { seenBy: { $in: userIdsToRemove } },
        ],
      },
      {
        $pull: {
          recievedBy: { $in: userIdsToRemove },
          seenBy: { $in: userIdsToRemove },
        },
      }
    );

    const io = getIO();

    const messagesToUpdate = await Message.find({
      conversationId: conversationId,
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
      const event = `CONVERSATION__${conversationId.toString()}`;
      io.to(event).emit("seen-message", { messages: messageIds });
    }
  } catch (err) {
    console.log("Err making msg seen...", err);
  }
}

async function getSlug(req, res) {
  try {
    const { channelName } = req.query;

    if (!channelName) {
      return res.status(400).json({ message: "channel name is required" });
    }
    const randomDigit = Math.random().toString(36).substr(2, 3);
    const slug = slugify(channelName);

    return res.status(200).json({ data: `${slug}-${randomDigit}` });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error getting slug." });
  }
}

async function createChannel(req, res) {
  try {
    const userId = req.user._id;
    const { channelName, description, users, isPublic, slug } = req.body;

    if (!channelName) {
      return res.status(400).json({ message: "Channel name is required" });
    }

    const currentUserId = req.user.id;

    // Parse users input (comma separated) and filter out empty strings
    let userIds = [];
    if (users) {
      userIds = users
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id && id !== currentUserId); // remove duplicates and admin
    }

    // Handle media if provided
    let mediaId = null;
    let channelImage = "";
    if (req.files?.messageMedia?.length > 0) {
      const file = req.files.messageMedia[0];

      channelImage = `${process.env.MESSAGE_MEDIA_ROUTE}${file.filename}`;

      const media = new MessageMediaModal({
        userId: currentUserId,
        fileType: "image",
        fileUrl: channelImage,
        fileSize: file.size,
      });

      const newMedia = await media.save();
      mediaId = newMedia._id;
    }

    const secretKey = getRandomKey();

    const keys = {};

    const allUsers = await User.find({
      _id: { $in: [...userIds, currentUserId] },
    }).select("publicKey");

    if (allUsers.length != [...userIds, currentUserId].length)
      return res.status(400).json({ message: "User not found" });

    allUsers.forEach((ele) => {
      keys[ele._id] = getAESKey(secretKey, ele.publicKey);
    });

    const convo = new Conversation({
      secretKey,
      AESKeyOfUser: keys,
      originType: "channel",
    });

    const newConvo = await convo.save();

    // Create Channel (adminId is only current user, users array does not include admin)
    const channel = new ChannelModal({
      channelName,
      adminId: [currentUserId],
      description: description || "",
      users: [...userIds, currentUserId],
      mediaId,
      isPublic: isPublic == "true",
      isDeleted: false,
      conversationId: newConvo._id,
      slug,
    });

    const newChannel = await channel.save();
    // emitRefreshEvent(notifyUsers, 'Channel', newChannel._id, newChannel);
    const enrichedChannel = await ChannelModal.aggregate([
      { $match: { _id: newChannel._id } },

      // Admin Info
      {
        $lookup: {
          from: "User",
          let: { userIds: "$adminId" },
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", "$$userIds"] },
              },
            },
            {
              $lookup: {
                from: "UserMedia",
                localField: "mediaId",
                foreignField: "_id",
                as: "mediaId",
              },
            },
            {
              $lookup: {
                from: "Avtar",
                localField: "avtarId",
                foreignField: "_id",
                as: "avtarId",
              },
            },
            { $unwind: { path: "$mediaId", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$avtarId", preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 1,
                name: 1,
                email: 1,
                phone: 1,
                countryCode: 1,
                privacy: 1,
                about: 1,
                userImageUrl: {
                  $cond: {
                    if: { $ne: ["$mediaId", null] },
                    then: {
                      $concat: [process.env.BASE_URL, "$mediaId.mediaUrl"],
                    },
                    else: null,
                  },
                },
                avtarImageUrl: {
                  $cond: {
                    if: { $ne: ["$avtarId", null] },
                    then: {
                      $concat: [process.env.BASE_URL, "$avtarId.avtarImage"],
                    },
                    else: null,
                  },
                },
              },
            },
          ],
          as: "adminId",
        },
      },

      // Users Info
      {
        $lookup: {
          from: "User",
          let: { userIds: "$users" },
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", "$$userIds"] },
              },
            },
            {
              $lookup: {
                from: "UserMedia",
                localField: "mediaId",
                foreignField: "_id",
                as: "mediaId",
              },
            },
            {
              $lookup: {
                from: "Avtar",
                localField: "avtarId",
                foreignField: "_id",
                as: "avtarId",
              },
            },
            { $unwind: { path: "$mediaId", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$avtarId", preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 1,
                name: 1,
                email: 1,
                phone: 1,
                countryCode: 1,
                privacy: 1,
                about: 1,
                userImage: {
                  $cond: {
                    if: { $ne: ["$mediaId", null] },
                    then: {
                      $concat: [process.env.BASE_URL, "$mediaId.mediaUrl"],
                    },
                    else: null,
                  },
                },
                avtarImage: {
                  $cond: {
                    if: { $ne: ["$avtarId", null] },
                    then: {
                      $concat: [process.env.BASE_URL, "$avtarId.avtarImage"],
                    },
                    else: null,
                  },
                },
              },
            },
          ],
          as: "users",
        },
      },

      // Media Lookup
      {
        $lookup: {
          from: "media",
          let: { mdId: "$mediaId" },
          pipeline: [
            {
              $match: { $expr: { $eq: ["$_id", "$$mdId"] } },
            },
            {
              $project: {
                _id: 1,
                fileUrl: 1,
                fileType: 1,
                imageUrl: {
                  $cond: {
                    if: { $ne: ["$fileUrl", null] },
                    then: {
                      $concat: [process.env.BASE_URL, "$fileUrl"],
                    },
                    else: null,
                  },
                },
              },
            },
          ],
          as: "mediaId",
        },
      },
      { $unwind: { path: "$mediaId", preserveNullAndEmptyArrays: true } },

      // Avtar lookup (optional for channels)
      {
        $lookup: {
          from: "avtars",
          localField: "avtarId",
          foreignField: "_id",
          as: "avtarId",
        },
      },
      { $unwind: { path: "$avtarId", preserveNullAndEmptyArrays: true } },

      // Conversation AES Key
      {
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
          as: "conversationId",
        },
      },
      {
        $unwind: { path: "$conversationId", preserveNullAndEmptyArrays: true },
      },

      // Latest message (optional)
      {
        $lookup: {
          from: "messages",
          let: { convId: "$conversationId._id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$conversationId", "$$convId"] },
                    { $in: [userId, "$recievedBy"] },
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
      },
      {
        $unwind: { path: "$latestMessage", preserveNullAndEmptyArrays: true },
      },
      {
        $addFields: {
          sortTime: {
            $ifNull: ["$latestMessage.sentTime", "$createdAt"],
          },
        },
      },
      {
        $sort: { sortTime: -1 },
      },
      // Final projection
      {
        $project: {
          messageCount: 0,
        },
      },
    ]);

    userIds.map((userId) => {
      let newDetails = JSON.parse(JSON.stringify(enrichedChannel[0]));
      newDetails.conversationId.AESKeyOfUser =
        newDetails?.conversationId?.AESKeyOfUser?.[String(userId)];
      emitUpdateEvent([userId], "channel", enrichedChannel[0]._id, newDetails);
    });

    sendNotificationToAddUserInGroup(
      userIds,
      currentUserId,
      newChannel._id,
      "channel",
      req.user.name
    );

    const details = JSON.parse(JSON.stringify(enrichedChannel[0]));
    details.conversationId.AESKeyOfUser =
      details?.conversationId?.AESKeyOfUser?.[String(currentUserId)];
    emitUpdateEvent(
      [currentUserId],
      "channel",
      enrichedChannel[0]._id,
      details
    );

    res.status(201).json({
      data: details,
      message: "Channel created successfully",
    });
  } catch (error) {
    if (error.message.includes("duplicate key error")) {
      return res.status(400).json({
        message: "Channel with this slug already exists",
      });
    }
    console.error("Error creating Channel:", error);
    res.status(500).json({ error: "Error creating Channel" });
  }
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function getUserChannels(req, res) {
  try {
    const userId = req.user.id;

    const { search, page = 1, limit = 10 } = req.query;

    const searchClause = {
      isDeleted: false,
      $or: [{ users: userId }, { adminId: userId }],
      reportedBy: { $ne: userId },
    };
    if (search) {
      const escapedSearch = escapeRegExp(search.trim());

      searchClause.channelName = { $regex: escapedSearch, $options: "i" };
      searchClause["$or"] = [
        { users: userId },
        { adminId: userId },
        { isPublic: true },
      ];
    }

    const channelsPromise = ChannelModal.aggregate([
      { $match: searchClause },
      // { $sort: { updatedAt: -1 } },
      // Lookup users in the channel
      {
        $lookup: {
          from: "User",
          let: { userIds: "$users" },
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", "$$userIds"] },
              },
            },
            {
              $lookup: {
                from: "UserMedia",
                localField: "mediaId",
                foreignField: "_id",
                as: "mediaId",
              },
            },
            {
              $lookup: {
                from: "Avtar",
                localField: "avtarId",
                foreignField: "_id",
                as: "avtarId",
              },
            },
            {
              $unwind: { path: "$mediaId", preserveNullAndEmptyArrays: true },
            },
            {
              $unwind: { path: "$avtarId", preserveNullAndEmptyArrays: true },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                email: 1,
                phone: 1,
                countryCode: 1,
                privacy: 1,
                about: 1,
                userImage: {
                  $cond: {
                    if: { $ne: ["$mediaId", null] },
                    then: {
                      $concat: [process.env.BASE_URL, "$mediaId.mediaUrl"],
                    },
                    else: null,
                  },
                },
                avtarImage: {
                  $cond: {
                    if: { $ne: ["$avtarId", null] },
                    then: {
                      $concat: [process.env.BASE_URL, "$avtarId.avtarImage"],
                    },
                    else: null,
                  },
                },
              },
            },
          ],
          as: "users",
        },
      },

      {
        $lookup: {
          from: "User",
          let: { userIds: "$adminId" },
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", "$$userIds"] },
              },
            },
            {
              $lookup: {
                from: "UserMedia",
                localField: "mediaId",
                foreignField: "_id",
                as: "mediaId",
              },
            },
            {
              $lookup: {
                from: "Avtar",
                localField: "avtarId",
                foreignField: "_id",
                as: "avtarId",
              },
            },
            {
              $unwind: { path: "$mediaId", preserveNullAndEmptyArrays: true },
            },
            {
              $unwind: { path: "$avtarId", preserveNullAndEmptyArrays: true },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                email: 1,
                phone: 1,
                countryCode: 1,
                privacy: 1,
                about: 1,
                userImageUrl: {
                  $cond: {
                    if: { $ne: ["$mediaId", null] },
                    then: {
                      $concat: [process.env.BASE_URL, "$mediaId.mediaUrl"],
                    },
                    else: null,
                  },
                },
                avtarImageUrl: {
                  $cond: {
                    if: { $ne: ["$avtarId", null] },
                    then: {
                      $concat: [process.env.BASE_URL, "$avtarId.avtarImage"],
                    },
                    else: null,
                  },
                },
              },
            },
          ],
          as: "adminId",
        },
      },
      // Lookup media
      {
        $lookup: {
          from: "media",
          let: { mdId: "$mediaId" },
          pipeline: [
            {
              $match: { $expr: { $eq: ["$_id", "$$mdId"] } },
            },
            {
              $project: {
                _id: 1,
                fileUrl: 1,
                fileType: 1,
                imageUrl: {
                  $cond: {
                    if: { $ne: ["$fileUrl", null] },
                    then: {
                      $concat: [process.env.BASE_URL, "$fileUrl"],
                    },
                    else: null,
                  },
                },
              },
            },
          ],
          as: "mediaId",
        },
      },
      { $unwind: { path: "$mediaId", preserveNullAndEmptyArrays: true } },

      // Lookup avatar
      {
        $lookup: {
          from: "avtars",
          localField: "avtarId",
          foreignField: "_id",
          as: "avtarId",
        },
      },
      { $unwind: { path: "$avtarId", preserveNullAndEmptyArrays: true } },

      // Lookup conversation
      {
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
                AESKeyOfUser: {
                  $getField: {
                    input: "$AESKeyOfUser",
                    field: userId.toString(),
                  },
                },
              },
            },
          ],
          as: "conversationId",
        },
      },
      {
        $unwind: { path: "$conversationId", preserveNullAndEmptyArrays: true },
      },

      // Lookup unseen messages for user
      {
        $lookup: {
          from: "messages",
          let: { convId: "$conversationId._id", userId: userId },
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
      },

      // Add unseen message count
      {
        $addFields: {
          unseenMessageCount: { $size: "$messageCount" },
        },
      },

      // Add latest message
      {
        $lookup: {
          from: "messages",
          let: { convId: "$conversationId._id", userId: userId },
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
      },
      {
        $unwind: { path: "$latestMessage", preserveNullAndEmptyArrays: true },
      },
      {
        $addFields: {
          latestMessage: {
            $ifNull: ["$latestMessage", {}],
          },
        },
      },
      {
        $addFields: {
          sortTime: {
            $ifNull: ["$latestMessage.sentTime", "$createdAt"],
          },
        },
      },
      {
        $sort: { sortTime: -1 },
      },
      { $skip: (page - 1) * limit },
      { $limit: Number(limit) },
      {
        $project: {
          messageCount: 0,
        },
      },
    ]);

    // const channelsPromise = ChannelModal.find({
    //   isDeleted: false,
    //   ...searchClause,
    // })
    //   .sort({ updatedAt: -1 })
    //   .limit(limit)
    //   .skip((page - 1) * limit)
    //   .populate("conversationId", "AESKeyOfUser")
    //   .populate("adminId", "name email")
    //   .populate({
    //     path: "users",
    //     select: "name email phone countryCode mediaId avtarId privacy about",
    //     populate: [
    //       { path: "mediaId", select: "mediaUrl" },
    //       { path: "avtarId", select: "avtarImage" },
    //     ],
    //   })
    //   .populate("mediaId")
    //   .populate("latestMessage");

    const totalRecordsPromise = ChannelModal.countDocuments({
      isDeleted: false,
      $or: [{ users: userId }, { adminId: userId }, { isPublic: true }],
      ...searchClause,
    });

    const [channels, totalRecords] = await Promise.all([
      channelsPromise,
      totalRecordsPromise,
    ]);

    // const channelsWithFullImageUrl = channels.map((channel) => {
    //   const channelObj = channel.toObject();
    //   if (channelObj.mediaId && channelObj.mediaId.fileUrl) {
    //     channelObj.mediaId.imageUrl = `${process.env.BASE_URL}${channelObj.mediaId.fileUrl}`;
    //     // Remove fileUrl from mediaId
    //     delete channelObj.mediaId.fileUrl;
    //   } else if (channelObj.mediaId) {
    //     channelObj.mediaId.imageUrl = null; // Set imageUrl to null if mediaId exists but no fileUrl
    //   }

    //   channelObj.conversationId.AESKeyOfUser =
    //     channelObj?.conversationId?.AESKeyOfUser.get(userId.toString());

    //   channelObj.users = (channelObj.users || []).map((user) => {
    //     const avtarImage = user.avtarId?.avtarImage
    //       ? `${process.env.BASE_URL}${user.avtarId.avtarImage}`
    //       : null;

    //     const mediaImage = user.mediaId?.mediaUrl
    //       ? `${process.env.BASE_URL}${user.mediaId.mediaUrl}`
    //       : null;

    //     return {
    //       _id: user._id,
    //       name: user.name,
    //       email: user.email,
    //       phone: user.phone,
    //       countryCode: user.countryCode,
    //       privacy: user.privacy,
    //       avtarImage,
    //       userImage: mediaImage || null,
    //       about: user.about,
    //     };
    //   });

    //   return channelObj;
    // });

    res.status(200).json({
      data: channels,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalRecords / limit),
        totalRecords: totalRecords,
      },
    });
  } catch (err) {
    console.error("Error fetching Channels:", err);
    res.status(500).json({ error: "Could not fetch Channel list" });
  }
}

async function deleteChannel(req, res) {
  try {
    const channelId = req.params.channelId;
    const userId = req.user.id;

    const channel = await ChannelModal.findById(channelId);

    if (!channel || channel.isDeleted) {
      return res.status(404).json({ message: "Channel not found" });
    }

    if (!channel.adminId.includes(userId)) {
      return res
        .status(403)
        .json({ message: "Only admin can delete the Channel" });
    }

    channel.isDeleted = true;
    await channel.save();

    emitUpdateEvent(channel.users, "channel", channelId, { deleted: true });

    // emitRefreshEvent(Channel.users, 'Channel_DELETED', ChannelId, Channel);

    res.status(200).json({ message: "Channel deleted successfully" });
  } catch (err) {
    console.error("Delete Channel error:", err);
    res.status(500).json({ error: "Failed to delete Channel" });
  }
}

async function addUserInChannel(req, res) {
  try {
    const { channelId } = req.params;
    const { users } = req.body;
    const userId = req.user.id;

    const channel = await ChannelModal.findById(channelId);

    if (!channel || channel.isDeleted) {
      return res.status(404).json({ message: "Channel not found" });
    }

    if (!channel.adminId.includes(userId)) {
      return res
        .status(403)
        .json({ message: "Only admin can update the channel" });
    }

    const conversation = await Conversation.findById(
      channel.conversationId
    ).select("secretKey AESKeyOfUser");

    const usrs = await User.find({
      _id: { $in: users },
    })
      .select("publicKey name email phone countryCode mediaId avtarId privacy about")
      .populate({ path: "mediaId", select: "mediaUrl" })
      .populate({ path: "avtarId", select: "avtarImage" });

    if (users.length != usrs.length)
      return res.status(400).json({ message: "User not found" });

    const usrList = usrs.map((ele) => {
      conversation.AESKeyOfUser.set(
        ele?._id.toString(),
        getAESKey(conversation.secretKey, ele?.publicKey)
      );

      const avtarImage = ele.avtarId?.avtarImage
        ? `${process.env.BASE_URL}${ele.avtarId.avtarImage}`
        : null;

      const userImage = ele.mediaId?.mediaUrl
        ? `${process.env.BASE_URL}${ele.mediaId.mediaUrl}`
        : null;

      return { ...ele.toObject(), avtarImage, userImage };
    });

    await conversation.save();
    channel.users = [
      ...new Set([...users, ...channel.users.map((ele) => ele.toString())]),
    ];
    await channel.save();
    emitUpdateEvent(channel.users, "channel", channel._id, {
      newUsers: usrList,
    });
    sendNotificationToAddUserInGroup(
      users,
      userId,
      channel._id,
      "channel",
      req.user.name
    );

    res.status(200).json({ message: "Channel updated successfully" ,data: usrList });
  } catch (err) {
    console.error("Update channel error:", err);
    res.status(500).json({ error: "Failed to update channel" });
  }
}

async function subscribeChannel(req, res) {
  try {
    const channelId = req.params.channelId;
    const userId = req.user.id;

    const channel = await ChannelModal.findById(channelId);
    const conversation = await Conversation.findById(
      channel.conversationId
    ).select("secretKey AESKeyOfUser");

    if (!channel || channel.isDeleted) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const isUserInChannel = channel.users.some(
      (id) => id.toString() === userId.toString()
    );
    const isAdminInChannel = channel.adminId.some(
      (id) => id.toString() === userId.toString()
    );

    // If user is neither in users nor adminId, reject
    if (isUserInChannel || isAdminInChannel) {
      return res
        .status(400)
        .json({ message: "User already part of this Channel" });
    }

    conversation.AESKeyOfUser.set(
      userId,
      getAESKey(conversation.secretKey, req.user.publicKey)
    );

    await conversation.save();
    // Add from users if present
    channel.users = [userId, ...channel.users];

    await channel.save();
    const usrs = await User.find({
      _id: userId,
      isDeleted: false,
      // isBlocked: false,
    })
      .select("about publicKey name email phone countryCode mediaId avtarId privacy")
      .populate({ path: "mediaId", select: "mediaUrl" })
      .populate({ path: "avtarId", select: "avtarImage" });

    if (!usrs.length)
      return res.status(400).json({ message: "User not found" });

    const usrList = usrs.map((ele) => {
      conversation.AESKeyOfUser.set(
        ele?._id.toString(),
        getAESKey(conversation.secretKey, ele?.publicKey)
      );

      const avtarImage = ele.avtarId?.avtarImage
        ? `${process.env.BASE_URL}${ele.avtarId.avtarImage}`
        : null;

      const userImage = ele.mediaId?.mediaUrl
        ? `${process.env.BASE_URL}${ele.mediaId.mediaUrl}`
        : null;

      return { ...ele.toObject(), avtarImage, userImage };
    });
    emitUpdateEvent(channel.users, "channel", channel._id, {
      newUsers: usrList,
    });

    // emitRefreshEvent(Channel.users, 'Channel_UPDATED', ChannelId, Channel);

    res
      .status(200)
      .json({ message: "Channel subscribed successfully", channel });
  } catch (err) {
    console.error("Leave Channel error:", err);
    res.status(500).json({ error: "Failed to leave Channel" });
  }
}

async function leaveChannel(req, res) {
  try {
    const channelId = req.params.channelId;
    const userId = req.user.id;

    const channel = await ChannelModal.findById(channelId);

    if (!channel || channel.isDeleted) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const isUserInChannel = channel.users.some(
      (id) => id.toString() === userId.toString()
    );
    const isAdminInChannel = channel.adminId.some(
      (id) => id.toString() === userId.toString()
    );

    // If user is neither in users nor adminId, reject
    if (!isUserInChannel && !isAdminInChannel) {
      return res.status(400).json({ message: "User not part of this Channel" });
    }

    // Remove from users if present
    channel.users = channel.users.filter(
      (id) => id.toString() !== userId.toString()
    );

    // Remove from adminId if present
    if (isAdminInChannel) {
      channel.adminId = channel.adminId.filter(
        (id) => id.toString() !== userId.toString()
      );

      // If no admins left but users still exist, promote one
      if (channel.adminId.length === 0 && channel.users.length > 0) {
        const newAdmin = channel.users[0];
        channel.adminId.push(newAdmin);
      }
    }

    // If both arrays are now empty, soft delete
    if (channel.users.length === 0 && channel.adminId.length === 0) {
      channel.isDeleted = true;
    }

    const conversation = await Conversation.findById(
      channel.conversationId
    ).select("AESKeyOfUser");

    conversation.AESKeyOfUser.delete(userId.toString());
    await conversation.save();
    await channel.save();

    seenMessageForDeleteUser(channel.conversationId, [userId]);
    emitUpdateEvent(channel.users, "channel", channel._id, {
      deletedUsers: [userId],
    });
    // emitRefreshEvent(Channel.users, 'Channel_UPDATED', ChannelId, Channel);

    res.status(200).json({ message: "Left Channel successfully", channel });
  } catch (err) {
    console.error("Leave Channel error:", err);
    res.status(500).json({ error: "Failed to leave Channel" });
  }
}

async function updateChannel(req, res) {
  try {
    const { channelId } = req.params;
    const { channelName, description, isPublic } = req.body;
    const userId = req.user.id;

    const channel = await ChannelModal.findById(channelId);

    const newDetails = {};

    if (!channel || channel.isDeleted) {
      return res.status(404).json({ message: "Channel not found" });
    }

    if (!channel.adminId.includes(userId)) {
      return res
        .status(403)
        .json({ message: "Only admin can update the Channel" });
    }

    // if (channelName) {
    //   channel.channelName = channelName;
    //   newDetails.channelName = channelName;
    // }
    // if (channelName && channel.channelName !== channelName) {
    //   const randomDigit = Math.random().toString(36).substr(2, 3);
    //   const slug = `${slugify(channelName)}-${randomDigit}`;
    //   channel.slug = slug;
    //   console.log("data",channel.slug)
    //   newDetails.slug = slug;
    // }
    const originalName = channel.channelName;
    if (channelName && originalName !== channelName) {
      const randomDigit = Math.random().toString(36).substr(2, 3);
      const slug = `${slugify(channelName)}-${randomDigit}`;
      channel.slug = slug;
      newDetails.slug = slug;

      channel.channelName = channelName;
      newDetails.channelName = channelName;
    }
    if (channelName && originalName === channelName) {
      channel.channelName = channelName;
      newDetails.channelName = channelName;
    }
    if (Object.prototype.hasOwnProperty.call(req.body, "description")) {
      channel.description = description;
      newDetails.description = description;
    }
    if (typeof isPublic == "boolean") {
      channel.isPublic = isPublic;
      newDetails.isPublic = isPublic;
    }
    if (typeof isPublic == "string") {
      channel.isPublic = isPublic == "true";
      newDetails.isPublic = isPublic == "true";
    }

    if (req.files?.messageMedia?.length > 0) {
      const file = req.files.messageMedia[0];
      const imageUrl = `${process.env.MESSAGE_MEDIA_ROUTE}${file.filename}`;

      const media = new MessageMediaModal({
        userId,
        fileType: "image",
        fileUrl: imageUrl,
        fileSize: file.size,
      });

      const savedMedia = await media.save();
      channel.mediaId = savedMedia._id;
      newDetails.mediaId = savedMedia.toObject();
      newDetails.mediaId.imageUrl = `${process.env.BASE_URL}${imageUrl}`;
    }

    await channel.save();
    emitUpdateEvent(channel.users, "channel", channel._id, newDetails);

    const updatedChannel = await ChannelModal.findById(channel._id);

    res
      .status(200)
      .json({ message: "Channel updated successfully", data: updatedChannel });
  } catch (err) {
    console.error("Update Channel error:", err);
    res.status(500).json({ error: "Failed to update Channel" });
  }
}

async function getChannelById(req, res) {
  try {
    const userId = req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const channelId = req.params.channelId;

    const channel = await ChannelModal.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(channelId),
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: "User",
          let: { userIds: "$users" },
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", "$$userIds"] },
              },
            },
            {
              $lookup: {
                from: "UserMedia",
                localField: "mediaId",
                foreignField: "_id",
                as: "mediaId",
              },
            },
            {
              $lookup: {
                from: "Avtar",
                localField: "avtarId",
                foreignField: "_id",
                as: "avtarId",
              },
            },
            { $unwind: { path: "$mediaId", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$avtarId", preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 1,
                name: 1,
                email: 1,
                phone: 1,
                countryCode: 1,
                privacy: 1,
                about: 1,
                avatarImage: {
                  $cond: {
                    if: { $ne: ["$avtarId", null] },
                    then: {
                      $concat: [process.env.BASE_URL, "$avtarId.avtarImage"],
                    },
                    else: null,
                  },
                },
                userImage: {
                  $cond: {
                    if: { $ne: ["$mediaId", null] },
                    then: {
                      $concat: [process.env.BASE_URL, "$mediaId.mediaUrl"],
                    },
                    else: null,
                  },
                },
              },
            },
          ],
          as: "users",
        },
      },
      {
        $lookup: {
          from: "User",
          let: { adminIds: "$adminId" },
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", "$$adminIds"] },
              },
            },
            {
              $lookup: {
                from: "UserMedia",
                localField: "mediaId",
                foreignField: "_id",
                as: "mediaId",
              },
            },
            {
              $lookup: {
                from: "Avtar",
                localField: "avtarId",
                foreignField: "_id",
                as: "avtarId",
              },
            },
            { $unwind: { path: "$mediaId", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$avtarId", preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 1,
                name: 1,
                email: 1,
                phone: 1,
                countryCode: 1,
                privacy: 1,
                about: 1,
                avatarImage: {
                  $cond: {
                    if: { $ne: ["$avtarId", null] },
                    then: {
                      $concat: [process.env.BASE_URL, "$avtarId.avtarImage"],
                    },
                    else: null,
                  },
                },
                userImage: {
                  $cond: {
                    if: { $ne: ["$mediaId", null] },
                    then: {
                      $concat: [process.env.BASE_URL, "$mediaId.mediaUrl"],
                    },
                    else: null,
                  },
                },
              },
            },
          ],
          as: "adminId",
        },
      },
      {
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
          as: "unseenMessages",
        },
      },
      {
        $addFields: {
          unseenMessageCount: { $size: "$unseenMessages" },
        },
      },
      {
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
                AESKeyOfUser: {
                  $getField: {
                    field: userId.toString(),
                    input: "$AESKeyOfUser",
                  },
                },
              },
            },
          ],
          as: "conversationId",
        },
      },
      {
        $unwind: { path: "$conversationId", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "messages",
          let: { convId: "$conversationId._id", userId: userId },
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
            { $project: { mediaInfo: 0 } },
          ],
          as: "latestMessage",
        },
      },
      {
        $unwind: { path: "$latestMessage", preserveNullAndEmptyArrays: true },
      },
      {
        $addFields: {
          latestMessage: {
            $ifNull: ["$latestMessage", {}],
          },
        },
      },
      {
        $addFields: {
          sortTime: {
            $ifNull: ["$latestMessage.sentTime", "$createdAt"],
          },
        },
      },
      {
        $lookup: {
          from: "media",
          let: { mdId: "$mediaId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$mdId"] },
              },
            },
            {
              $project: {
                _id: 1,
                fileUrl: 1,
                fileType: 1,
                imageUrl: {
                  $cond: {
                    if: { $ne: ["$fileUrl", null] },
                    then: {
                      $concat: [process.env.BASE_URL, "$fileUrl"],
                    },
                    else: null,
                  },
                },
              },
            },
          ],
          as: "mediaId",
        },
      },
      { $unwind: { path: "$mediaId", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "settings",
          let: { channelId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$channelId", "$$channelId"] },
                    { $eq: ["$userId", userObjectId] },
                  ],
                },
              },
            },
            { $project: { background: 1, chatColor: 1 } },
          ],
          as: "settings",
        },
      },
      {
        $addFields: {
          background: {
            $cond: {
              if: { $gt: [{ $size: "$settings" }, 0] },
              then: { $arrayElemAt: ["$settings.background", 0] },
              else: null,
            },
          },
          chatColor: {
            $cond: {
              if: { $gt: [{ $size: "$settings" }, 0] },
              then: { $arrayElemAt: ["$settings.chatColor", 0] },
              else: null,
            },
          },
        },
      },
      {
        $project: {
          unseenMessages: 0,
          settings: 0,
        },
      },
    ]);

    if (!channel || !channel.length) {
      return res.status(404).json({ error: "Channel not found" });
    }

    return res.status(200).json({ data: channel[0] });
  } catch (err) {
    console.error("Error fetching channel by id:", err);
    return res.status(500).json({ error: "Failed to fetch channel details" });
  }
}

async function removeUserFromChannel(req, res) {
  try {
    const { channelId, userIdToRemove } = req.params;
    const currentUserId = req.user.id;
    const channel = await ChannelModal.findById(channelId);
    const conversation = await Conversation.findById(
      channel.conversationId
    ).select("AESKeyOfUser");

    if (!channel || channel.isDeleted) {
      return res.status(404).json({ message: "Channel not found" });
    }

    if (!channel.adminId.includes(currentUserId)) {
      return res
        .status(403)
        .json({ message: "Only admin can update the Channel" });
    }

    if (!channel.users.map((id) => id.toString()).includes(userIdToRemove)) {
      return res.status(400).json({ message: "User not in this Channel" });
    }

    // Remove from users and adminId if needed
    channel.users = channel.users.filter(
      (id) => id.toString() !== userIdToRemove
    );

    if (channel.adminId.map((id) => id.toString()).includes(userIdToRemove)) {
      channel.adminId = channel.adminId.filter(
        (id) => id.toString() !== userIdToRemove
      );

      if (channel.adminId.length === 0 && channel.users.length > 0) {
        channel.adminId.push(channel.users[0]);
      }
    }

    // If no users and no admins left, soft delete Channel
    if (channel.users.length === 0 && channel.adminId.length === 0) {
      channel.isDeleted = true;
    }

    conversation.AESKeyOfUser.delete(userIdToRemove);

    await conversation.save();
    await channel.save();
    seenMessageForDeleteUser(channel.conversationId, [userIdToRemove]);
    // emitRefreshEvent(Channel.users, 'Channel_UPDATED', ChannelId, Channel);
    emitUpdateEvent(
      [...channel.users, userIdToRemove],
      "channel",
      channel._id,
      {
        deletedUsers: [userIdToRemove],
      }
    );

    res
      .status(200)
      .json({ message: "User removed from channel successfully", channel });
  } catch (err) {
    console.error("Remove user error:", err);
    res.status(500).json({ error: "Failed to remove user from channel" });
  }
}

async function getChannelBySlug(req, res) {
  try {
    const { slug } = req.params;
    const userId = req.user.id;

    if (!slug) {
      return res.status(400).json({ message: "Slug is required" });
    }

    const channel = await ChannelModal.findOne({
      slug: slug,
      isDeleted: false,
      reportedBy: { $ne: userId },
    })
      .populate("adminId", "name email avtarId mediaId")
      .populate("users", "name email avtarId mediaId")
      .populate("mediaId")
      .populate("latestMessage")
      .populate("conversationId", "AESKeyOfUser");

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    let channelData = channel.toObject();

    const populateImageUrls = async (members) => {
      for (const member of members) {
        member.userImageUrl = null;
        member.avtarImageUrl = null;
        if (member.avtarId) {
          const avatar = await AvtarModal.findById(member.avtarId);
          if (avatar && avatar.avtarImage) {
            member.avtarImageUrl = `${process.env.BASE_URL}${avatar.avtarImage}`;
          }
        }
        if (member.mediaId) {
          const media = await UserMediaModal.findById(member.mediaId);
          if (media && media.mediaUrl) {
            member.userImageUrl = `${process.env.BASE_URL}${media.mediaUrl}`;
          }
        }
      }
    };

    await populateImageUrls(channelData.adminId);
    await populateImageUrls(channelData.users);

    if (channelData.mediaId && channelData.mediaId.fileUrl) {
      channelData.mediaId.imageUrl = `${process.env.BASE_URL}${channelData.mediaId.fileUrl}`;
      delete channelData.mediaId.fileUrl;
    } else if (channelData.mediaId) {
      channelData.mediaId.imageUrl = null;
    }

    channelData.conversationId.AESKeyOfUser =
      channelData?.conversationId?.AESKeyOfUser.get(userId.toString());

    channelData.conversation = channelData.conversationId;
    channelData.conversationId = channelData.conversationId._id;

    res.status(200).json({ data: channelData });
  } catch (err) {
    console.error("Error fetching Channel by Slug:", err);
    res.status(500).json({ error: "Failed to fetch Channel by Slug" });
  }
}

async function reportChannel(req, res) {
  try {
    const { channelId } = req.params;
    const userId = req.user.id;

    const channel = await ChannelModal.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const isAdminInChannel = channel.adminId.some(
      (id) => id.toString() === userId.toString()
    );

    channel.reportedBy.push(userId);

    // Remove from users if present
    channel.users = channel.users.filter(
      (id) => id.toString() !== userId.toString()
    );

    // Remove from adminId if present
    if (isAdminInChannel) {
      channel.adminId = channel.adminId.filter(
        (id) => id.toString() !== userId.toString()
      );

      // If no admins left but users still exist, promote one
      if (channel.adminId.length === 0 && channel.users.length > 0) {
        const newAdmin = channel.users[0];
        channel.adminId.push(newAdmin);
      }
    }

    // If both arrays are now empty, soft delete
    if (channel.users.length === 0 && channel.adminId.length === 0) {
      channel.isDeleted = true;
    }

    const conversation = await Conversation.findById(
      channel.conversationId
    ).select("AESKeyOfUser");

    conversation.AESKeyOfUser.delete(userId.toString());
    await conversation.save();
    await channel.save();

    res.status(200).json({ message: "Channel reported successfully" });
  } catch (err) {
    console.error("Report Channel error:", err);
    res.status(500).json({ error: "Failed to report Channel" });
  }
}

module.exports = {
  getSlug,
  createChannel,
  getUserChannels,
  deleteChannel,
  addUserInChannel,
  subscribeChannel,
  leaveChannel,
  updateChannel,
  getChannelById,
  removeUserFromChannel,
  getChannelBySlug,
  reportChannel,
};
