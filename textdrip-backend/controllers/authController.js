const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const UserModel = require("../models/User");
const UserRoleModel = require("../models/UserRole");
const AvtarModal = require("../models/Avtar");
const UserMediaModal = require("../models/UserMedia");
const messages = require("../utils/messages");
const commonFunctions = require("../utils/commonFunctions");
const { sendEmailOTP } = require("../utils/emailUtility");
const { sendSMS } = require("../utils/smsUtility");
const mongoose = require("mongoose");
const { allCountries } = require("country-telephone-data");

function getCountryNameFromDialCode(dialCode) {
  const normalizedCode = dialCode.replace(/[^\d]/g, ""); // Keep only digits
  const match = allCountries.find(
    (country) => country.dialCode === normalizedCode
  );
  return match ? match.name : "Unknown";
}

// Register new user
async function register(req, res, next) {
  // Extracting parameters from the request body
  let {
    name,
    email,
    userName,
    password,
    phone,
    countryCode,
    role,
    deviceToken,
    publicKey,
    encryptedPrivateKey,
    fcmToken,
  } = req.body;

  try {
    if (!publicKey || !encryptedPrivateKey) {
      return res.status(400).json({ message: "Key required..." });
    }

    const countryName = getCountryNameFromDialCode(countryCode);
    // Check if user already exists by email, phone or username
    const existingUser = await findExistingUser(email, phone, userName);

    if (existingUser) {
      // If user exists and is verified, return error
      if (existingUser.isVerified) {
        // If email and phone exist but username is different
        // if (existingUser.email === email && existingUser.phone === phone) {
        //   return res.status(409).json({ message: messages.error.PHONE_AND_EMAIL_ALREADY_EXIST });
        // }

        // Check if only email already exists with a different phone number
        if (existingUser.email === email && existingUser.phone !== phone) {
          return res
            .status(409)
            .json({ message: messages.error.EMAIL_ALREADY_EXISTS });
        }

        // Check if only phone already exists with a different email
        if (existingUser.phone === phone && existingUser.email !== email) {
          return res
            .status(409)
            .json({ message: messages.error.PHONE_NUMBER_ALREADY_EXISTS });
        }

        // Check if only username already exists with a different email and phone
        if (
          existingUser.userName === userName &&
          existingUser.email !== email &&
          existingUser.phone !== phone
        ) {
          return res
            .status(409)
            .json({ message: messages.error.USERNAME_ALREADY_EXISTS });
        }

        // If email, phone, and username all exist with the same values, handle as already registered
        if (
          existingUser.email === email &&
          existingUser.phone === phone &&
          existingUser.userName === userName
        ) {
          return res
            .status(409)
            .json({ message: messages.error.USER_ALREADY_REGISTERED });
        }

        return res
          .status(409)
          .json({ message: messages.error.USER_ALREADY_REGISTERED });
      }

      // If the user exists but not verified, send OTP again and update the OTP and expiration time
      if (!existingUser.isVerified) {
        const existingEmailUser = await UserModel.findOne({
          email: email,
          isVerified: true,
          isDeleted:false
        });
        if (
          existingEmailUser &&
          existingEmailUser._id.toString() !== existingUser._id.toString()
        ) {
          return res
            .status(409)
            .json({ message: messages.error.EMAIL_ALREADY_EXISTS });
        }

        // Check if the new phone already exists for a verified user
        const existingPhoneUser = await UserModel.findOne({
          phone: phone,
          isVerified: true,
          isDeleted:false
        });
        if (
          existingPhoneUser &&
          existingPhoneUser._id.toString() !== existingUser._id.toString()
        ) {
          return res
            .status(409)
            .json({ message: messages.error.PHONE_NUMBER_ALREADY_EXISTS });
        }

        // Check if the new username already exists for a verified user
        const existingUserName = await UserModel.findOne({
          userName: userName,
          isVerified: true,
          isDeleted:false
        });
        if (
          existingUserName &&
          existingUserName._id.toString() !== existingUser._id.toString()
        ) {
          return res
            .status(409)
            .json({ message: messages.error.USERNAME_ALREADY_EXISTS });
        }

        // If no conflict, update the user details (email, phone, username)
        existingUser.email = email || existingUser.email;
        existingUser.phone = phone || existingUser.phone;
        existingUser.countryCode = countryCode || existingUser.countryCode;
        existingUser.countryName = countryName;
        existingUser.userName = userName || existingUser.userName;
        existingUser.publicKey = publicKey;
        existingUser.encryptedPrivateKey = encryptedPrivateKey;
        existingUser.fcmTokens = fcmToken ? [fcmToken] : [];

        let otp = commonFunctions.randomSixDigitCode();
        let expirationTime = new Date(
          Date.now() + commonFunctions.constants.OTP_EXPIRATION_SECONDS * 1000
        );

        // Update OTP and expiration time in the database
        existingUser.otp = otp;
        existingUser.otpExpirationTime = expirationTime;
        // Generate access token for the unverified user
        const tempAccessToken = jwt.sign(
          sanitizeUser(existingUser),
          JWT_SECRET
        );
        existingUser.accessToken = tempAccessToken;
        await existingUser.save();
        const formattedPhone = `${existingUser.countryCode}${existingUser.phone}`;
        console.log("vivek", formattedPhone);
        // Send OTP via phone (SMS)
        await sendSMS(formattedPhone, otp);

        return res.status(200).json({
          message: messages.success.USER_REGISTERED,
          accessToken: tempAccessToken,
          user: sanitizeUser(existingUser),
        });
      }
    }

    // If no existing user found, proceed with registration

    // Check if the provided role exists
    const roleRecord = await UserRoleModel.findOne({ name: role });
    if (!roleRecord) {
      return res
        .status(400)
        .json({ message: messages.error.INVALID_USER_ROLE });
    }

    // Hash password
    let hashedPassword = "";
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Generate OTP for phone registration
    let otp = commonFunctions.randomSixDigitCode();
    let expirationTime = new Date(
      Date.now() + commonFunctions.constants.OTP_EXPIRATION_SECONDS * 1000
    );

    // Create new user object
    const newUser = new UserModel({
      name,
      email,
      userName,
      password: hashedPassword,
      phone,
      countryCode,
      countryName,
      otp,
      isVerified: false,
      otpExpirationTime: expirationTime,
      userRoleID: roleRecord._id,
      publicKey,
      encryptedPrivateKey,
      fcmTokens: fcmToken ? [fcmToken] : [],
    });

    // Save the new user to the database
    await newUser.save();
    const formattedPhone = `${countryCode}${phone}`;
    // Send OTP via phone (SMS)
    await sendSMS(formattedPhone, otp);

    // Generate access token for the newly registered user
    const tempAccessToken = jwt.sign(sanitizeUser(newUser), JWT_SECRET);
    newUser.accessToken = tempAccessToken;
    await newUser.save();

    // Respond with the access token and user details
    return res.status(200).json({
      message: messages.success.USER_REGISTERED,
      accessToken: tempAccessToken,
      user: sanitizeUser(newUser),
    });
  } catch (error) {
    console.log(error);
    if (error.statusCode === 400) {
      return res.status(400).json({ message: error.message });
    }
    return next(error);
  }
}

// Simplified user lookup function that checks for email, phone, or username
async function findExistingUser(email, phone, userName) {
  return await UserModel.findOne({
    $or: [
      { email, isDeleted: false },
      { phone, isDeleted: false },
      { userName, isDeleted: false },
    ],
  });
}

// Function to sanitize the user object (remove sensitive fields)
function sanitizeUser(user) {
  const sanitizedUser = user.toObject();
  delete sanitizedUser.password;
  delete sanitizedUser.otp;
  delete sanitizedUser.accessToken;
  delete sanitizedUser.deviceToken;
  delete sanitizedUser.isDeleted;
  delete sanitizedUser.settings;
  delete sanitizedUser.createdAt;
  delete sanitizedUser.updatedAt;
  return sanitizedUser;
}

// Login with Password (using email or userName)
async function loginWithPassword(req, res, next) {
  let { emailOrUserName, password, deviceToken, fcmToken } = req.body; // Accept emailOrUserName instead of both email and username

  try {
    // Find existing user using Email or UserName (both email and username are treated as common fields)
    const existingUser = await UserModel.findOne({
      $and: [
        { isDeleted: false },
        {
          $or: [{ email: emailOrUserName }, { userName: emailOrUserName }],
        },
      ],
    }).select("+encryptedPrivateKey");

    // If user does not exist
    if (!existingUser) {
      return res.status(404).json({ message: messages.error.USER_NOT_FOUND });
    }

    // Check if the user is verified
    if (!existingUser.isVerified) {
      return res
        .status(403)
        .json({ message: "Your registration is not completed." });
    }

    if (existingUser.isBlockedByAdmin) {
      return res
        .status(403)
        .json({ message: "Your account has been blocked by admin." });
    }

    // Verify password
    const isPasswordMatch = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordMatch) {
      return res
        .status(400)
        .json({ message: messages.error.INVALID_CREDENTIALS });
    }

    // Populate userRoleID to get role name
    await existingUser.populate("userRoleID", "name");
    // Generate Access Token
    // const accessToken = jwt.sign(sanitizeUser(existingUser), JWT_SECRET);
    const accessToken = jwt.sign({ _id: existingUser._id }, JWT_SECRET);

    // Set access token and Device Token if provided
    existingUser.accessToken = accessToken;
    if (deviceToken) {
      existingUser.deviceToken = deviceToken;
    }

    if (fcmToken) {
      existingUser.fcmTokens = [...existingUser.fcmTokens, fcmToken];
    }

    // Save the updated user data
    await existingUser.save();
    const sanitized = sanitizeUser(existingUser);

    let userImage = null;
    let avtarImage = null;

    if (existingUser.mediaId) {
      const media = await UserMediaModal.findById(existingUser.mediaId);
      if (media?.mediaUrl) {
        userImage = `${process.env.BASE_URL}${media.mediaUrl}`;
      }
    }

    if (existingUser.avtarId) {
      const avatar = await AvtarModal.findById(existingUser.avtarId);
      if (avatar?.avtarImage) {
        avtarImage = `${process.env.BASE_URL}${avatar.avtarImage}`;
      }
    }

    delete sanitized.userRoleID;
    const responseUser = {
      ...sanitized,
      role: existingUser.userRoleID?.name || null,
      encryptedPrivateKey: existingUser.encryptedPrivateKey || null,
      userImage,
      avtarImage,
    };

    return res.status(200).json({
      message: messages.success.LOGIN_SUCCESS,
      accessToken: accessToken,
      user: responseUser, // Send sanitized user data
    });
  } catch (error) {
    return next(error);
  }
}

async function findExistingUserByEmailOrUserName(emailOrUserName) {
  try {
    // Search for the user by either email or username
    const user = await UserModel.findOne({
      $or: [{ email: emailOrUserName }, { userName: emailOrUserName }],
    });
    return user;
  } catch (error) {
    throw new Error("Error finding user by email or username.");
  }
}

// Request Login OTP (phone-based)
async function requestLoginOTP(req, res, next) {
  try {
    const { phone, countryCode } = req.body;

    if (!phone || phone.trim() === "") {
      return res.status(400).json({ message: messages.error.PHONE_REQUIRED });
    }

    const user = await UserModel.findOne({
      phone: phone,
      countryCode: countryCode,
      isDeleted: false,
    });

    if (!user) {
      return res.status(404).json({ message: messages.error.USER_NOT_FOUND });
    }

    // If the user is verified, we can proceed to send OTP
    if (user.isVerified) {
      // Generate OTP and expiration time
      const otp = commonFunctions.randomSixDigitCode();
      const expirationTime = new Date(
        Date.now() + commonFunctions.constants.OTP_EXPIRATION_SECONDS * 1000
      );
      const formattedPhone = `${countryCode}${phone}`;

      // Send OTP via phone (SMS)
      await sendSMS(formattedPhone, `${otp}`);

      // Update OTP and expiration time in the user's record
      user.otp = otp;
      user.isOtpVerified = false;
      user.otpExpirationTime = expirationTime;
      await user.save();

      return res
        .status(200)
        .json({ message: messages.success.OTP_SENT, ID: user._id });
    }

    // If the user is not verified, send an error
    return res
      .status(404)
      .json({ message: "Your registration is not completed." });
  }catch (error) {
    console.log(error);
  if (error.statusCode === 400) {
    return res.status(400).json({ message: error.message });
  }
    return next(error);
  }
}


// Login with OTP (phone-based)
async function loginWithOTP(req, res, next) {
  try {
    const { phone, otp, deviceToken, fcmToken } = req.body;

    // Explicitly include encryptedPrivateKey
    let user = await UserModel.findOne({ phone, isDeleted: false }).select(
      "+encryptedPrivateKey"
    );

    if (!user) {
      return res.status(404).json({ message: messages.error.USER_NOT_FOUND });
    }

    if (user.isBlockedByAdmin) {
      return res
        .status(403)
        .json({ message: "Your account has been blocked by admin." });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: messages.error.OTP_MISMATCH });
    }

    if (new Date() > user.otpExpirationTime) {
      return res.status(400).json({ message: messages.error.OTP_EXPIRED });
    }

    // Generate access token
    // const accessToken = jwt.sign(sanitizeUser(user), JWT_SECRET);
    const accessToken = jwt.sign({ _id: user._id }, JWT_SECRET);

    user.otp = null;
    user.isOtpVerified = true;
    user.isVerified = true;
    user.otpExpirationTime = null;
    user.accessToken = accessToken;
    user.deviceToken = deviceToken;

    if (fcmToken) {
      user.fcmTokens = [...user.fcmTokens, fcmToken];
    }

    await user.save();

    // Prepare image URLs
    let userImage = null;
    let avtarImage = null;

    if (user.mediaId) {
      const media = await UserMediaModal.findById(user.mediaId);
      if (media?.mediaUrl) {
        userImage = `${process.env.BASE_URL}${media.mediaUrl}`;
      }
    }

    if (user.avtarId) {
      const avatar = await AvtarModal.findById(user.avtarId);
      if (avatar?.avtarImage) {
        avtarImage = `${process.env.BASE_URL}${avatar.avtarImage}`;
      }
    }

    // Prepare response
    const sanitized = sanitizeUser(user);
    const responseUser = {
      ...sanitized,
      encryptedPrivateKey: user.encryptedPrivateKey || null,
      userImage,
      avtarImage,
    };

    return res.status(200).json({
      message: messages.success.LOGIN_SUCCESS,
      accessToken,
      user: responseUser,
    });
  } catch (error) {
    return next(error);
  }
}

// Resend OTP (phone-based)
async function resendOTP(req, res, next) {
  try {
    const { phone, countryCode } = req.body;

    if (!phone || phone.trim() === "") {
      return res.status(400).json({ message: messages.error.PHONE_REQUIRED });
    }

    const user = await UserModel.findOne({
      phone: phone,
      countryCode: countryCode,
      isDeleted: false,
    });

    if (!user) {
      return res.status(404).json({ message: messages.error.USER_NOT_FOUND });
    }

    const code = commonFunctions.randomSixDigitCode();
    const expirationTime = new Date(
      Date.now() + commonFunctions.constants.OTP_EXPIRATION_SECONDS * 1000
    );

    user.otp = code;
    user.isOtpVerified = false;
    user.otpExpirationTime = expirationTime;
    await user.save();
    const formattedPhone = `${countryCode}${phone}`;
    // Send OTP via phone (SMS)
    await sendSMS(formattedPhone, `${code}`);

    return res
      .status(200)
      .json({ message: messages.success.OTP_SENT, ID: user._id });
  } catch (error) {
    console.log(error);
  if (error.statusCode === 400) {
    return res.status(400).json({ message: error.message });
  }
    return next(error);
  }
}

// Verify OTP (using User ID)
async function verifyOTP(req, res, next) {
  const { id, otp, deviceToken } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid User ID format" });
    }

    const user = await UserModel.findById(new mongoose.Types.ObjectId(id));

    if (!user) {
      return res.status(404).json({ message: messages.error.USER_NOT_FOUND });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: messages.error.OTP_MISMATCH });
    }

    if (new Date() > user.otpExpirationTime) {
      return res.status(400).json({ message: messages.error.OTP_EXPIRED });
    }

    const accessToken = jwt.sign(sanitizeUser(user), JWT_SECRET);

    user.otp = null;
    user.isOtpVerified = true;
    user.isVerified = true;
    user.otpExpirationTime = null;
    user.accessToken = accessToken;
    user.deviceToken = deviceToken;
    await user.save();

    const sanitizedUser = sanitizeUser(user);

    return res.status(200).json({
      message: messages.success.OTP_VERIFIED,
      accessToken: accessToken,
      user: sanitizedUser,
    });
  } catch (error) {
    return next(error);
  }
}

// Forgot Password (using email or phone)
async function forgotPassword(req, res, next) {
  try {
    const { email, phone, NewPassword } = req.body;
    const hashedPassword = await bcrypt.hash(NewPassword, 10);

    // Find user by Email or Phone
    const user = await UserModel.findOne({
      $or: [{ email: email }, { phone: phone }],
      isDeleted: false,
    });

    if (!user) {
      return res.status(404).json({ message: messages.error.USER_NOT_FOUND });
    }

    user.password = hashedPassword;
    user.accessToken = "";
    await user.save();

    return res.status(200).json({ message: messages.success.PASSWORD_CHANGED });
  } catch (error) {
    return next(error);
  }
}
// Verify forgot password OTP
async function verifyForgotPasswordOTP(req, res, next) {
  try {
    const { phone, email, otp, newPassword } = req.body;

    let user;

    // Find user by phone or email
    if (phone) {
      user = await UserModel.findOne({ phone: phone, isDeleted: false });
    } else if (email) {
      user = await UserModel.findOne({ email: email, isDeleted: false });
    }
    // If no user found
    if (!user) {
      return res.status(404).json({ message: messages.error.USER_NOT_FOUND });
    }

    // Check if OTP is valid
    if (user.otp !== otp) {
      return res.status(400).json({ message: messages.error.OTP_MISMATCH });
    }

    // Check if OTP is expired
    if (new Date() > user.otpExpirationTime) {
      return res.status(400).json({ message: messages.error.OTP_EXPIRED });
    }

    // Generate access token
    const accessToken = jwt.sign(sanitizeUser(user), JWT_SECRET);
    user.accessToken = accessToken;
    user.isVerified = true;
    await user.save();

    return res.status(200).json({
      message: messages.success.FORGOT_PASSWORD_OTP_VERIFIED,
      accessToken: accessToken,
    });
  } catch (error) {
    return next(error);
  }
}

// Change Password (using existing password)
async function changePassword(req, res, next) {
  try {
    const { OldPassword, NewPassword } = req.body;

    // Find user by ID
    const user = await UserModel.findOne({
      _id: req.user.id,
      isDeleted: false,
    });
    if (!user) {
      return res.status(404).json({ message: messages.error.USER_NOT_FOUND });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(OldPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: messages.error.INVALID_OLD_PASSWORD });
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(NewPassword, 10);
    user.password = hashedPassword;
    user.accessToken = "";
    await user.save();

    return res.status(200).json({ message: messages.success.PASSWORD_CHANGED });
  } catch (error) {
    return next(error);
  }
}

// Admin forgot password - Generate reset token
async function adminForgotPassword(req, res, next) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    // Find user by email
    const user = await UserModel.findOne({
      email: email,
      isDeleted: false,
    }).populate("userRoleID");

    if (!user) {
      return res.status(404).json({ message: "Admin not found." });
    }

    // Optional: ensure user is an admin
    if (user.userRoleID?.name.toLowerCase() !== "admin") {
      return res.status(403).json({ message: "Access denied. Not an admin." });
    }

    // Generate access token
    const accessToken = jwt.sign(sanitizeUser(user), JWT_SECRET);

    // Save token in DB (optional, based on your system's token handling)
    user.accessToken = accessToken;
    await user.save();

    return res.status(200).json({
      message: "Reset token generated successfully.",
      token: accessToken,
      id: user._id,
    });
  } catch (error) {
    return next(error);
  }
}

async function adminUserRegister(req, res, next) {
  let {
    name,
    email,
    userName,
    password,
    phone,
    countryCode,
    role,
    deviceToken,
    publicKey,
    encryptedPrivateKey,
    about = "",
    gender,
  } = req.body;

  try {
    // Validation for required keys
    if (!publicKey || !encryptedPrivateKey) {
      return res
        .status(400)
        .json({ message: "Public and Encrypted Private Keys are required." });
    }

    const countryName = getCountryNameFromDialCode(countryCode);
    // Check if user already exists
    const existingUser = await findExistingUser(email, phone, userName);

    if (existingUser) {
      return res
        .status(409)
        .json({ message: messages.error.USER_ALREADY_REGISTERED });
    }

    // Check if role exists
    const roleRecord = await UserRoleModel.findOne({ name: role });
    if (!roleRecord) {
      return res
        .status(400)
        .json({ message: messages.error.INVALID_USER_ROLE });
    }

    // Hash password if provided
    let hashedPassword = "";
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Create user without OTP verification
    const newUser = new UserModel({
      name,
      email,
      userName,
      password: hashedPassword,
      phone,
      countryCode,
      countryName,
      isVerified: true,
      isOtpVerified: true,
      about,
      userRoleID: roleRecord._id,
      publicKey,
      encryptedPrivateKey,
      deviceToken,
      gender,
    });

    // Handle Profile Image Upload
    let profileImageURL = "";
    if (req.file) {
      profileImageURL = `${process.env.USER_MEDIA_ROUTE}${req.file.filename}`;

      const userMedia = new UserMediaModal({
        userID: newUser._id,
        mediaUrl: profileImageURL,
        mediaType: "image",
        isMainMedia: true,
      });

      const savedMedia = await userMedia.save();
      newUser.mediaId = savedMedia._id;
      newUser.avtarId = null; // Clear avatar if image is uploaded
    }

    await newUser.save();

    // Generate token
    const tempAccessToken = jwt.sign(sanitizeUser(newUser), JWT_SECRET, {
      expiresIn: "1d",
    });
    newUser.accessToken = tempAccessToken;
    await newUser.save();

    // Avatar image if selected (in case you want to support avtarId too in the future)
    let avtarImage = null;
    if (newUser.avtarId) {
      const avtarData = await AvtarModel.findOne({ _id: newUser.avtarId });
      if (avtarData?.avtarImage) {
        avtarImage = `${process.env.BASE_URL}${avtarData.avtarImage}`;
      }
    }

    return res.status(200).json({
      message: messages.success.USER_REGISTERED,
      accessToken: tempAccessToken,
      user: {
        ...sanitizeUser(newUser),
        avtarImage,
        userImage: profileImageURL
          ? `${process.env.BASE_URL}${profileImageURL}`
          : null,
      },
    });
  } catch (error) {
    console.error("Admin Register Error:", error);
    return next(error);
  }
}

async function logout(req, res) {
  try {
    const { fcmToken } = req.body;
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: messages.error.USER_NOT_FOUND });
    }
    user.fcmTokens = user.fcmTokens.filter((token) => token !== fcmToken);
    user.accessToken = "";
    user.deviceToken = "";
    await user.save();
    return res.status(200).json({ message: messages.success.LOGGED_OUT });
  } catch (error) {
    res.status(500).json({ message: messages.error.LOGOUT_FAILED });
  }
}

module.exports = {
  register,
  resendOTP,
  verifyOTP,
  loginWithPassword,
  requestLoginOTP,
  loginWithOTP,
  verifyForgotPasswordOTP,
  forgotPassword,
  changePassword,
  logout,
  adminForgotPassword,
  adminUserRegister,
};
