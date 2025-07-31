const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    userRoleID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "UserRole",
    },
    groupID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
    channelID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
    },
    email: {
      type: String,
      maxlength: 128,
    },
    userName: {
      type: String,
      maxlength: 128,
      sparse: true,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    privacy: {
      type: String,
      enum: ["Nobody", "Friends", "Everyone"],
      default: "Everyone",
    },
    settings: {
      darkMode: { type: Boolean, default: false },
      notifications: { type: Boolean, default: true },
    },
    name: {
      type: String,
      maxlength: 255,
      required: true,
    },
    password: {
      type: String,
      maxlength: 128,
      // required: true,
    },
    countryCode: {
      type: String,
      maxlength: 10,
    },
    countryName: {
      type: String,
      maxlength: 100,
    },
    
    phone: {
      type: String,
      maxlength: 20,
    },
    otp: {
      type: Number,
    },
    isPaidUser: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isOtpVerified: {
      type: Boolean,
      default: false,
    },
    otpExpirationTime: {
      type: Date,
    },
    // loginType: {
    //   type: String,
    //   maxlength: 50,
    // },
    accessToken: {
      type: String,
    },
    deviceToken: {
      type: String,
      maxlength: 1500,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", ""],
      default: "",
    },
    about: {
      type: String,
      maxlength: 500,
      default: "",
    },
    mediaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserMedia",
      default: null,
    },
    avtarId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Avtar",
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    publicKey: {
      type: String,
      select: false,
      maxlength: 10000,
    },
    encryptedPrivateKey: {
      type: String,
      select: false,
      maxlength: 10000,
    },
    // isBlocked: {
    //   type: Boolean,
    //   default: false,
    // },
    // isReported: {
    //   type: Boolean,
    //   default: false,
    // },
    isBlockedByAdmin: {
      type: Boolean,
      default: false,
    },
    blockedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    reportedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    isMuted: {
      type: Boolean,
      default: false,
    },
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    reportedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    fcmTokens: [
      {
        type: String,
        default: [],
      },
    ],
  },
  { collection: "User" }
);

// UserSchema.index({ Email: 1 }, { unique: true });

module.exports = mongoose.model("User", UserSchema);
