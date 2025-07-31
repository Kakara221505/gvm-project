const mongoose = require("mongoose");
const UserModel = require("../models/User");
const UserRoleModel = require("../models/UserRole");
const UserMediaModel = require("../models/UserMedia");
const Channel = require("../models/Channel");
const Chat = require("../models/Chat");
const Group = require("../models/Group");
const AvtarModel = require("../models/Avtar");
const messages = require("../utils/messages");
const Conversation = require("../models/Conversation");
const { allCountries } = require("country-telephone-data");
const { emitRefreshEvent, emitUpdateEvent } = require("../socket/socket");
const BlockedUser = require("../models/BlockedUser");
const jwt = require("jsonwebtoken");

async function emitUpdate(userId, newDetails) {
  const chats = await Chat.find({
    users: userId,
  });

  if (chats.length == 0) return;

  chats.forEach((chat) => {
    const otherUser = chat.users.find((ele) => ele.toString() != String(userId));
    emitUpdateEvent([otherUser], "chat", chat._id, newDetails);
  });
}

function getCountryNameFromDialCode(dialCode) {
  const normalizedCode = dialCode.replace(/[^\d]/g, ""); // Keep only digits
  const match = allCountries.find(
    (country) => country.dialCode === normalizedCode
  );
  return match ? match.name : "Unknown";
}
// Get all users
async function getUsers(req, res, next) {
  try {
    const { search = "", userRole } = req.query;
    const loggedInUserId = req.user.id;

    if (userRole && !["Admin", "User"].includes(userRole)) {
      return res.status(400).json({ message: messages.error.INVALID_ROLE });
    }

    const filter = {
      isDeleted: false,
      isVerified: true,
      _id: { $ne: loggedInUserId },
      email: { $ne: "admin@gmail.com" },
    };

    if (search) {
      const decodedSearch = decodeURIComponent(search.trim().replace(/%/g, "+"));
      const normalizedSearch = decodedSearch.replace(/\s+/g, "");
      const safeSearch = escapeRegExp(normalizedSearch);
      const regex = new RegExp(safeSearch, "i");
      filter.$or = [
        { email: { $regex: safeSearch, $options: "i" } },
        { name: { $regex: safeSearch, $options: "i" } },
        { phone: { $regex: safeSearch, $options: "i" } },
        { countryCode: { $regex: safeSearch, $options: "i" } },
        {
          $expr: {
            $regexMatch: {
              input: { $concat: ["$countryCode", "$phone"] },
              regex: regex,
            },
          },
        },
      ];
    }
    if (userRole) {
      const userRoleRecord = await UserRoleModel.findOne({
        Name: userRole,
      }).lean();
      if (!userRoleRecord) {
        return res.status(400).json({ message: messages.error.INVALID_ROLE });
      }
      filter.userRoleID = userRoleRecord._id;
    }

    const users = await UserModel.find(filter)
      .populate("userRoleID", "name")
      .select("-password -otp -accessToken -createdAt -updatedAt")
      .sort({ _id: -1 });

    const userIds = users.map((user) => user._id);

    const [userMediaRecords, avtarRecords] = await Promise.all([
      UserMediaModel.find({
        userID: { $in: userIds },
        isMainMedia: true,
      }).select("userID mediaUrl"),
      AvtarModel.find({
        _id: { $in: users.map((u) => u.avtarId).filter(Boolean) },
      }).select("_id avtarImage"),
    ]);

    const userMediaMap = {};
    userMediaRecords.forEach((media) => {
      userMediaMap[media.userID] = media.mediaUrl;
    });

    const avtarMap = {};
    avtarRecords.forEach((avtar) => {
      avtarMap[avtar._id] = avtar.avtarImage;
    });

    const formattedUsers = users.map((user) => {
      const avtarImage = user.avtarId ? avtarMap[user.avtarId] : null;
      return {
        _id: user._id,
        userRoleID: user.userRoleID._id,
        role: user.userRoleID.Name,
        email: user.email,
        name: user.name,
        countryCode: user.countryCode,
        phone: user.phone,
        isPaidUser: user.isPaidUser,
        gender: user.gender,
        about: user.about,
        isVerified: user.isVerified,
        loginType: user.loginType,
        isDeleted: user.isDeleted,
        privacy: user.privacy,
        avtarId: user.avtarId || null,
        avtarImage: avtarImage ? `${process.env.BASE_URL}${avtarImage}` : null,
        userImage:
          !avtarImage && userMediaMap[user._id]
            ? `${process.env.BASE_URL}${userMediaMap[user._id]}`
            : null,
      };
    });

    const count = await UserModel.countDocuments(filter);

    return res.status(200).json({
      users: formattedUsers,
      totalUsers: count,
    });
  } catch (error) {
    return next(error);
  }
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


// async function getAllUsersDataWithPagination(req, res, next) {
//   try {
//     const { search = "", userRole, page = 1, limit = 10 } = req.query;
//     const loggedInUserId = req.user.id;

//     if (userRole && !["Admin", "User"].includes(userRole)) {
//       return res.status(400).json({ message: messages.error.INVALID_ROLE });
//     }

//     const filter = {
//       isDeleted: false,
//       isVerified: true,
//       _id: { $ne: loggedInUserId }, 
//       email: { $ne: "admin@gmail.com" },
//     };

//     if (search) {
//       const safeSearch = escapeRegExp(search.trim());
//       filter.$or = [
//         { email: { $regex: safeSearch, $options: "i" } },
//         { phone: { $regex: safeSearch, $options: "i" } },
//         { name: { $regex: safeSearch, $options: "i" } },
//       ];
//     }
    
//     if (userRole) {
//       const userRoleRecord = await UserRoleModel.findOne({ Name: userRole }).lean();
//       if (!userRoleRecord) {
//         return res.status(400).json({ message: messages.error.INVALID_ROLE });
//       }
//       filter.userRoleID = userRoleRecord._id;
//     }

//     const totalUsers = await UserModel.countDocuments(filter);
//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     const users = await UserModel.find(filter)
//     .populate("userRoleID", "Name")
//     .select("-password -otp -accessToken -createdAt -updatedAt")
//     .sort({ name: 1 })
//     .collation({ locale: "en", strength: 1 }) 
//     .skip(skip)
//     .limit(parseInt(limit));
  

//     const userIds = users.map((user) => user._id);

//     const [userMediaRecords, avtarRecords] = await Promise.all([
//       UserMediaModel.find({
//         userID: { $in: userIds },
//         isMainMedia: true,
//       }).select("userID mediaUrl"),
//       AvtarModel.find({
//         _id: { $in: users.map((u) => u.avtarId).filter(Boolean) },
//       }).select("_id avtarImage"),
//     ]);

//     const userMediaMap = {};
//     userMediaRecords.forEach((media) => {
//       userMediaMap[media.userID.toString()] = media.mediaUrl;
//     });

//     const avtarMap = {};
//     avtarRecords.forEach((avtar) => {
//       avtarMap[avtar._id.toString()] = avtar.avtarImage;
//     });

//     const formattedUsers = users.map((user) => {
//       const avtarImage = user.avtarId ? avtarMap[user.avtarId.toString()] : null;

//       return {
//         _id: user._id,
//         userRoleID: user.userRoleID?._id,
//         role: user.userRoleID?.Name || null,
//         email: user.email,
//         name: user.name,
//         countryCode: user.countryCode,
//         phone: user.phone,
//         isPaidUser: user.isPaidUser,
//         gender: user.gender,
//         about: user.about,
//         isVerified: user.isVerified,
//         loginType: user.loginType,
//         isDeleted: user.isDeleted,
//         privacy: user.privacy,
//         avtarId: user.avtarId || null,
//         avtarImage: avtarImage ? `${process.env.BASE_URL}${avtarImage}` : null,
//         userImage:
//           !avtarImage && userMediaMap[user._id.toString()]
//             ? `${process.env.BASE_URL}${userMediaMap[user._id.toString()]}`
//             : null,
//       };
//     });

//     return res.status(200).json({
//       users: formattedUsers,
//       pagination: {
//         totalUsers,
//         currentPage: parseInt(page),
//         totalPages: Math.ceil(totalUsers / limit),
//         limit: parseInt(limit),
//       },
//     });
//   } catch (error) {
//     return next(error);
//   }
// }

async function getAllUsersDataWithPagination(req, res, next) {
  try {
    const { search = "", userRole, page = 1, limit = 10 } = req.query;
    const loggedInUserId = req.user.id;
 
    if (userRole && !["Admin", "User"].includes(userRole)) {
      return res.status(400).json({ message: messages.error.INVALID_ROLE });
    }

    const filter = {
      isDeleted: false,
      isVerified: true,
      _id: { $ne: loggedInUserId },
      email: { $ne: "admin@gmail.com" },
    };

    if (search) {
      const safeSearch = escapeRegExp(search.trim());
      const combinedPhoneRegex = new RegExp(safeSearch.replace(/\s+/g, ""), "i");
      filter.$or = [
        { email: { $regex: safeSearch, $options: "i" } },
        { phone: { $regex: safeSearch, $options: "i" } },
        { name: { $regex: safeSearch, $options: "i" } },
        {
          $expr: {
            $regexMatch: {
              input: { $concat: ["$countryCode", "$phone"] },
              regex: combinedPhoneRegex,
            },
          },
        },
      ];
    }

    if (userRole) {
      const userRoleRecord = await UserRoleModel.findOne({ Name: userRole }).lean();
      if (!userRoleRecord) {
        return res.status(400).json({ message: messages.error.INVALID_ROLE });
      }
      filter.userRoleID = userRoleRecord._id;
    }

    const totalUsers = await UserModel.countDocuments(filter);
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await UserModel.find(filter)
      .populate("userRoleID", "Name")
      .select("-password -otp -accessToken -createdAt -updatedAt")
      .sort({ name: 1 })
      .collation({ locale: "en", strength: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const userIds = users.map((user) => user._id);

    // Get list of blocked user IDs by logged-in user
    const blockedRecords = await BlockedUser.find({
      blockedBy: loggedInUserId,
      blockedTo: { $in: userIds },
    }).select("blockedTo");

    const blockedToSet = new Set(blockedRecords.map((b) => b.blockedTo.toString()));

    const [userMediaRecords, avtarRecords] = await Promise.all([
      UserMediaModel.find({
        userID: { $in: userIds },
        isMainMedia: true,
      }).select("userID mediaUrl"),
      AvtarModel.find({
        _id: { $in: users.map((u) => u.avtarId).filter(Boolean) },
      }).select("_id avtarImage"),
    ]);

    const userMediaMap = {};
    userMediaRecords.forEach((media) => {
      userMediaMap[media.userID.toString()] = media.mediaUrl;
    });

    const avtarMap = {};
    avtarRecords.forEach((avtar) => {
      avtarMap[avtar._id.toString()] = avtar.avtarImage;
    });

    const formattedUsers = users.map((user) => {
      const userIdStr = user._id.toString();
      const avtarImage = user.avtarId ? avtarMap[user.avtarId.toString()] : null;

      return {
        _id: user._id,
        userRoleID: user.userRoleID?._id,
        role: user.userRoleID?.Name || null,
        email: user.email,
        name: user.name,
        countryCode: user.countryCode,
        phone: user.phone,
        isPaidUser: user.isPaidUser,
        gender: user.gender,
        about: user.about,
        isVerified: user.isVerified,
        loginType: user.loginType,
        isDeleted: user.isDeleted,
        privacy: user.privacy,
        avtarId: user.avtarId || null,
        avtarImage: avtarImage ? `${process.env.BASE_URL}${avtarImage}` : null,
        userImage:
          !avtarImage && userMediaMap[userIdStr]
            ? `${process.env.BASE_URL}${userMediaMap[userIdStr]}`
            : null,
        isBlocked: blockedToSet.has(userIdStr), //Final result
      };
    });

    return res.status(200).json({
      users: formattedUsers,
      pagination: {
        totalUsers,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalUsers / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    return next(error);
  }
}


async function getUserById(req, res, next) {
  try {
    const userId = req.user.id;

    const requestUser = await UserModel.findOne({
      _id: userId,
      isDeleted: false,
      isVerified: true,
    })
      .populate("userRoleID", "name description")
      .select(
        "+encryptedPrivateKey -password -otp -accessToken -createdAt -updatedAt"
      );

    if (!requestUser) {
      return res.status(404).json({ message: messages.error.USER_NOT_FOUND });
    }

    const [userMedia, avtarData] = await Promise.all([
      UserMediaModel.findOne({ userID: userId, isMainMedia: true }).select(
        "mediaUrl"
      ),
      requestUser.avtarId
        ? AvtarModel.findById(requestUser.avtarId).select("avtarImage")
        : null,
    ]);

    const avtarImage = avtarData
      ? `${process.env.BASE_URL}${avtarData.avtarImage}`
      : null;
    const mediaUrl = userMedia
      ? `${process.env.BASE_URL}${userMedia.mediaUrl}`
      : null;

    const sanitizedUser = {
      _id: requestUser._id,
      userRoleID: requestUser.userRoleID._id,
      role: requestUser.userRoleID?.name || null,
      email: requestUser.email,
      userName: requestUser.userName,
      name: requestUser.name,
      countryCode: requestUser.countryCode,
      phone: requestUser.phone,
      isPaidUser: requestUser.isPaidUser,
      isVerified: requestUser.isVerified,
      gender: requestUser.gender,
      about: requestUser.about,
      loginType: requestUser.loginType,
      isDeleted: requestUser.isDeleted,
      privacy: requestUser.privacy,
      avtarId: requestUser.avtarId || null,
      avtarImage: avtarImage || null,
      encryptedPrivateKey: requestUser.encryptedPrivateKey || null,
      userImage: !avtarImage ? mediaUrl : null,
      isMuted: requestUser.isMuted,
    };

    return res.status(200).json({
      status: messages.success.STATUS,
      user: sanitizedUser,
    });
  } catch (error) {
    return next(error);
  }
}


async function deleteUser(req, res, next) {
  try {
    const { userId } = req.params;

    // Step 1: Soft delete user
    // const user = await UserModel.findByIdAndUpdate(
    //   userId,
    //   { isDeleted: true },
    //   { new: true }
    // );
    // if (!user) {
    //   return res.status(404).json({ message: messages.error.USER_NOT_FOUND });
    // }

    const user = await UserModel.findOne({
      _id: userId,
      isDeleted: false,
    });

    if (!user) {
      return res.status(404).json({ message: messages.error.USER_NOT_FOUND });
    }

    user.isDeleted = true;
    user.isVerified = false;
    await user.save();

    // Step 2: Delete user's chat data
    const chats = await Chat.find({ users: userId });
    for (const chat of chats) {
      await Chat.findByIdAndDelete(chat._id);
    }
    emitUpdate(userId, { deleted: true });

    const conversations = await Conversation.find({});
    for (const conv of conversations) {
      if (conv.AESKeyOfUser?.has(userId.toString())) {
        conv.AESKeyOfUser.delete(userId.toString());
        await conv.save();
      }
    }

    // Step 3: Handle Groups
    const groups = await Group.find({
      $or: [{ users: userId }, { adminId: userId }],
    });

    for (const group of groups) {
      const newDetails = {};
      const wasAdmin = group.adminId.map(String).includes(userId.toString());

      // Remove user
      group.users = group.users.filter(
        (id) => id.toString() !== userId.toString()
      );
      group.adminId = group.adminId.filter(
        (id) => id.toString() !== userId.toString()
      );
      emitUpdateEvent(group.users, "group", group._id, {
        deletedUsers: [userId],
      });
      if (wasAdmin) {
        emitUpdateEvent(group.users, "group", group._id, {
          removedAdmin: [userId],
        });
      }

      // If no admins left, promote one
      if (wasAdmin && group.adminId.length === 0 && group.users.length > 0) {
        group.adminId.push(group.users[0]);
        emitUpdateEvent(group.users, "group", group._id, {
          newAdmin: group.users[0],
        });
      }

      // If group is empty, soft delete
      if (group.users.length === 0 && group.adminId.length === 0) {
        group.isDeleted = true;
        emitUpdateEvent(group.users, "group", group._id, { deleted: true });
      }
      await group.save();
    }

    // Step 4: Handle Channels
    const channels = await Channel.find({
      $or: [{ users: userId }, { adminId: userId }],
    });

    for (const channel of channels) {
      const wasAdmin = channel.adminId.map(String).includes(userId.toString());

      // Remove user
      channel.users = channel.users.filter(
        (id) => id.toString() !== userId.toString()
      );
      channel.adminId = channel.adminId.filter(
        (id) => id.toString() !== userId.toString()
      );

      // If no admins left, promote one
      if (
        wasAdmin &&
        channel.adminId.length === 0 &&
        channel.users.length > 0
      ) {
        channel.adminId.push(channel.users[0]);
      }

      // If channel is empty, soft delete
      if (channel.users.length === 0 && channel.adminId.length === 0) {
        channel.isDeleted = true;
        emitUpdateEvent(channel.users, "channel", channel._id, {
          deleted: true,
        });
      }

      await channel.save();
    }

    return res.status(200).json({ message: messages.success.USER_DELETED });
  } catch (error) {
    console.error("Error deleting user:", error);
    return next(error);
  }
}

async function adminUpdateUser(req, res, next) {
  // #swagger.tags = ['UserDetails']
  // #swagger.description = 'Update user details'
  //   console.log("data")
  let {
    userID,
    name,
    userName,
    email,
    phone,
    countryCode,
    avtarId,
    isVerified,
    loginType,
    deviceToken,
    gender,
    about,
    privacy,
  } = req.body;
  let loginUser = req.user;

  try {
    // Find the user by ID and ensure it's not deleted
    const requestUser = await UserModel.findOne({
      _id: userID,
      isDeleted: false,
    });

    if (!requestUser) {
      return res.status(404).json({
        message: messages.error.USER_NOT_FOUND,
        status: messages.error.STATUS,
      });
    }

    // Check if email or phone already exists for another user
    // if (email) {
    //   const existingUserByEmail = await UserModel.findOne({
    //     email,
    //     isDeleted: false,
    //     _id: { $ne: userID },
    //   });
    //   if (existingUserByEmail) {
    //     return res.status(409).json({
    //       message: messages.error.EMAIL_EXISTS,
    //       status: messages.error.STATUS,
    //     });
    //   }
    // }

    // if (phone) {
    //   const existingUserByPhone = await UserModel.findOne({
    //     phone,
    //     isDeleted: false,
    //     _id: { $ne: userID },
    //   });
    //   if (existingUserByPhone) {
    //     return res.status(409).json({
    //       message: messages.error.PHONE_EXISTS,
    //       status: messages.error.STATUS,
    //     });
    //   }
    // }

    if (userName) {
      const existingUserByUserName = await UserModel.findOne({
        userName,
        isDeleted: false,
        _id: { $ne: userID },
      });
      if (existingUserByUserName) {
        return res.status(409).json({
          message: messages.error.USER_NAME_EXISTS,
          status: messages.error.STATUS,
        });
      }
    }

    const newDetails = {};
    // Update user fields that exist in the schema
    if (name) {
      requestUser.name = name;
      newDetails.name = name;
    }
    // if (email) requestUser.email = email;
    if (userName) {
      requestUser.userName = userName;
      newDetails.userName = userName;
    }
    // if (phone) requestUser.phone = phone;
    if (gender) requestUser.gender = gender;
    if (about) {
      requestUser.about = about;
      newDetails.about = about;
    }
    // if (countryCode) {
    //   requestUser.countryCode = countryCode;
    //   const countryName = getCountryNameFromDialCode(countryCode);
    //   requestUser.countryName = countryName;
    // }
    if (isVerified !== undefined) requestUser.isVerified = isVerified;
    if (loginType) requestUser.loginType = loginType;
    if (privacy) {
      requestUser.privacy = privacy;
      newDetails.privacy = privacy;
    }
    if (deviceToken) requestUser.deviceToken = deviceToken;

    // If avatar is selected
    if (avtarId) {
      const avtar = AvtarModel.findById(avtarId);

      if (avtar) {
        requestUser.avtarId = avtarId;
        newDetails.avtarId = avtarId;
        newDetails.avtarImage = `${process.env.BASE_URL}${avtar.avtarImage}`;
        newDetails.mediaId = null;
        newDetails.media = null;
        // Delete existing user media if avatar is selected
        const existingMedia = await UserMediaModel.findOne({
          userID,
          isMainMedia: true,
        });
        if (existingMedia) {
          await existingMedia.deleteOne();
        }

        requestUser.mediaId = null;
      }
    }

    // Handle Profile Image Upload
    let profileImageURL = "";
    if (req.file) {
      profileImageURL = `${process.env.USER_MEDIA_ROUTE}${req.file.filename}`;
      requestUser.avtarId = null;
      let userMedia = await UserMediaModel.findOne({
        userID,
        isMainMedia: true,
      });

      if (userMedia) {
        userMedia.mediaUrl = profileImageURL;
        userMedia = await userMedia.save();
      } else {
        // Create new media entry
        userMedia = await UserMediaModel.create({
          userID,
          mediaUrl: profileImageURL,
          mediaType: "image",
          isMainMedia: true,
        });
        requestUser.mediaId = userMedia._id;
        await requestUser.save();
      }
      newDetails.mediaId = userMedia._id;
      newDetails.mediaUrl = `${process.env.BASE_URL}${userMedia.mediaUrl}`;
    }
    await requestUser.save();
    emitUpdate(userID, newDetails);

    // Get avatar image if avtarId exists
    let avtarImage = null;
    if (requestUser.avtarId) {
      const avtarData = await AvtarModel.findOne({ _id: requestUser.avtarId });
      if (avtarData && avtarData.avtarImage) {
        avtarImage = `${process.env.BASE_URL}${avtarData.avtarImage}`;
      }
    }
    // Response Data
    const responseData = {
      ID: requestUser._id,
      email: requestUser.email,
      name: requestUser.name,
      phone: requestUser.phone,
      userName: requestUser.userName,
      countryCode: requestUser.countryCode,
      isVerified: requestUser.isVerified,
      loginType: requestUser.loginType,
      deviceToken: requestUser.deviceToken,
      gender: requestUser.gender,
      about: requestUser.about,
      privacy: requestUser.privacy,
      avtarImage: avtarImage || null,
      userImage: profileImageURL
        ? `${process.env.BASE_URL}${profileImageURL}`
        : null,
    };

    return res.status(200).json({
      user: responseData,
      message: messages.success.USER_UPDATED,
      status: messages.success.STATUS,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateUser(req, res, next) {
  const userID = req.user.id;
  let {
    name,
    userName,
    email,
    phone,
    countryCode,
    avtarId,
    isVerified,
    loginType,
    deviceToken,
    gender,
    about,
    privacy,
    isMuted,
    oldFcmToken,
    newFcmToken
  } = req.body;

  try {
    const requestUser = await UserModel.findOne({
      _id: userID,
      isDeleted: false,
    }).select("+publicKey +encryptedPrivateKey");

    if (!requestUser) {
      return res.status(404).json({
        message: messages.error.USER_NOT_FOUND,
        status: messages.error.STATUS,
      });
    }

    // Check for unique username
    if (userName) {
      const existingUserByUserName = await UserModel.findOne({
        userName,
        isDeleted: false,
        _id: { $ne: userID },
      });
      if (existingUserByUserName) {
        return res.status(409).json({
          message: messages.error.USER_NAME_EXISTS,
          status: messages.error.STATUS,
        });
      }
    }


    const newDetails = {};
    // Assign user fields
    if (name) {
      requestUser.name = name;
      newDetails.name = name;
    }
    // if (email) requestUser.email = email;
    if (userName) {
      requestUser.userName = userName;
      newDetails.userName = userName;
    }
    // if (phone) requestUser.phone = phone;
    if (gender) requestUser.gender = gender;
    if (about) {
      requestUser.about = about;
      newDetails.about = about;
    }
  
    if (isVerified !== undefined) requestUser.isVerified = isVerified;
    if (loginType) requestUser.loginType = loginType;
    if (privacy) {
      requestUser.privacy = privacy;
      newDetails.privacy = privacy;
    }
    if (deviceToken) requestUser.deviceToken = deviceToken;
    if (isMuted !== undefined) requestUser.isMuted = isMuted === "true";

    if (oldFcmToken) {
      requestUser.fcmTokens = requestUser.fcmTokens.filter(
        (token) => token !== oldFcmToken
      );
    }

    if (newFcmToken) {
      if (!requestUser.fcmTokens.includes(newFcmToken)) {
        requestUser.fcmTokens.push(newFcmToken);
      }
      requestUser.deviceToken = newFcmToken;
    }

    // Handle avatar selection
    if (avtarId) {
      const avtar = await AvtarModel.findById(avtarId);

      if (avtar) {
        newDetails.avtarId = avtarId;
        newDetails.avtarImage = `${process.env.BASE_URL}${avtar.avtarImage}`;
        newDetails.mediaId = null;
        newDetails.media = null;
        requestUser.avtarId = avtarId;

        // Remove existing main media if avatar is selected
        const existingMedia = await UserMediaModel.findOne({
          userID,
          isMainMedia: true,
        });
        if (existingMedia) {
          await existingMedia.deleteOne();
        }

        requestUser.mediaId = null;
      }
    }

    // Handle new profile image upload
    let profileImageURL = "";
    if (req.file) {
      profileImageURL = `${process.env.USER_MEDIA_ROUTE}${req.file.filename}`;
      requestUser.avtarId = null;
      let userMedia = await UserMediaModel.findOne({
        userID,
        isMainMedia: true,
      });
      if (userMedia) {
        userMedia.mediaUrl = profileImageURL;
        userMedia = await userMedia.save();
      } else {
        // Create new media entry
        userMedia = await UserMediaModel.create({
          userID,
          mediaUrl: profileImageURL,
          mediaType: "image",
          isMainMedia: true,
        });
        requestUser.mediaId = userMedia._id;
        await requestUser.save();
      }
      newDetails.mediaId = userMedia._id;
      newDetails.mediaUrl = `${process.env.BASE_URL}${userMedia.mediaUrl}`;
    }

    await requestUser.save();
    emitUpdate(userID, newDetails);
    // === Handle Avatar or Media Response ===
    let avtarImage = null;
    let userImage = null;

    if (requestUser.avtarId) {
      const avtarData = await AvtarModel.findById(requestUser.avtarId);
      if (avtarData?.avtarImage) {
        avtarImage = `${process.env.BASE_URL}${avtarData.avtarImage}`;
      }
    }

    if (!avtarImage) {
      const userMedia = await UserMediaModel.findOne({
        _id: requestUser.mediaId || undefined,
        userID: userID,
        isMainMedia: true,
      });

      if (userMedia?.mediaUrl) {
        userImage = `${process.env.BASE_URL}${userMedia.mediaUrl}`;
      }
    }

    // If new upload exists, override userImage
    if (profileImageURL) {
      userImage = `${process.env.BASE_URL}${profileImageURL}`;
    }

    await requestUser.populate([
      { path: "blockedBy", select: "_id name email phone" },
      { path: "reportedBy", select: "_id name email phone" },
      { path: "userRoleID", select: "_id" },
    ]);

    requestUser.fcmTokens = requestUser.fcmTokens.filter(
      (token) => token && token !== "undefined"
    );


    const accessToken = jwt.sign({ _id: requestUser._id }, process.env.JWT_SECRET, {
    });


    // === Response Payload ===
    const responseData = {
      ID: requestUser._id,
      _id: requestUser._id,
      email: requestUser.email,
      userName: requestUser.userName,
      isOnline: requestUser.isOnline || false,
      privacy: requestUser.privacy,
      name: requestUser.name,
      countryCode: requestUser.countryCode,
      phone: requestUser.phone,
      isPaidUser: requestUser.isPaidUser || false,
      isVerified: requestUser.isVerified,
      isOtpVerified: requestUser.isOtpVerified ?? true,
      otpExpirationTime: requestUser.otpExpirationTime ?? null,
      gender: requestUser.gender,
      about: requestUser.about,
      mediaId: requestUser.mediaId,
      avtarId: requestUser.avtarId,
      encryptedPrivateKey: requestUser.encryptedPrivateKey,
      blockedBy: requestUser.blockedBy || [],
      reportedBy: requestUser.reportedBy || [],
      blockedUsers: requestUser.blockedUsers || [],
      reportedUsers: requestUser.reportedUsers || [],
      lastSeen: requestUser.lastSeen,
      isMuted: requestUser.isMuted,
      isBlockedByAdmin: requestUser.isBlockedByAdmin || false,
      countryName: requestUser.countryName || "",
      fcmTokens: requestUser.fcmTokens,
      role: requestUser.role || "User",
      userImage,
      avtarImage,

      publicKey: requestUser.publicKey || null,
      encryptedPrivateKey: requestUser.encryptedPrivateKey || null,
    };

    return res.status(200).json({
      accessToken:accessToken,
      user: responseData,
      message: messages.success.USER_UPDATED,
      status: messages.success.STATUS,
    });
  } catch (error) {
    return next(error);
  }
}

async function getAllUsersWithPagination(req, res, next) {
  try {
    const {
      search = "",
      userRole,
      page = 1,
      limit = 10,
      sortType = "",
    } = req.query;

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const skip = (pageNumber - 1) * pageSize;
    const loggedInUserId = req.user.id;

    if (userRole && !["Admin", "User"].includes(userRole)) {
      return res.status(400).json({ message: messages.error.INVALID_ROLE });
    }

    const filter = {
      isDeleted: false,
      isVerified: true,
      _id: { $ne: loggedInUserId },
    };

    if (sortType) {
      const today = new Date();
      switch (sortType) {
        case "TODAY":
          filter.createdAt = {
            $gte: new Date(today.setHours(0, 0, 0)),
            $lte: new Date(today.setHours(23, 59, 59)),
          };
          break;
        case "THIS_MONTH":
          const startOfMonth = new Date(
            today.getFullYear(),
            today.getMonth(),
            1
          );
          const endOfMonth = new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            1
          );
          endOfMonth.setMilliseconds(-1);
          filter.createdAt = {
            $gte: startOfMonth,
            $lte: endOfMonth,
          };
          break;
        case "THIS_WEEK":
          // Get the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
          const dayOfWeek = today.getDay();

          // Assuming you want the week to start on Monday:
          const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;

          // Start of the week (Monday)
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() + diffToMonday);
          startOfWeek.setHours(0, 0, 0, 0);

          // End of the week (Sunday)
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          endOfWeek.setHours(23, 59, 59, 999);
          filter.createdAt = {
            $gte: startOfWeek,
            $lte: endOfWeek,
          };
          break;
      }
    }
    if (search) {
      const cleanedSearch = search.trim().replace(/\s+/g, "");
      const regex = new RegExp(cleanedSearch, "i");
    
      filter.$or = [
        { email: { $regex: regex } },
        { phone: { $regex: regex } },
        { name: { $regex: regex } },
        { countryName: { $regex: regex } },
        { gender: { $regex: regex } },
        { countryCode: { $regex: regex } },
        {
          $expr: {
            $regexMatch: {
              input: { $concat: ["$countryCode", "$phone"] },
              regex: regex,
            },
          },
        },
      ];
    }

    const adminRole = await UserRoleModel.findOne({ Name: "Admin" }).lean();

    if (userRole) {
      const roleRecord = await UserRoleModel.findOne({ Name: userRole }).lean();
      if (!roleRecord) {
        return res.status(400).json({ message: messages.error.INVALID_ROLE });
      }
      filter.userRoleID = roleRecord._id;
    } else if (adminRole) {
      // Always exclude Admin unless userRole=Admin is explicitly passed
      filter.userRoleID = { $ne: adminRole._id };
    }

    const totalUsers = await UserModel.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / pageSize);

    const users = await UserModel.find(filter)
      .populate("userRoleID", "name")
      .select("-password -otp -accessToken")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    const userIds = users.map((user) => user._id);
    const avtarIds = users.map((user) => user.avtarId).filter(Boolean);

    const [userMediaRecords, avtarRecords] = await Promise.all([
      UserMediaModel.find({
        userID: { $in: userIds },
        isMainMedia: true,
      }).select("userID mediaUrl"),
      AvtarModel.find({ _id: { $in: avtarIds } }).select("_id avtarImage"),
    ]);

    const userMediaMap = {};
    userMediaRecords.forEach((media) => {
      userMediaMap[media.userID] = media.mediaUrl;
    });

    const avtarMap = {};
    avtarRecords.forEach((avtar) => {
      avtarMap[avtar._id] = avtar.avtarImage;
    });

    const formattedUsers = users.map((user) => {
      const avtarImage = user.avtarId ? avtarMap[user.avtarId] : null;
      return {
        _id: user._id,
        userRoleID: user.userRoleID._id,
        role: user.userRoleID.Name,
        email: user.email,
        name: user.name,
        countryCode: user.countryCode,
        countryName: user.countryName,
        phone: user.phone,
        isPaidUser: user.isPaidUser,
        gender: user.gender,
        about: user.about,
        isVerified: user.isVerified,
        loginType: user.loginType,
        isDeleted: user.isDeleted,
        privacy: user.privacy,
        avtarId: user.avtarId || null,
        avtarImage: avtarImage ? `${process.env.BASE_URL}${avtarImage}` : null,
        userImage:
          !avtarImage && userMediaMap[user._id]
            ? `${process.env.BASE_URL}${userMediaMap[user._id]}`
            : null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    });

    return res.status(200).json({
      users: formattedUsers,
      totalUsers,
      totalPages,
      currentPage: pageNumber,
    });
  } catch (error) {
    return next(error);
  }
}

async function getAvtar(req, res, next) {
  try {
    const avatars = await AvtarModel.find().sort({ createdAt: -1 });
    const fullAvatars = avatars.map((avatar) => {
      return {
        _id: avatar._id,
        avtarImage: `${process.env.BASE_URL}${avatar.avtarImage}`,
      };
    });

    res.status(200).json({ avatars: fullAvatars });
  } catch (error) {
    return next(error);
  }
}

async function blockUser(req, res, next) {
  try {
    const userId = req.user.id;
    const { targetUserId } = req.params;

    if (userId === targetUserId) {
      return res.status(400).json({ message: "You cannot block yourself." });
    }

    const targetUser = await UserModel.findById(targetUserId);
    if (!targetUser || targetUser.isDeleted) {
      return res.status(404).json({ message: "User not found." });
    }

    const existingBlock = await BlockedUser.findOne({
      blockedBy: userId,
      blockedTo: targetUserId,
    });

    if (!existingBlock) {
      const blockedUSer = new BlockedUser({
        blockedBy: userId,
        blockedTo: targetUserId,
      });

      await blockedUSer.save();
    }
    return res.status(200).json({ message: "User blocked successfully." });
  } catch (error) {
    return next(error);
  }
}

async function unblockUser(req, res, next) {
  try {
    const userId = req.user.id;
    const { targetUserId } = req.params;

    if (userId === targetUserId) {
      return res.status(400).json({ message: "You cannot unblock yourself." });
    }

    const targetUser = await UserModel.findById(targetUserId);
    const currentUser = await UserModel.findById(userId);

    if (!targetUser || targetUser.isDeleted || !currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    await BlockedUser.deleteMany({
      blockedBy: userId,
      blockedTo: targetUserId,
    });

    return res.status(200).json({
      message: "User unblocked successfully.",
    });
  } catch (error) {
    return next(error);
  }
}

async function reportUser(req, res, next) {
  try {
    const userId = req.user.id;
    const { targetUserId } = req.params;

    if (userId === targetUserId) {
      return res.status(400).json({ message: "You cannot report yourself." });
    }

    const targetUser = await UserModel.findById(targetUserId);
    if (!targetUser || targetUser.isDeleted) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!targetUser.reportedBy.includes(userId)) {
      targetUser.reportedBy.push(userId);
      targetUser.isReported = true;
      await targetUser.save();
    }

    const currentUser = await UserModel.findById(userId);
    if (!currentUser.reportedUsers.includes(targetUserId)) {
      currentUser.reportedUsers.push(targetUserId);
      await currentUser.save();
    }

    return res.status(200).json({ message: "User reported successfully." });
  } catch (error) {
    return next(error);
  }
}

async function getBlockedUsers(req, res, next) {
  try {
    const { page = 1, limit = 10, search = "", sortType = "" } = req.query;
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const skip = (pageNumber - 1) * pageSize;
    // Step 1: Build base query for BlockedUser
    let query = null;
    let total = 0;
    let blockedUsers = [];
    // Step 2: Apply search filter if needed
    if (search) {
      const regexSearch = new RegExp(search, "i");

      const pipeline = [
        {
          $lookup: {
            from: "User", // collection name of users
            localField: "blockedBy",
            foreignField: "_id",
            as: "blockedBy",
          },
        },
        {
          $unwind: "$blockedBy",
        },
        {
          $lookup: {
            from: "User", // same user collection
            localField: "blockedTo",
            foreignField: "_id",
            as: "blockedTo",
          },
        },
        {
          $unwind: "$blockedTo",
        },
        {
          $match: {
            $or: [
              { "blockedBy.name": { $regex: regexSearch } },
              { "blockedTo.name": { $regex: regexSearch } },
              { "blockedTo.email": { $regex: regexSearch } },
              { "blockedTo.countryName": { $regex: regexSearch } },
              { "blockedTo.phone": { $regex: regexSearch } },
            ],
          },
        },
        {
          $facet: {
            total: [{ $count: "count" }],
            results: [{ $skip: skip }, { $limit: pageSize }],
          },
        },
      ];

      const result = await BlockedUser.aggregate(pipeline);
      total = result[0].total[0]?.count || 0;
      blockedUsers = result[0].results;
    } else {
      query = BlockedUser.find()
        .populate({
          path: "blockedBy",
          select: "name",
        })
        .populate({
          path: "blockedTo",
          select:
            "name email countryName countryCode phone userRoleID avtarId isPaidUser isVerified gender about isDeleted privacy",
          populate: {
            path: "userRoleID",
            select: "name",
          },
        });
      // Step 3: Get total count and paginated results
      total = await BlockedUser.countDocuments(query._conditions || {});
      blockedUsers = await query.skip(skip).limit(pageSize);
    }

    // Step 4: Get media and avatar records
    const blockedUserIds = blockedUsers.map((block) => block.blockedTo._id);
    const avtarIds = blockedUsers
      .map((block) => block.blockedTo.avtarId)
      .filter(Boolean);

    const [mediaRecords, avatarRecords] = await Promise.all([
      UserMediaModel.find({
        userID: { $in: blockedUserIds },
        isMainMedia: true,
      }).select("userID mediaUrl mediaType"),
      AvtarModel.find({
        _id: { $in: avtarIds },
      }).select("_id avtarImage"),
    ]);

    const mediaMap = {};
    mediaRecords.forEach((media) => {
      mediaMap[media.userID] = {
        mediaUrl: media.mediaUrl
          ? `${process.env.BASE_URL}${media.mediaUrl}`
          : null,
        mediaType: media.mediaType || null,
      };
    });

    const avatarMap = {};
    avatarRecords.forEach((avatar) => {
      avatarMap[avatar._id] = `${process.env.BASE_URL}${avatar.avtarImage}`;
    });

    // Step 5: Build final list with blockedBy info
    const formattedUsers = blockedUsers.map((block) => {
      const user = block.blockedTo;
      return {
        _id: user._id,
        userRoleID: user.userRoleID?._id || null,
        role: user.userRoleID?.name || "User",
        email: user.email,
        name: user.name,
        countryCode: user.countryCode,
        countryName: user.countryName,
        phone: user.phone,
        isPaidUser: user.isPaidUser,
        isVerified: user.isVerified,
        gender: user.gender,
        about: user.about,
        isDeleted: user.isDeleted,
        privacy: user.privacy,
        avtarId: user.avtarId || null,
        avtarImage: avatarMap[user.avtarId] || null,
        userMedia: mediaMap[user._id] || { mediaUrl: null, mediaType: null },
        blockedBy: {
          name: block.blockedBy.name,
          id: block.blockedBy._id,
        },
      };
    });

    return res.status(200).json({
      status: "success",
      users: formattedUsers,
      totalUsers: total,
      totalPages: Math.ceil(total / pageSize),
      currentPage: pageNumber,
    });
  } catch (error) {
    console.error("Error in getBlockedUsers:", error);
    next(error);
  }
}

async function getReportedUsers(req, res, next) {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const skip = (pageNumber - 1) * pageSize;

    // Step 1: Get all users who reported others
    const reporters = await UserModel.find({
      reportedUsers: { $exists: true, $not: { $size: 0 } },
    }).select("reportedUsers name");

    let reportedPairs = [];

    // Step 2: Create { reportedByName, reportedUserId } pairs
    reporters.forEach((reporter) => {
      reporter.reportedUsers.forEach((reportedId) => {
        reportedPairs.push({
          reportedById: reporter._id,
          reportedByName: reporter.name,
          reportedUserId: reportedId,
        });
      });
    });

    // Step 3: Apply search filter if needed
    if (search) {
      const regexSearch = new RegExp(search, "i");
      const allReportedUserIds = reportedPairs.map((p) => p.reportedUserId);
      const matchedUsers = await UserModel.find({
        _id: { $in: allReportedUserIds },
        $or: [
          { name: { $regex: regexSearch } },
          { email: { $regex: regexSearch } },
          { phone: { $regex: regexSearch } },
        ],
      }).select("_id");

      const matchedIds = matchedUsers.map((u) => u._id.toString());
      reportedPairs = reportedPairs.filter((p) =>
        matchedIds.includes(p.reportedUserId.toString())
      );
    }

    const total = reportedPairs.length;
    const paginatedPairs = reportedPairs.slice(skip, skip + pageSize);
    const reportedUserIds = paginatedPairs.map((p) => p.reportedUserId);

    // Step 4: Get reported user details
    const reportedUsers = await UserModel.find({
      _id: { $in: reportedUserIds },
      isDeleted: false,
      isVerified: true,
    })
      .populate("userRoleID", "name")
      .select("-password -otp -accessToken");

    const avtarIds = reportedUsers.map((u) => u.avtarId).filter(Boolean);

    const [mediaRecords, avatarRecords] = await Promise.all([
      UserMediaModel.find({
        userID: { $in: reportedUserIds },
        isMainMedia: true,
      }).select("userID mediaUrl mediaType"),
      AvtarModel.find({ _id: { $in: avtarIds } }).select("_id avtarImage"),
    ]);

    const mediaMap = {};
    mediaRecords.forEach((media) => {
      mediaMap[media.userID] = {
        mediaUrl: media.mediaUrl
          ? `${process.env.BASE_URL}${media.mediaUrl}`
          : null,
        mediaType: media.mediaType || null,
      };
    });

    const avatarMap = {};
    avatarRecords.forEach((avatar) => {
      avatarMap[avatar._id] = `${process.env.BASE_URL}${avatar.avtarImage}`;
    });

    // Step 5: Format response
    const formattedUsers = paginatedPairs
      .map((pair) => {
        const user = reportedUsers.find(
          (u) => u._id.toString() === pair.reportedUserId.toString()
        );
        if (!user) return null;

        return {
          _id: user._id,
          userRoleID: user.userRoleID?._id || null,
          role: user.userRoleID?.name || "User",
          email: user.email,
          name: user.name,
          countryCode: user.countryCode,
          phone: user.phone,
          isPaidUser: user.isPaidUser,
          isVerified: user.isVerified,
          gender: user.gender,
          about: user.about,
          isDeleted: user.isDeleted,
          privacy: user.privacy,
          avtarId: user.avtarId || null,
          avtarImage: avatarMap[user.avtarId] || null,
          userMedia: mediaMap[user._id] || { mediaUrl: null, mediaType: null },
          reportedBy: pair.reportedByName,
        };
      })
      .filter(Boolean); // Remove nulls

    return res.status(200).json({
      status: "success",
      users: formattedUsers,
      totalUsers: total,
      totalPages: Math.ceil(total / pageSize),
      currentPage: pageNumber,
    });
  } catch (error) {
    console.error("Error in getReportedUsers:", error);
    next(error);
  }
}

async function blockUserByAdmin(req, res, next) {
  try {
    const { targetUserId } = req.params;

    const targetUser = await UserModel.findById(targetUserId);
    if (!targetUser || targetUser.isDeleted) {
      return res.status(404).json({ message: "User not found." });
    }

    if (targetUser.isBlockedByAdmin) {
      return res
        .status(400)
        .json({ message: "User is already blocked by admin." });
    }

    targetUser.isBlockedByAdmin = true;
    await targetUser.save();

    return res
      .status(200)
      .json({ message: "User successfully blocked by admin." });
  } catch (error) {
    return next(error);
  }
}

async function unblockUserByAdmin(req, res, next) {
  try {
    const { blockedUserId, blockedById } = req.body;

    // Validate both users
    const blockedUser = await UserModel.findById(blockedUserId);
    const blockedByUser = await UserModel.findById(blockedById);

    if (
      !blockedUser ||
      blockedUser.isDeleted ||
      !blockedByUser ||
      blockedByUser.isDeleted
    ) {
      return res.status(404).json({ message: " both users not found." });
    }

    // Remove blockedById from blockedUser.blockedBy
    blockedUser.blockedBy.pull(blockedById);
    await blockedUser.save();

    // Remove blockedUserId from blockedByUser.blockedUsers
    blockedByUser.blockedUsers.pull(blockedUserId);
    await blockedByUser.save();

    return res.status(200).json({ message: "User Unblocked  successfully." });
  } catch (error) {
    console.error("Admin unblock error:", error);
    return next(error);
  }
}

async function getUserChatStats(req, res, next) {
  try {
    const currentUserId = req.user?.id;
    // Total users (not deleted)
    const totalUsers = await UserModel.countDocuments({
      isDeleted: false,
      isVerified: true,
      _id: { $ne: currentUserId },
    });

    // Total chats
    const totalChats = await Chat.countDocuments();

    // Aggregate to find unique blocked user IDs
    const blockedUsersAgg = await UserModel.aggregate([
      { $unwind: "$blockedUsers" },
      {
        $group: {
          _id: null,
          uniqueBlockedUsers: { $addToSet: "$blockedUsers" },
        },
      },
      {
        $project: {
          count: { $size: "$uniqueBlockedUsers" },
        },
      },
    ]);

    const totalBlockedUsers = blockedUsersAgg[0]?.count || 0;

    return res.status(200).json({
      status: "success",
      data: {
        totalUsers,
        totalChats,
        totalBlockedUsers,
      },
    });
  } catch (error) {
    return next(error);
  }
}

// const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function normalizePhone(phone) {
  return phone?.replace(/\D/g, "") || "";
}

async function getRegisteredUsersByNameAndPhone(req, res, next) {
  try {
    const { user = [], search = "" } = req.body;
    const loggedInUserId = req.user?._id?.toString();

    if (!Array.isArray(user) || user.length === 0) {
      return res.status(400).json({ message: "user[] list is required" });
    }

    const matchConditions = [];

    user.forEach((u) => {
      const normalizedPhone = normalizePhone(u.phone);
      if (!normalizedPhone) return;

      // Match by normalized version of (countryCode + phone)
      matchConditions.push({
        $expr: {
          $regexMatch: {
            input: {
              $replaceAll: {
                input: {
                  $replaceAll: {
                    input: {
                      $replaceAll: {
                        input: {
                          $replaceAll: {
                            input: { $concat: ["$countryCode", "$phone"] },
                            find: "+",
                            replacement: ""
                          }
                        },
                        find: "(",
                        replacement: ""
                      }
                    },
                    find: ")",
                    replacement: ""
                  }
                },
                find: "-",
                replacement: ""
              }
            },
            regex: `^${normalizedPhone}$`,
            options: "i"
          }
        }
      });
    });

    if (matchConditions.length === 0) {
      return res.status(400).json({ message: "Invalid phone format in user[]" });
    }

    const users = await UserModel.aggregate([
      {
        $match: {
          isDeleted: false,
          isVerified: true,
          $or: matchConditions,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    const filteredUsers = users.filter((u) => u._id.toString() !== loggedInUserId);
    const userIds = filteredUsers.map((u) => u._id);

    const [userMediaRecords, avtarRecords] = await Promise.all([
      UserMediaModel.find({ userID: { $in: userIds }, isMainMedia: true }).select("userID mediaUrl"),
      AvtarModel.find({
        _id: { $in: filteredUsers.map((u) => u.avtarId).filter(Boolean) },
      }).select("_id avtarImage"),
    ]);

    const userMediaMap = {};
    userMediaRecords.forEach((media) => {
      userMediaMap[media.userID.toString()] = media.mediaUrl;
    });

    const avtarMap = {};
    avtarRecords.forEach((avtar) => {
      avtarMap[avtar._id.toString()] = avtar.avtarImage;
    });

    let formattedUsers = filteredUsers.map((user) => {
      const avtarImage = user.avtarId ? avtarMap[user.avtarId.toString()] : null;

      return {
        _id: user._id,
        userRoleID: user.userRoleID,
        email: user.email,
        name: user.name,
        countryCode: user.countryCode,
        phone: user.phone,
        isPaidUser: user.isPaidUser,
        gender: user.gender,
        about: user.about,
        isVerified: user.isVerified,
        loginType: user.loginType,
        isDeleted: user.isDeleted,
        privacy: user.privacy,
        avtarId: user.avtarId || null,
        avtarImage: avtarImage ? `${process.env.BASE_URL}${avtarImage}` : null,
        userImage:
          !avtarImage && userMediaMap[user._id.toString()]
            ? `${process.env.BASE_URL}${userMediaMap[user._id.toString()]}`
            : null,
      };
    });

    // Optional search filter
    const finalSearch = search.trim().toLowerCase();
    if (finalSearch !== "") {
      formattedUsers = formattedUsers.filter((u) => {
        const fullPhone = ((u.countryCode || "") + (u.phone || "")).replace(/\D/g, "");
        return (
          u.name?.toLowerCase().includes(finalSearch) ||
          fullPhone.includes(finalSearch) ||
          u.email?.toLowerCase().includes(finalSearch)
        );
      });
    }

    return res.status(200).json({
      users: formattedUsers,
    });
  } catch (error) {
    console.error("Error in getRegisteredUsersByNameAndPhone:", error);
    return next(error);
  }
}



module.exports = {
  getUsers,
  getUserById,
  deleteUser,
  updateUser,
  getAllUsersWithPagination,
  getAvtar,
  blockUser,
  unblockUser,
  reportUser,
  getBlockedUsers,
  getReportedUsers,
  adminUpdateUser,
  blockUserByAdmin,
  unblockUserByAdmin,
  getUserChatStats,
  getAllUsersDataWithPagination,
  getRegisteredUsersByNameAndPhone
};
