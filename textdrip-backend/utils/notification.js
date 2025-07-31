const Chat = require("../models/Chat");
const Group = require("../models/Group");
const Channel = require("../models/Channel");
const admin = require("../firebase/firebase.js");
const { onlineUsers } = require("../socket/socket");
const Setting = require("../models/Setting.js");
const User = require("../models/User.js");
const { default: mongoose } = require("mongoose");

async function getTokens(type, typeId, userIds, senderId) {
  let notWantedUsers = await Setting.find({
    muteNotification: true,
    userId: { $in: userIds },
    [`${type}Id`]: { $eq: typeId },
  }).select("userId");

  notWantedUsers = [
    ...notWantedUsers.map((ele) => ele.userId.toString()),
    // ...Object.keys(onlineUsers),
    String(senderId),
  ];

  let wantedUsers = {};

  if (type != "chat") {
    wantedUsers = await User.find({
      _id: { $nin: notWantedUsers, $in: userIds },
      isMuted: false,
      isDeleted: false,
      isBlockedByAdmin: false,
    }).select("fcmTokens _id");
  } else {
    wantedUsers = await User.find({
      _id: { $nin: notWantedUsers, $in: userIds },
      isMuted: false,
      isDeleted: false,
      isBlockedByAdmin: false,
    }).select("fcmTokens _id");
  }

  return wantedUsers;
}

async function getChatDetails(chatId, senderId) {
  const chat = await Chat.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(chatId),
      },
    },
    {
      $lookup: {
        from: "User",
        let: { userIds: "$users" },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: ["$_id", "$$userIds"],
              },
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
              userName: 1,
              email: 1,
              privacy: 1,
              mediaId: 1,
              avtarId: 1,
              about: 1,
              phone: 1,
              countryCode: 1,
              avatarImage: {
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
        as: "AllUsers",
      },
    },
    {
      $addFields: {
        user: {
          $filter: {
            input: "$AllUsers",
            as: "user",
            cond: {
              $ne: ["$$user._id", senderId],
            },
          },
        },
      },
    },
    {
      $unwind: {
        path: "$user",
        preserveNullAndEmptyArrays: true,
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
              AESKeyOfUser: 1,
            },
          },
        ],
        as: "conversationId",
      },
    },
    {
      $unwind: {
        path: "$conversationId",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        AllUsers: 0,
        users: 0,
      },
    },
  ]);

  return chat[0];
}

async function getGroupDetails(groupId) {
  const group = await Group.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(groupId),
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
              AESKeyOfUser: 1,
            },
          },
        ],
        as: "conversationId",
      },
    },
    {
      $unwind: {
        path: "$conversationId",
        preserveNullAndEmptyArrays: true,
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
      $unwind: {
        path: "$mediaId",
        preserveNullAndEmptyArrays: true,
      },
    },
  ]);

  return group[0];
}

async function getChannelDetails(channelId) {
  const channel = await Channel.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(channelId),
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
              AESKeyOfUser: 1,
            },
          },
        ],
        as: "conversationId",
      },
    },
    {
      $unwind: {
        path: "$conversationId",
        preserveNullAndEmptyArrays: true,
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
      $unwind: {
        path: "$mediaId",
        preserveNullAndEmptyArrays: true,
      },
    },
  ]);

  return channel[0];
}
async function getTypeDetails(type, typeId, senderId) {
  switch (type) {
    case "chat":
      return await getChatDetails(typeId, senderId);
    case "group":
      return await getGroupDetails(typeId);
    case "channel":
      return await getChannelDetails(typeId);
    default:
      return null;
  }
}

// async function sendNotification(
//   userIds,
//   type,
//   typeId,
//   message,
//   conversationId,
//   senderId
// ) {
//   try {
//     const [tokens, details, sender] = await Promise.all([
//       getTokens(type, typeId, userIds, senderId),
//       getTypeDetails(type, typeId, senderId),
//       User.findById(senderId)
//         .select("userName name email phone privacy")
//         .populate([
//           { path: "mediaId", select: "mediaUrl" },
//           { path: "avtarId", select: "avtarImage" },
//         ]),
//     ]);

//     let imageUrl = null;
//     if (sender?.mediaId) {
//       imageUrl = `${process.env.BASE_URL}${sender?.mediaId?.mediaUrl}`;
//     } else if (sender?.avtarId) {
//       imageUrl = `${process.env.BASE_URL}${sender?.avtarId?.avtarImage}`;
//     }

//     tokens.forEach(async (value) => {
//       try {
//         if (value.fcmTokens.length <= 0 || value._id == senderId) return;
//         // let sentDetail = { ...details };
//         // sentDetail.conversationId = {
//         //   ...sentDetail.conversationId,
//         //   AESKeyOfUser:
//         //     sentDetail.conversationId.AESKeyOfUser[value._id.toString()],
//         // };

//         const conversationObj = {
//           ...details.conversationId,
//           AESKeyOfUser:
//             details.conversationId.AESKeyOfUser[value._id.toString()],
//         };
//         const { conversationId: _removed, ...restDetails } = details;
//         const sentDetail = {
//           conversationId: conversationObj,
//           data: restDetails,
//         };

//         const payload = {
//           notification: {
//             title: `New message from ${sender?.name || "user"}`,
//             body: "",
//             imageUrl: imageUrl,
//           },
//           data: {
//             type: type,
//             conversationId: String(conversationId),
//             data: JSON.stringify(sentDetail),
//             message: JSON.stringify(message),
//           },
//         };
//         debugger;
// console.log("vivek",payload)
//         const options = {
//           priority: "high",
//           timeToLive: 60 * 60 * 24,
//         };

//         const msg = await admin.messaging().sendEachForMulticast({
//           tokens: value.fcmTokens,
//           ...payload,
//           options,
//         });
//       } catch (err) {
//         console.log("Error sending notifcation", value, err);
//       }
//     });
//   } catch (err) {
//     console.log("Error sending notification for message:", message._id, err);
//   }
// }

// async function sendNotification(
//   userIds,
//   type,
//   typeId,
//   message,
//   conversationId,
//   senderId
// ) {
//   try {
//     const [tokens, details, sender] = await Promise.all([
//       getTokens(type, typeId, userIds, senderId),
//       getTypeDetails(type, typeId, senderId),
//       User.findById(senderId)
//         .select("userName name email phone privacy")
//         .populate([
//           { path: "mediaId", select: "mediaUrl" },
//           { path: "avtarId", select: "avtarImage" },
//         ]),
//     ]);

//     let imageUrl = null;
//     if (sender?.mediaId) {
//       imageUrl = `${process.env.BASE_URL}${sender.mediaId.mediaUrl}`;
//     } else if (sender?.avtarId) {
//       imageUrl = `${process.env.BASE_URL}${sender.avtarId.avtarImage}`;
//     }

//     tokens.forEach(async (value) => {
//       try {
//         if (value.fcmTokens.length <= 0 || value._id.toString() === senderId.toString()) return;

//         // Prepare conversationId with stringified ID and proper AES key
//         const conversationObj = {
//           ...details.conversationId,
//           _id: details.conversationId._id.toString(),
//           AESKeyOfUser: details.conversationId.AESKeyOfUser[value._id.toString()],
//         };

//         const { conversationId: _removed, ...restDetails } = details;

//         const sentDetail = {
//           conversationId: conversationObj,
//           data: {
//             ...restDetails,
//             _id: restDetails._id?.toString(),
//             latestMessage: restDetails.latestMessage?.toString(),
//             user: {
//               ...restDetails.user,
//               _id: restDetails.user._id?.toString(),
//               avtarId: restDetails.user.avtarId
//                 ? {
//                     ...restDetails.user.avtarId,
//                     _id: restDetails.user.avtarId._id?.toString(),
//                   }
//                 : null,
//             },
//           },
//         };

//         const payload = {
//           notification: {
//             title: `New message from ${sender?.name || "user"}`,
//             body: "",
//             imageUrl: imageUrl,
//           },
//           data: {
//             type: type,
//             conversationId: String(conversationId),
//             data: JSON.stringify(sentDetail),
//             message: JSON.stringify({
//               ...message,
//               _id: message._id?.toString(),
//               chatId: message.chatId?.toString(),
//               senderId: message.senderId?.toString(),
//               receiverId: message.receiverId?.toString(),
//             }),
//           },
//         };

//         const options = {
//           priority: "high",
//           timeToLive: 60 * 60 * 24,
//         };
// debugger
//         console.log("Sending payload:", payload);

//         const msg = await admin.messaging().sendEachForMulticast({
//           tokens: value.fcmTokens,
//           ...payload,
//           options,
//         });
//       } catch (err) {
//         console.log("Error sending notification to user", value._id.toString(), err);
//       }
//     });
//   } catch (err) {
//     console.log("Error sending notification for message:", message._id?.toString(), err);
//   }
// }

function getUrl(type) {
  switch (type) {
    case "chat":
      return "home";
    case "group":
      return "groups";
    case "channel":
      return "channels";
    default:
      return "";
  }
}

// async function sendNotification(
//   userIds,
//   type,
//   typeId,
//   message,
//   conversationId,
//   senderId
// ) {
//   try {
//     const [tokens, details, sender] = await Promise.all([
//       getTokens(type, typeId, userIds, senderId),
//       getTypeDetails(type, typeId, senderId),
//       User.findById(senderId)
//         .select("userName name email phone privacy countryCode about")
//         .populate([
//           { path: "mediaId", select: "mediaUrl" },
//           { path: "avtarId", select: "avtarImage" },
//         ]),
//     ]);
//     let imageUrl = null;
//     if (type == "chat") {
//       if (sender?.mediaId?.mediaUrl) {
//         imageUrl = `${process.env.BASE_URL}${sender.mediaId.mediaUrl}`;
//       } else if (sender?.avtarId?.avtarImage) {
//         imageUrl = `${process.env.BASE_URL}${sender.avtarId.avtarImage}`;
//       }
//     } else {
//       imageUrl = details?.mediaId?.imageUrl || "";
//     }
//     tokens.forEach(async (value) => {
//       try {
//         const fcmTokens = [...new Set(value.fcmTokens)];
//         if (
//           fcmTokens.length <= 0 ||
//           value._id.toString() === senderId.toString()
//         )
//           return;

//         // Prepare conversationId with stringified ID and proper AES key
//         const conversationObj = {
//           ...details.conversationId,
//           _id: details.conversationId._id.toString(),
//           AESKeyOfUser:
//             details.conversationId.AESKeyOfUser[value._id.toString()],
//         };

//         const { conversationId: _removed, ...restDetails } = details;
//         const sentDetail = {
//           conversationId: conversationObj,
//           data: {
//             ...restDetails,
//             _id: restDetails._id?.toString(),
//             latestMessage: restDetails.latestMessage?.toString(),
//             user: {
//               _id: sender._id.toString(),
//               name: sender.name,
//               userName: sender.userName,
//               email: sender.email,
//               phone: sender.phone,
//               privacy: sender.privacy,
//               countryCode: sender.countryCode,
//               about: sender.about,
//               avtarId: sender.avtarId
//                 ? {
//                     _id: sender.avtarId._id.toString(),
//                     avtarImage: sender.avtarId.avtarImage,
//                   }
//                 : null,
//               mediaId: sender.mediaId
//                 ? {
//                     _id: sender.mediaId._id.toString(),
//                     mediaUrl: sender.mediaId.mediaUrl,
//                   }
//                 : null,
//               mediaUrl: sender.mediaId
//                 ? `${process.env.BASE_URL}${sender.mediaId.mediaUrl}`
//                 : null,
//               avtarImage: sender.avtarId
//                 ? `${process.env.BASE_URL}${sender.avtarId.avtarImage}`
//                 : null,
//             },
//           },
//         };
//         const payload = {
//           notification: {
//             title: "New Message",
//             body:
//               type == "chat"
//                 ? `New message from ${sender?.name || "user"}`
//                 : `New message in ${details[type + "Name"]} from ${
//                     sender?.name || "user"
//                   }`,
//             imageUrl: imageUrl,
//           },
//           data: {
//             title: "New Message",
//             body:
//               type == "chat"
//                 ? `New message from ${sender?.name || "user"}`
//                 : `New message in ${details[type + "Name"]} from ${
//                     sender?.name || "user"
//                   }`,
//             imageUrl: imageUrl,
//             type: type,
//             conversationId: String(conversationId),
//             data: JSON.stringify(sentDetail),
//             message: JSON.stringify({
//               ...message,
//               _id: message._id?.toString(),
//             }),
//           },
//         };
//         const options = {
//           priority: "high",
//           timeToLive: 60 * 60 * 24, // 24 hours
//         };

//         await admin.messaging().sendEachForMulticast({
//           tokens: fcmTokens,
//           ...payload,
//           ...options,
//           webpush: {
//             fcmOptions: {
//               link: `${process.env.FRONT_BASE_URL}${getUrl(type)}?entityId=${
//                 restDetails._id
//               }`,
//             },
//           },
//         });
//       } catch (err) {
//         console.log(
//           "Error sending notification to user",
//           value._id.toString(),
//           err
//         );
//       }
//     });
//   } catch (err) {
//     console.log(
//       "Error sending notification for message:",
//       message._id?.toString(),
//       err
//     );
//   }
// }

async function sendNotification(
  userIds,
  type,
  typeId,
  message,
  conversationId,
  senderId
) {
  try {
    const [tokens, details, sender] = await Promise.all([
      getTokens(type, typeId, userIds, senderId),
      getTypeDetails(type, typeId, senderId),
      User.findById(senderId)
        .select("userName name email phone privacy countryCode about")
        .populate([
          { path: "mediaId", select: "mediaUrl" },
          { path: "avtarId", select: "avtarImage" },
        ]),
    ]);

    let imageUrl = null;
    if (type == "chat") {
      if (sender?.mediaId?.mediaUrl) {
        imageUrl = `${process.env.BASE_URL}${sender.mediaId.mediaUrl}`;
      } else if (sender?.avtarId?.avtarImage) {
        imageUrl = `${process.env.BASE_URL}${sender.avtarId.avtarImage}`;
      }
    } else {
      imageUrl = details?.mediaId?.imageUrl || "";
    }

    tokens.forEach(async (value) => {
      try {
        const fcmTokens = [...new Set(value.fcmTokens)];
        if (
          fcmTokens.length <= 0 ||
          value._id.toString() === senderId.toString()
        )
          return;

        // Prepare conversationId with stringified ID and proper AES key
        const conversationObj = {
          ...details.conversationId,
          _id: details.conversationId._id.toString(),
          AESKeyOfUser:
            details.conversationId.AESKeyOfUser[value._id.toString()],
        };

        const { conversationId: _removed, ...restDetails } = details;

        const sentDetail = {
          conversationId: conversationObj,
          data: {
            ...restDetails,
            _id: restDetails._id?.toString(),
            latestMessage: restDetails.latestMessage?.toString(),
            user: {
              _id: sender._id.toString(),
              name: sender.name,
              userName: sender.userName,
              email: sender.email,
              phone: sender.phone,
              privacy: sender.privacy,
              countryCode: sender.countryCode,
              about: sender.about,
              avtarId: sender.avtarId
                ? {
                    _id: sender.avtarId._id.toString(),
                    avtarImage: sender.avtarId.avtarImage,
                  }
                : null,
              mediaId: sender.mediaId
                ? {
                    _id: sender.mediaId._id.toString(),
                    mediaUrl: sender.mediaId.mediaUrl,
                  }
                : null,
              mediaUrl: sender.mediaId
                ? `${process.env.BASE_URL}${sender.mediaId.mediaUrl}`
                : null,
              avtarImage: sender.avtarId
                ? `${process.env.BASE_URL}${sender.avtarId.avtarImage}`
                : null,
            },
          },
        };

        const notificationPayload = {
          title: "New Message",
          body:
            type === "chat"
              ? `New message from ${sender?.name || "user"}`
              : `New message in ${details[type + "Name"]} from ${
                  sender?.name || "user"
                }`,
        };

        // Only add imageUrl if it's a valid URL
        if (imageUrl && imageUrl.startsWith("http")) {
          notificationPayload.imageUrl = imageUrl;
        }
        // const payload = {
        //   notification: {
        //     title: "New Message",
        //     body:
        //       type == "chat"
        //         ? `New message from ${sender?.name || "user"}`
        //         : `New message in ${details[type + "Name"]} from ${
        //             sender?.name || "user"
        //           }`,
        //     imageUrl: imageUrl,
        //   },
        //   data: {
        //     title: "New Message",
        //     body:
        //       type == "chat"
        //         ? `New message from ${sender?.name || "user"}`
        //         : `New message in ${details[type + "Name"]} from ${
        //             sender?.name || "user"
        //           }`,
        //     imageUrl: imageUrl,
        //     type: type,
        //     conversationId: String(conversationId),
        //     data: JSON.stringify(sentDetail),
        //     message: JSON.stringify({
        //       ...message,
        //       _id: message._id?.toString(),
        //     }),
        //   },
        // };
     

        const payload = {
          notification: notificationPayload,
          data: {
            title: "New Message",
            body: notificationPayload.body,
            imageUrl: imageUrl || "", // safe fallback in data section
            type: type,
            conversationId: String(conversationId),
            data: JSON.stringify(sentDetail),
            message: JSON.stringify({
              ...message,
              _id: message._id?.toString(),
            }),
          },
        };
    

        const options = {
          priority: "high",
          timeToLive: 60 * 60 * 24, // 24 hours
        };

       await admin.messaging().sendEachForMulticast({
          tokens: fcmTokens,
          ...payload,
          ...options,
          webpush: {
            fcmOptions: {
              link: `${process.env.FRONT_BASE_URL}${getUrl(type)}?entityId=${
                restDetails._id
              }`,
            },
          },
        });
      } catch (err) {
        console.log(
          "Error sending notification to user",
          value._id.toString(),
          err
        );
      }
    });
  } catch (err) {
    console.log(
      "Error sending notification for message:",
      message._id?.toString(),
      err
    );
  }
}

async function sendNotificationToAddUserInGroup(
  addedUserIds,
  userId,
  targetId,
  type,
  userName
) {
  try {
    const [tokens, details] = await Promise.all([
      getTokens(type, targetId, addedUserIds, userId),
      getTypeDetails(type, targetId, userId),
    ]);

    let imageUrl = details?.mediaId?.imageUrl || "";

    tokens.forEach(async (value) => {
      try {
        if (value.fcmTokens.length <= 0) return;

        // Prepare conversationId with stringified ID and proper AES key
        const conversationObj = {
          ...details.conversationId,
          _id: details.conversationId._id.toString(),
          AESKeyOfUser:
            details.conversationId.AESKeyOfUser[value._id.toString()],
        };

        const { conversationId: _removed, ...restDetails } = details;

        const sentDetail = {
          conversationId: conversationObj,
          data: {
            ...restDetails,
            _id: restDetails._id?.toString(),
            latestMessage: restDetails.latestMessage?.toString(),
          },
        };

        const payload = {
          notification: {
            title: details[type + "Name"],
            body: `${userName} has added you in ${details[type + "Name"]}`,
            imageUrl: imageUrl,
          },
          data: {
            title: details[type + "Name"],
            body: `${userName} has added you in ${details[type + "Name"]}`,
            imageUrl: imageUrl,
            type: type,
            notificationType: "ADD_USER",
            targetId: String(targetId),
            data: JSON.stringify({ sentDetail }),
          },
        };

        const options = {
          priority: "high",
          timeToLive: 60 * 60 * 24, // 24 hours
        };

        await admin.messaging().sendEachForMulticast({
          tokens: value.fcmTokens,
          ...payload,
          ...options,
          webpush: {
            fcmOptions: {
              link: `${process.env.FRONT_BASE_URL}${getUrl(type)}?entityId=${
                restDetails._id
              }`,
            },
          },
        });
      } catch (err) {
        console.log(
          "Error sending notification to user",
          value._id.toString(),
          err
        );
      }
    });
  } catch (err) {
    console.log(
      "Error sending notification for message:",
      message._id?.toString(),
      err
    );
  }
}

module.exports = {
  sendNotification,
  sendNotificationToAddUserInGroup,
};
