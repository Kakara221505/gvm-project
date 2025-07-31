const Conversation = require("../models/Conversation");
const GroupModal = require("../models/Group");
const Message = require("../models/Message");
const MessageMediaModal = require("../models/MessageMedia");
const User = require("../models/User");
const {
  getIO,
  emitRefreshEvent,
  emitUpdateEvent,
} = require("../socket/socket");
const { getRandomKey, getAESKey } = require("../utils/encryption");
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

    const io = getIO();

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

async function createGroup(req, res) {
  try {
    const userId = req.user._id;
    const { groupName, description, users } = req.body;

    if (!groupName) {
      return res.status(400).json({ message: "Group name is required" });
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
    let groupImage = "";
    if (req.files?.messageMedia?.length > 0) {
      const file = req.files.messageMedia[0];

      groupImage = `${process.env.MESSAGE_MEDIA_ROUTE}${file.filename}`;

      const media = new MessageMediaModal({
        userId: currentUserId,
        fileType: "image",
        fileUrl: groupImage,
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
      originType: "group",
    });

    const newConvo = await convo.save();

    // Create group (adminId is only current user, users array does not include admin)
    const group = new GroupModal({
      groupName,
      adminId: [currentUserId],
      description: description || "",
      users: [...userIds, currentUserId],
      mediaId,
      conversationId: newConvo._id,
      isDeleted: false,
      groupCreatedBy: currentUserId
    });

    const newGroup = await group.save();

    // // Emit event to all users (including admin)
    // const io = getIO();
    // const notifyUsers = [...userIds, currentUserId];
    // notifyUsers.forEach(userId => {
    //   io.to(`USER__${userId}`).emit('group-created', { group: newGroup });
    // });

    // emitRefreshEvent(notifyUsers, 'GROUP', newGroup._id, newGroup);

    const groupDetails = await GroupModal.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(newGroup._id) } },
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
          from: "media",
          let: { mdId: "$mediaId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$mdId"],
                },
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
      {
        $unwind: { path: "$mediaId", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "Conversation",
          let: { convId: "$conversationId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$convId"],
                },
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
      {
        $lookup: {
          from: "User",
          let: { createdById: "$groupCreatedBy" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$createdById"] }
              }
            },
            {
              $lookup: {
                from: "UserMedia",
                localField: "mediaId",
                foreignField: "_id",
                as: "mediaId",
              }
            },
            {
              $lookup: {
                from: "Avtar",
                localField: "avtarId",
                foreignField: "_id",
                as: "avtarId",
              }
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
            }
          ],
          as: "groupCreatedBy"
        }
      },
      {
        $unwind: { path: "$groupCreatedBy", preserveNullAndEmptyArrays: true }
      },
      {
        $lookup: {
          from: "messages",
          let: { convId: "$conversationId._id" }, // Assuming this pipeline is on a conversation model where _id = conversationId
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
          unseenMessageCount: 0,
          background: null,
          chatColor: null,
        },
      },
    ]);

    userIds.map((userId) => {
      let newDetails = JSON.parse(JSON.stringify(groupDetails[0]));
      newDetails.conversationId.AESKeyOfUser =
        newDetails?.conversationId?.AESKeyOfUser?.[String(userId)];
      emitUpdateEvent([userId], "group", groupDetails[0]._id, newDetails);
    });

    sendNotificationToAddUserInGroup(
      userIds,
      currentUserId,
      groupDetails[0]._id,
      "group",
      req.user.name
    );

    const details = JSON.parse(JSON.stringify(groupDetails[0]));
    details.conversationId.AESKeyOfUser =
      details?.conversationId?.AESKeyOfUser?.[String(currentUserId)];
    emitUpdateEvent([currentUserId], "group", groupDetails[0]._id, details);

    res.status(201).json({
      data: details,
      message: "Group created successfully",
    });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ error: "Error creating group" });
  }
}
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function getUserGroups(req, res) {
  try {
    const userId = req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const { search = "", page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const skip = (pageNumber - 1) * pageSize;

    const filter = {
      isDeleted: false,
      $or: [{ users: userId }, { adminId: userId }],
    };

    if (search) {
      const safeSearch = escapeRegExp(search.trim());
      filter.groupName = { $regex: safeSearch, $options: "i" };
    }

    const groupPromise = GroupModal.aggregate([
      { $match: filter },
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
                avtarImage: {
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
                avtarImage: {
                  $cond: {
                    if: { $ne: ["$avtarId", null] },
                    then: {
                      $concat: [process.env.BASE_URL, "$avtarId.avatarImage"],
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
                    {
                      $eq: ["$conversationId", "$$convId"],
                    },
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
                $expr: {
                  $eq: ["$_id", "$$convId"],
                },
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
          from: "User",
          let: { createdById: "$groupCreatedBy" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$createdById"] }
              }
            },
            {
              $lookup: {
                from: "UserMedia",
                localField: "mediaId",
                foreignField: "_id",
                as: "mediaId",
              }
            },
            {
              $lookup: {
                from: "Avtar",
                localField: "avtarId",
                foreignField: "_id",
                as: "avtarId",
              }
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
            }
          ],
          as: "groupCreatedBy"
        }
      },
      {
        $unwind: { path: "$groupCreatedBy", preserveNullAndEmptyArrays: true }
      },
      // Add latest message
      {
        $lookup: {
          from: "messages",
          let: { convId: "$conversationId._id", userId: userId }, // Assuming this pipeline is on a conversation model where _id = conversationId
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
        $lookup: {
          from: "media",
          let: { mdId: "$mediaId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$mdId"],
                },
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
      {
        $unwind: { path: "$mediaId", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "settings",
          let: { groupId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$groupId", "$$groupId"] },
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

    const totalRecordPromise = GroupModal.countDocuments(filter);
    // const totalRecords = await GroupModal.countDocuments(filter);
    // const totalPages = Math.ceil(totalRecords / pageSize);

    // const groups = await GroupModal.find(filter)
    //   .sort({ updatedAt: -1 })
    //   .skip(skip)
    //   .limit(pageSize)
    //   .populate("conversationId", "AESKeyOfUser")
    //   .populate({
    //     path: "adminId",
    //     select: "name email phone countryCode mediaId avtarId privacy",
    //     populate: [
    //       { path: "mediaId", select: "mediaUrl" },
    //       { path: "avtarId", select: "avtarImage" },
    //     ],
    //   })
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

    // const groupsWithCleanUsers = groups.map((group) => {
    //   const groupObj = group.toObject();

    //   groupObj.users = (groupObj.users || []).map((user) => {
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
    //       about: user.about || null,
    //     };
    //   });

    //   const admins = Array.isArray(groupObj.adminId)
    //     ? groupObj.adminId
    //     : groupObj.adminId
    //     ? [groupObj.adminId]
    //     : [];

    //   groupObj.adminId = admins.map((admin) => {
    //     const avtarImage = admin.avtarId?.avtarImage
    //       ? `${process.env.BASE_URL}${admin.avtarId.avtarImage}`
    //       : null;

    //     const mediaImage = admin.mediaId?.mediaUrl
    //       ? `${process.env.BASE_URL}${admin.mediaId.mediaUrl}`
    //       : null;

    //     return {
    //       _id: admin._id,
    //       name: admin.name,
    //       email: admin.email,
    //       phone: admin.phone,
    //       countryCode: admin.countryCode,
    //       privacy: admin.privacy,
    //       avtarImage,
    //       userImage: mediaImage || null,
    //     };
    //   });

    //   if (groupObj.mediaId && groupObj.mediaId.fileUrl) {
    //     groupObj.mediaId.imageUrl = `${process.env.BASE_URL}${groupObj.mediaId.fileUrl}`;
    //     delete groupObj.mediaId.fileUrl;
    //   } else if (groupObj.mediaId) {
    //     groupObj.mediaId.imageUrl = null;
    //   }

    //   groupObj.conversationId.AESKeyOfUser =
    //     groupObj?.conversationId?.AESKeyOfUser.get(userId.toString());

    //   return groupObj;
    // });

    const [groups, totalRecords] = await Promise.all([
      groupPromise,
      totalRecordPromise,
    ]);

    return res.status(200).json({
      data: groups,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalRecords / limit),
        totalRecords: totalRecords,
      },
    });
  } catch (err) {
    console.error("Error fetching groups:", err);
    return res.status(500).json({ error: "Could not fetch group list" });
  }
}

async function deleteGroup(req, res) {
  try {
    const groupId = req.params.groupId;
    const userId = req.user.id;

    const group = await GroupModal.findById(groupId);

    if (!group || group.isDeleted) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.adminId.includes(userId)) {
      return res
        .status(403)
        .json({ message: "Only admin can delete the group" });
    }

    group.isDeleted = true;
    await group.save();

    emitUpdateEvent(group.users, "group", groupId, { deleted: true });

    // emitRefreshEvent(group.users, 'GROUP_DELETED', groupId, group);

    res.status(200).json({ message: "Group  deleted successfully" });
  } catch (err) {
    console.error("Delete group error:", err);
    res.status(500).json({ error: "Failed to delete group" });
  }
}

async function addUserInGroup(req, res) {
  try {
    const { groupId } = req.params;
    const { users } = req.body;
    const userId = req.user.id;

    const group = await GroupModal.findById(groupId);
    if (!group || group.isDeleted) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.adminId.includes(userId)) {
      return res
        .status(403)
        .json({ message: "Only admin can update the group" });
    }

    const conversation = await Conversation.findById(
      group.conversationId
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
    group.users = [
      ...new Set([...users, ...group.users.map((ele) => ele.toString())]),
    ];

    if (
      users.map(id => id.toString()).includes(group.groupCreatedBy.toString()) &&
      !group.adminId.map(id => id.toString()).includes(group.groupCreatedBy.toString())
    ) {
      group.adminId.push(group.groupCreatedBy);
    }
    

    await group.save();
    emitUpdateEvent(group.users, "group", group._id, { newUsers: usrList });
    sendNotificationToAddUserInGroup(
      users,
      userId,
      group._id,
      "group",
      req.user.name
    );
    res
      .status(200)
      .json({ message: "Group updated successfully", data: usrList });
  } catch (err) {
    console.error("Update group error:", err);
    res.status(500).json({ error: "Failed to update group" });
  }
}

async function addAdminUserInGroup(req, res) {
  try {
    const { groupId } = req.params;
    const { users } = req.body;
    const userId = req.user.id;

    const group = await GroupModal.findById(groupId);

    if (!group || group.isDeleted) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.adminId.includes(userId)) {
      return res
        .status(403)
        .json({ message: "Only admin can update the group" });
    }

    if (
      !users.every((usr) =>
        group.users.map((ele) => ele.toString()).includes(usr.toString())
      )
    ) {
      return res
        .status(403)
        .json({ message: "Only member can become admin in group" });
    }

    group.adminId = [
      ...new Set([...group.adminId.map((ele) => ele.toString()), ...users]),
    ];

    emitUpdateEvent(group.users, "group", group._id, { newAdmin: users });
    await group.save();

    res.status(200).json({ message: "Group updated successfully" });
  } catch (err) {
    console.error("Update group error:", err);
    res.status(500).json({ error: "Failed to update group" });
  }
}

async function leaveGroup(req, res) {
  try {
    const groupId = req.params.groupId;
    const userId = req.user.id;

    const group = await GroupModal.findById(groupId);

    if (!group || group.isDeleted) {
      return res.status(404).json({ message: "Group not found" });
    }

    const isUserInGroup = group.users.some(
      (id) => id.toString() === userId.toString()
    );
    const isAdminInGroup = group.adminId.some(
      (id) => id.toString() === userId.toString()
    );

    // If user is neither in users nor adminId, reject
    if (!isUserInGroup && !isAdminInGroup) {
      return res.status(400).json({ message: "User not part of this group" });
    }
    const conversation = await Conversation.findById(
      group.conversationId
    ).select("AESKeyOfUser");

    conversation.AESKeyOfUser.delete(userId.toString());
    await conversation.save();

    // Remove from users if present
    group.users = group.users.filter(
      (id) => id.toString() !== userId.toString()
    );

    // Remove from adminId if present
    if (isAdminInGroup) {
      group.adminId = group.adminId.filter(
        (id) => id.toString() !== userId.toString()
      );

      // If no admins left but users still exist, promote one
      if (group.adminId.length === 0 && group.users.length > 0) {
        const newAdmin = group.users[0];
        group.adminId.push(newAdmin);
      }
    }

    // If both arrays are now empty, soft delete
    if (group.users.length === 0 && group.adminId.length === 0) {
      group.isDeleted = true;
    }

    await group.save();
    seenMessageForDeleteUser(group.conversationId, [userId]);
    emitUpdateEvent(group.users, "group", group._id, {
      deletedUsers: [userId],
    });
    // emitRefreshEvent(group.users, 'GROUP_UPDATED', groupId, group);

    res.status(200).json({ message: "Left group successfully", group });
  } catch (err) {
    console.error("Leave group error:", err);
    res.status(500).json({ error: "Failed to leave group" });
  }
}

async function updateGroup(req, res) {
  try {
    const { groupId } = req.params;
    const { groupName, description } = req.body;
    const userId = req.user.id;
    const group = await GroupModal.findById(groupId);
    const newDetails = {};

    if (!group || group.isDeleted) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.adminId.includes(userId)) {
      return res
        .status(403)
        .json({ message: "Only admin can update the group" });
    }

    if (groupName) {
      group.groupName = groupName;
      newDetails.groupName = groupName;
    }
    if (Object.prototype.hasOwnProperty.call(req.body, "description")) {
      group.description = description;
      newDetails.description = description;
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
      newDetails.mediaId = savedMedia.toObject();
      newDetails.mediaId.imageUrl = `${process.env.BASE_URL}${imageUrl}`;
      group.mediaId = savedMedia._id;
    }

    await group.save();
    emitUpdateEvent(group.users, "group", group._id, newDetails);
    res.status(200).json({ message: "Group updated successfully" });
  } catch (err) {
    console.error("Update group error:", err);
    res.status(500).json({ error: "Failed to update group" });
  }
}

async function getGroupById(req, res) {
  try {
    const userId = req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const groupId = req.params.groupId;

    const group = await GroupModal.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(groupId),
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
                avtarImage: {
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
                avtarImage: {
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
          from: "User",
          let: { createdById: "$groupCreatedBy" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$createdById"] }
              }
            },
            {
              $lookup: {
                from: "UserMedia",
                localField: "mediaId",
                foreignField: "_id",
                as: "mediaId",
              }
            },
            {
              $lookup: {
                from: "Avtar",
                localField: "avtarId",
                foreignField: "_id",
                as: "avtarId",
              }
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
            }
          ],
          as: "groupCreatedBy"
        }
      },
      {
        $unwind: { path: "$groupCreatedBy", preserveNullAndEmptyArrays: true }
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
          let: { groupId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$groupId", "$$groupId"] },
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

    if (!group || !group.length) {
      return res.status(404).json({ error: "Group not found" });
    }

    return res.status(200).json({ data: group[0] });
  } catch (err) {
    console.error("Error fetching group by id:", err);
    return res.status(500).json({ error: "Failed to fetch group details" });
  }
}

async function removeUserFromGroup(req, res) {
  try {
    const { groupId, userIdToRemove } = req.params;
    const currentUserId = req.user.id;
    const group = await GroupModal.findById(groupId);

    if (!group || group.isDeleted) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.adminId.includes(currentUserId)) {
      return res
        .status(403)
        .json({ message: "Only admin can update the group" });
    }

    const conversation = await Conversation.findById(
      group.conversationId
    ).select("AESKeyOfUser");

    if (!group.users.map((id) => id.toString()).includes(userIdToRemove)) {
      return res.status(400).json({ message: "User not in this group" });
    }

    conversation.AESKeyOfUser.delete(userIdToRemove);
    await conversation.save();

    // Remove from users and adminId if needed
    group.users = group.users.filter((id) => id.toString() !== userIdToRemove);

    if (group.adminId.map((id) => id.toString()).includes(userIdToRemove)) {
      group.adminId = group.adminId.filter(
        (id) => id.toString() !== userIdToRemove
      );

      if (group.adminId.length === 0 && group.users.length > 0) {
        group.adminId.push(group.users[0]);
      }
    }

    // If no users and no admins left, soft delete group
    if (group.users.length === 0 && group.adminId.length === 0) {
      group.isDeleted = true;
    }

    await group.save();
    emitUpdateEvent([...group.users, userIdToRemove], "group", group._id, {
      deletedUsers: [userIdToRemove],
    });
    seenMessageForDeleteUser(group.conversationId, [userIdToRemove]);

    // emitRefreshEvent(group.users, 'GROUP_UPDATED', groupId, group);

    res
      .status(200)
      .json({ message: "User removed from group successfully", group });
  } catch (err) {
    console.error("Remove user error:", err);
    res.status(500).json({ error: "Failed to remove user from group" });
  }
}

async function reportGroup(req, res) {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await GroupModal.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const isAdminInGroup = group.adminId.some(
      (id) => id.toString() === userId.toString()
    );

    group.reportedBy.push(userId);

    // Remove from users if present
    group.users = group.users.filter(
      (id) => id.toString() !== userId.toString()
    );

    // Remove from adminId if present
    if (isAdminInGroup) {
      group.adminId = group.adminId.filter(
        (id) => id.toString() !== userId.toString()
      );

      // If no admins left but users still exist, promote one
      if (group.adminId.length === 0 && group.users.length > 0) {
        const newAdmin = group.users[0];
        group.adminId.push(newAdmin);
      }
    }

    // If both arrays are now empty, soft delete
    if (group.users.length === 0 && group.adminId.length === 0) {
      group.isDeleted = true;
    }

    const conversation = await Conversation.findById(
      group.conversationId
    ).select("AESKeyOfUser");

    conversation.AESKeyOfUser.delete(userId.toString());
    await conversation.save();
    await group.save();

    res.status(200).json({ message: "Group reported successfully" });
  } catch (err) {
    console.error("Report Group error:", err);
    res.status(500).json({ error: "Failed to report Group" });
  }
}

async function removeAdminFromGroup(req, res) {
  try {
    const { groupId } = req.params;
    const { adminIdToRemove } = req.body;
    const currentAdminId = req.user.id;

    // Fetch group
    const group = await GroupModal.findById(groupId);
    if (!group || group.isDeleted) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Ensure requester is an admin
    if (!group.adminId.includes(currentAdminId)) {
      return res
        .status(403)
        .json({ message: "Only admins can remove another admin" });
    }

    // Ensure the target user is an admin
    if (!group.adminId.includes(adminIdToRemove)) {
      return res
        .status(400)
        .json({ message: "The specified user is not an admin" });
    }

    // Ensure more than one admin exists
    if (group.adminId.length <= 1) {
      return res
        .status(400)
        .json({ message: "Cannot remove the only admin of the group" });
    }

    // Optional: prevent self-removal (can remove this check if you want to allow it)
    if (currentAdminId === adminIdToRemove) {
      return res
        .status(400)
        .json({ message: "You cannot remove yourself from admin" });
    }

    // Remove admin
    group.adminId = group.adminId.filter(
      (adminId) => adminId.toString() !== adminIdToRemove
    );
    await group.save();
    emitUpdateEvent(group.users, "group", group._id, {
      removedAdmin: [adminIdToRemove],
    });
    return res.status(200).json({
      message: "Admin removed successfully",
      updatedAdminList: group.adminId,
    });
  } catch (err) {
    console.error("Remove admin error:", err);
    return res.status(500).json({ error: "Failed to remove admin" });
  }
}

async function commonGroup(req, res) {
  try {
    const loggedInUserId = req.user._id;
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "Target userId is required." });
    }

    const groups = await GroupModal.find({
      users: { $all: [loggedInUserId, userId] },
      isDeleted: false,
    })
      .populate("mediaId", "fileUrl")
      .populate({
        path: "users",
        select: "name",
      });

    const result = groups.map((group) => ({
      _id: group._id, // ✅ Group ID
      conversationId: group.conversationId, // ✅ Conversation ID
      groupName: group.groupName,
      groupImage: group.mediaId
        ? `${process.env.BASE_URL}${group.mediaId.fileUrl}`
        : null,
      members: group.users.map((user) => user.name),
    }));

    return res.status(200).json({
      message: "Common groups fetched successfully",
      data: result,
    });
  } catch (err) {
    console.error("Common group error:", err);
    return res.status(500).json({ error: "Failed to fetch common group" });
  }
}


async function groupDeletedByOwner(req, res) {
  try {
    const groupId = req.params.groupId;
    const userId = req.user.id;

    const group = await GroupModal.findById(groupId);

    if (!group || group.isDeleted) {
      return res.status(404).json({ message: "Group not found" });
    }
    if (!group.groupCreatedBy.equals(userId)) {
      return res.status(403).json({ message: "Only group owner can delete the group" });
    }
    

    group.isDeleted = true;
    await group.save();

    // Emit an event to notify all users about group deletion
    emitUpdateEvent(group.users, "group", groupId, { deleted: true });

    res.status(200).json({ message: "Group deleted successfully" });
  } catch (err) {
    console.error("Delete Group error:", err);
    res.status(500).json({ error: "Failed to delete group" });
  }
}


module.exports = {
  createGroup,
  getUserGroups,
  deleteGroup,
  leaveGroup,
  updateGroup,
  getGroupById,
  removeUserFromGroup,
  addUserInGroup,
  addAdminUserInGroup,
  reportGroup,
  removeAdminFromGroup,
  commonGroup,
  groupDeletedByOwner
};
