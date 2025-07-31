const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const UserModel = require("../models/User");
const UserRoleModel = require("../models/UserRole");
const messages = require("../utils/messages");
const commonFunctions = require("../utils/commonFunctions");
const { sendEmailOTP } = require('../utils/emailUtility');
const { sendSMS } = require('../utils/smsUtility');
const mongoose = require("mongoose");

// Register new user
async function register(req, res, next) {
  let { Name, Email, Password, Phone, Country_code, Login_type, Role, DeviceToken } = req.body;

  try {
    const existingUser = await findExistingUser(Login_type, Email, Phone);
    if (existingUser) {
      if (Login_type === commonFunctions.LoginTypeEnum.SOCIAL) {
        const tempAccessToken = jwt.sign(sanitizeUser(existingUser), JWT_SECRET, { expiresIn: '1d' });
        existingUser.AccessToken = tempAccessToken;
        if (DeviceToken) {
          existingUser.DeviceToken = DeviceToken;
        }
        await existingUser.save();

        return res.status(200).json({ message: messages.success.USER_REGISTERED, AccessToken: tempAccessToken, User: sanitizeUser(existingUser) });
      }
      return res.status(409).json({ message: messages.error.USER_ALREADY_REGISTERED });
    }

    // Check if the provided role exists
    const role = await UserRoleModel.findOne({ Name: Role });
    if (!role) {
      return res.status(400).json({ message: messages.error.INVALID_USER_ROLE });
    }

    let hashedPassword = "";
    if (Login_type === commonFunctions.LoginTypeEnum.EMAIL) {
      hashedPassword = await bcrypt.hash(Password, 10);
    }

    let otp = null;
    let expirationTime = null;
    if (Login_type === commonFunctions.LoginTypeEnum.EMAIL || Login_type === commonFunctions.LoginTypeEnum.PHONE) {
      otp = commonFunctions.randomFourDigitCode();
      expirationTime = new Date(Date.now() + commonFunctions.constants.OTP_EXPIRATION_SECONDS * 1000);
    }

    const newUser = new UserModel({
      Name,
      Email,
      Password: hashedPassword,
      Phone,
      Country_code,
      Login_type,
      Otp: otp,
      Is_otp_verified: false,
      Otp_expiration_time: expirationTime,
      UserRoleID: role._id
    });

    await newUser.save();

    if (Login_type === commonFunctions.LoginTypeEnum.EMAIL) {
      await sendEmailOTP(Email, otp);
    } else if (Login_type === commonFunctions.LoginTypeEnum.PHONE) {
      await sendSMS(Phone, `${otp}`);
    } else if (Login_type === commonFunctions.LoginTypeEnum.SOCIAL) {
      await sendEmailOTP(Email, otp);
    }

    const tempAccessToken = jwt.sign(sanitizeUser(newUser), JWT_SECRET, { expiresIn: '1d' });
    newUser.AccessToken = tempAccessToken;
    await newUser.save();

    return res.status(200).json({ message: messages.success.USER_REGISTERED, AccessToken: tempAccessToken, User: sanitizeUser(newUser) });
  } catch (error) {
    console.log(error);
    return next(error);
  }
}


async function vendorRegister(req, res, next) {
  let { Name, Email, Password, Phone, Country_code, Login_type, Role, DeviceToken } = req.body;

  try {
    const existingUser = await findExistingUser(Login_type, Email, Phone);
    if (existingUser) {
      if (Login_type === commonFunctions.LoginTypeEnum.SOCIAL) {
        const tempAccessToken = jwt.sign(sanitizeUser(existingUser), JWT_SECRET, { expiresIn: '1d' });
        existingUser.AccessToken = tempAccessToken;
        if (DeviceToken) {
          existingUser.DeviceToken = DeviceToken;
        }
        await existingUser.save();

        return res.status(200).json({ message: messages.success.USER_REGISTERED, AccessToken: tempAccessToken, User: sanitizeUser(existingUser) });
      }
      return res.status(409).json({ message: messages.error.USER_ALREADY_REGISTERED });
    }

    // Check if the provided role exists
    const role = await UserRoleModel.findOne({ Name: Role });
    if (!role) {
      return res.status(400).json({ message: messages.error.INVALID_USER_ROLE });
    }

    let hashedPassword = "";
    if (Login_type === commonFunctions.LoginTypeEnum.EMAIL) {
      hashedPassword = await bcrypt.hash(Password, 10);
    }

    const newUser = new UserModel({
      Name,
      Email,
      Password: hashedPassword,
      Phone,
      Country_code,
      Login_type,
      Is_verified:true,
      Is_otp_verified: true,  // Directly setting OTP verification to true
      UserRoleID: role._id

    });

    await newUser.save();

    // Skip OTP sending (since OTP is no longer part of the registration process)
    // if (Login_type === commonFunctions.LoginTypeEnum.EMAIL) {
    //   await sendEmailOTP(Email, otp);
    // } else if (Login_type === commonFunctions.LoginTypeEnum.PHONE) {
    //   await sendSMS(Phone, `${otp}`);
    // } else if (Login_type === commonFunctions.LoginTypeEnum.SOCIAL) {
    //   await sendEmailOTP(Email, otp);
    // }

    const tempAccessToken = jwt.sign(sanitizeUser(newUser), JWT_SECRET, { expiresIn: '1d' });
    newUser.AccessToken = tempAccessToken;
    await newUser.save();

    return res.status(200).json({ message: messages.success.USER_REGISTERED, AccessToken: tempAccessToken, User: sanitizeUser(newUser) });
  } catch (error) {
    console.log(error);
    return next(error);
  }
}


async function findExistingUser(loginType, email, phone) {
  if (loginType === commonFunctions.LoginTypeEnum.EMAIL) {
    return await UserModel.findOne({ Email: email, Is_deleted: false });
  } else if (loginType === commonFunctions.LoginTypeEnum.PHONE) {
    return await UserModel.findOne({ Phone: phone, Is_deleted: false });
  } else if (loginType === commonFunctions.LoginTypeEnum.SOCIAL) {
    return await UserModel.findOne({ Email: email, Is_deleted: false });
  }
  return null;
}

function sanitizeUser(user) {
  const sanitizedUser = user.toObject();
  delete sanitizedUser.Password;
  delete sanitizedUser.Otp;
  delete sanitizedUser.AccessToken;
  delete sanitizedUser.DeviceToken;
  delete sanitizedUser.Created_at;
  delete sanitizedUser.Created_by;
  delete sanitizedUser.Updated_at;
  delete sanitizedUser.Updated_by;
  return sanitizedUser;
}


// Login with Password
async function loginWithPassword(req, res, next) {
  let { Login_type, Email, Phone, Password, DeviceToken } = req.body;

  try {
    // Find existing user
    const existingUser = await findExistingUser(Login_type, Email, Phone);

    // If user does not exist
    if (!existingUser) {
      return res.status(409).json({ message: messages.error.USER_NOT_FOUND });
    }

    // If user is not verified and trying to login via Email
    if (!existingUser.Is_verified && Login_type === commonFunctions.LoginTypeEnum.EMAIL) {
      return res.status(402).json({ message: messages.error.USER_NOT_VERIFIED });
    }

    // If login is via Email, verify password
    if (Login_type === commonFunctions.LoginTypeEnum.EMAIL) {
      const isPasswordMatch = await bcrypt.compare(Password, existingUser.Password);
      if (!isPasswordMatch) {
        return res.status(401).json({ message: messages.error.INVALID_CREDENTIALS });
      }
    }

    // Generate Access Token
    const accessToken = jwt.sign(sanitizeUser(existingUser), JWT_SECRET, { expiresIn: '1d' });
    
    // Set access token and Device Token if provided
    existingUser.AccessToken = accessToken;
    if (DeviceToken) {
      existingUser.DeviceToken = DeviceToken;
    }

    // Populate UserRole data (to get Name of UserRole)
    const userWithRole = await UserModel.findById(existingUser._id)
      .populate('UserRoleID', 'Name')  // Populate only the Name field from UserRole
      .exec();  // Use `.exec()` to return the full Mongoose document

  
    // Add UserRole as a string directly to the User object
    userWithRole.UserRole = userWithRole.UserRoleID.Name;  // Add UserRole as a string (the Name of the UserRole)
    delete userWithRole.UserRoleID; // Remove the populated UserRoleID field

    // Save the updated user data
    await existingUser.save();

    return res.status(200).json({
      message: messages.success.LOGIN_SUCCESS,
      AccessToken: accessToken,
      User: sanitizeUser(userWithRole), // Send sanitized user data
    });
  } catch (error) {
    return next(error);
  }
}



async function requestLoginOTP(req, res, next) {
  try {
    const { Login_type, Phone } = req.body;

    let user;
    if (Login_type === commonFunctions.LoginTypeEnum.PHONE) {
      if (!Phone || Phone.trim() === '') {
        return res.status(400).json({ message: messages.error.PHONE_REQUIRED });
      }
      user = await UserModel.findOne({ Phone: Phone, Is_deleted: false });
    }

    if (!user) {
      return res.status(401).json({ message: messages.error.USER_NOT_FOUND });
    }

    // Generate and send OTP
    const otp = commonFunctions.randomFourDigitCode();
    const expirationTime = new Date(Date.now() + commonFunctions.constants.OTP_EXPIRATION_SECONDS * 1000);

    if (Login_type === commonFunctions.LoginTypeEnum.PHONE) {
      await sendSMS(Phone, `${otp}`);
    }

    user.Otp = otp;
    user.Is_otp_verified = false;
    user.Otp_expiration_time = expirationTime;
    await user.save();

    return res.status(200).json({ message: messages.success.OTP_SENT, ID: user._id });
  } catch (error) {
    return next(error);
  }
}

async function loginWithOTP(req, res, next) {
  try {
    const { Login_type, Phone, OTP, DeviceToken } = req.body;

    let user;
    if (Login_type === commonFunctions.LoginTypeEnum.PHONE) {
      user = await UserModel.findOne({ Phone: Phone, Is_deleted: false });
    }

    if (!user) {
      return res.status(401).json({ message: messages.error.USER_NOT_FOUND });
    }

    if (user.Otp !== OTP) {
      return res.status(400).json({ message: messages.error.OTP_MISMATCH });
    }

    if (new Date() > user.Otp_expiration_time) {
      return res.status(400).json({ message: messages.error.OTP_EXPIRED });
    }

    // Generate access token
    const accessToken = jwt.sign(sanitizeUser(user), JWT_SECRET, { expiresIn: '1d' });

    user.Otp = null;
    user.Is_otp_verified = true;
    user.Is_verified = true;
    user.Otp_expiration_time = null;
    user.AccessToken = accessToken;
    user.DeviceToken = DeviceToken;
    await user.save();

    const sanitizedUser = sanitizeUser(user);

    return res.status(200).json({ message: messages.success.LOGIN_SUCCESS, AccessToken: accessToken, User: sanitizedUser });
  } catch (error) {
    return next(error);
  }
}




// Resend OTP
async function resendOTP(req, res, next) {
  try {
    const { Login_type } = req.body;

    if (Login_type === commonFunctions.LoginTypeEnum.PHONE) {
      return await resendPhoneOTP(req, res);
    } else if (Login_type === commonFunctions.LoginTypeEnum.EMAIL) {
      return await resendEmailOTP(req, res);
    } else {
      return res.status(400).json({ message: messages.error.INVALID_REQUEST_TYPE });
    }
  } catch (error) {
    return next(error);
  }
}

async function resendPhoneOTP(req, res) {
  const { Phone } = req.body;
  const code = commonFunctions.randomFourDigitCode();
  const expirationTime = new Date(Date.now() + commonFunctions.constants.OTP_EXPIRATION_SECONDS * 1000);
  
  const user = await UserModel.findOne({ Phone: Phone, Is_deleted: false });

  if (!user) {
    return res.status(400).json({ message: messages.error.USER_NOT_FOUND });
  }

  user.Otp = code;
  user.Is_otp_verified = false;
  user.Otp_expiration_time = expirationTime;
  await user.save();

  await sendSMS(Phone, `${code}`);

  return res.status(200).json({ message: messages.success.OTP_SENT, ID: user._id });
}

async function resendEmailOTP(req, res) {
  const { Email } = req.body;
  const code = commonFunctions.randomFourDigitCode();
  const expirationTime = new Date(Date.now() + commonFunctions.constants.OTP_EXPIRATION_SECONDS * 1000);
  
  const user = await UserModel.findOne({ Email: Email, Is_deleted: false });

  if (!user) {
    return res.status(400).json({ message: messages.error.USER_NOT_FOUND });
  }

  user.Otp = code;
  user.Is_otp_verified = false;
  user.Otp_expiration_time = expirationTime;
  await user.save();

  await sendEmailOTP(Email, code);

  return res.status(200).json({ message: messages.success.OTP_SENT, ID: user._id });
}

// Verify sent OTP using User ID
async function verifyOTP(req, res, next) {
  const { ID, Otp, DeviceToken } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(ID)) {
      return res.status(400).json({ message: "Invalid User ID format" });
    }

    const user = await UserModel.findById(new mongoose.Types.ObjectId(ID));

    if (!user) {
      return res.status(404).json({ message: messages.error.USER_NOT_FOUND });
    }

    if (user.Otp !== Otp) {
      return res.status(400).json({ message: messages.error.OTP_MISMATCH });
    }

    if (new Date() > user.Otp_expiration_time) {
      return res.status(400).json({ message: messages.error.OTP_EXPIRED });
    }

    const accessToken = jwt.sign(sanitizeUser(user), JWT_SECRET, { expiresIn: "1d" });

    user.Otp = null;
    user.Is_otp_verified = true;
    user.Is_verified = true;
    user.Otp_expiration_time = null;
    user.AccessToken = accessToken;
    user.DeviceToken = DeviceToken;
    await user.save();

    const sanitizedUser = sanitizeUser(user);

    return res.status(200).json({ message: messages.success.OTP_VERIFIED, AccessToken: accessToken, User: sanitizedUser });
  } catch (error) {
    return next(error);
  }
}


// Verify forgot password OTP
async function verifyForgotPasswordOTP(req, res, next) {
  try {
    const { Login_type, Phone, Email, Otp } = req.body;
    let user;

    if (Login_type == commonFunctions.LoginTypeEnum.PHONE) {
      user = await UserModel.findOne({ Phone: Phone, Is_deleted: false });
    } else if (Login_type == commonFunctions.LoginTypeEnum.EMAIL) {
      user = await UserModel.findOne({ Email: Email, Is_deleted: false });
    }

    if (!user) {
      return res.status(400).json({ message: messages.error.USER_NOT_FOUND });
    }

    // Check if OTP is valid
    if (user.Otp !== Otp) {
      return res.status(400).json({ message: messages.error.OTP_MISMATCH });
    }

    // Generate access token
    const accessToken = jwt.sign(sanitizeUser(user), JWT_SECRET, { expiresIn: '1d' });
    user.AccessToken = accessToken;
    user.Is_verified = true;
    await user.save();

    return res.status(200).json({ message: messages.success.FORGOT_PASSWORD_OTP_VERIFIED, AccessToken: accessToken });
  } catch (error) {
    return next(error);
  }
}

// Forgot Password
async function forgotPassword(req, res, next) {
  try {
    const { NewPassword } = req.body;
    const hashedPassword = await bcrypt.hash(NewPassword, 10);

    // Update user's password and remove access token
    const user = await UserModel.findOne({ _id: req.user.id, Is_deleted: false });
    if (!user) {
      return res.status(400).json({ message: messages.error.USER_NOT_FOUND });
    }

    user.Password = hashedPassword;
    user.AccessToken = "";
    await user.save();

    return res.status(200).json({ message: messages.success.PASSWORD_CHANGED });
  } catch (error) {
    return next(error);
  }
}

// Change Password
async function changePassword(req, res, next) {
  try {
    const { OldPassword, NewPassword } = req.body;

    // Find user by ID
    const user = await UserModel.findOne({ _id: req.user.id, Is_deleted: false });
    if (!user) {
      return res.status(400).json({ message: messages.error.USER_NOT_FOUND });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(OldPassword, user.Password);
    if (!isMatch) {
      return res.status(400).json({ message: messages.error.INVALID_OLD_PASSWORD });
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(NewPassword, 10);
    user.Password = hashedPassword;
    user.AccessToken = "";
    await user.save();

    return res.status(200).json({ message: messages.success.PASSWORD_CHANGED });
  } catch (error) {
    return next(error);
  }
}


// Logout user
async function logout(req, res, next) {
  try {
    // Find user and remove access token
    const user = await UserModel.findOne({ _id: req.user.id, Is_deleted: false });

    if (!user) {
      return res.status(400).json({ message: messages.error.USER_NOT_FOUND });
    }

    user.AccessToken = "";
    user.DeviceToken = "";
    await user.save();

    return res.status(200).json({ message: messages.success.LOGGED_OUT });
  } catch (error) {
    return next(error);
  }
}





module.exports = { 
register,
vendorRegister,
resendOTP,
verifyOTP,
loginWithPassword,
requestLoginOTP,
loginWithOTP,
verifyForgotPasswordOTP,
forgotPassword,
changePassword,
logout,
};
