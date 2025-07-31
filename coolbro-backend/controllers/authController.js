const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const UserModel = require('../models/user');
const UserRoleModel = require('../models/userRole');
const JWT_SECRET = process.env.JWT_SECRET;
const commonFunctions = require('../utils/commonFunctions');
const { sendEmailOTP } = require('../utils/emailUtility');
const { sendSMS } = require('../utils/smsUtility');
const messages = require('../utils/messages');

// Register new user
async function register(req, res, next) {
  // #swagger.tags = ['Auth']
  // #swagger.description = 'Register a new user'
  let { Name, Email, Password, Phone, Country_code, Login_type, Role, DeviceToken } = req.body;

  try {
    const existingUser = await findExistingUser(Login_type, Email, Phone);
    if (existingUser) {
      if (Login_type === commonFunctions.LoginTypeEnum.SOCIAL) {
        const tempAccessToken = jwt.sign(sanitizeUser(existingUser), JWT_SECRET, { expiresIn: '1d' });
        AccessToken = tempAccessToken;
        existingUser.AccessToken = tempAccessToken;
        // In social media case, we need to store DeviceToken
        if (DeviceToken) {
          existingUser.DeviceToken = DeviceToken;
        }
        await existingUser.save();

        const sanitizedUser = sanitizeUser(existingUser);
        return res.status(200).json({ message: messages.success.USER_REGISTERED, AccessToken, User: sanitizedUser });
      }

      return res.status(409).json({ message: messages.error.USER_ALREADY_REGISTERED });
    }

    // Check if the provided role exists
    const role = await UserRoleModel.findOne({
      where: { Name: Role },
    });

    if (!role) {
      return res.status(400).json({ message: messages.error.INVALID_USER_ROLE });
    }

    // Hash password
    var hashedPassword = "";
    if (Login_type === commonFunctions.LoginTypeEnum.EMAIL) {
      hashedPassword = await bcrypt.hash(Password, 10);
    }

    // Generate OTP
    let otp = null;
    let expirationTime = null;
    if (Login_type === commonFunctions.LoginTypeEnum.EMAIL || Login_type === commonFunctions.LoginTypeEnum.PHONE) {
      otp = commonFunctions.randomFourDigitCode();
      expirationTime = new Date(Date.now() + commonFunctions.constants.OTP_EXPIRATION_SECONDS * 1000);
    }

    // Create new user
    const newUser = {
      Name,
      Email,
      Password: hashedPassword,
      Phone,
      Country_code,
      Login_type,
      Otp: otp,
      Is_otp_verified: false,
      Otp_expiration_time: expirationTime,
      UserRoleID: role.ID
    };

    const user = await UserModel.create(newUser);

    // In social media case, we need to store DeviceToken
    if (DeviceToken) {
      user.DeviceToken = DeviceToken;
    }

    var AccessToken = "";
    if (Login_type === commonFunctions.LoginTypeEnum.EMAIL) {
      await sendEmailOTP(Email, otp);
    } else if (Login_type === commonFunctions.LoginTypeEnum.PHONE) {
      // var tempPhone = Country_code + Phone;
      await sendSMS(Phone, `${otp}`);
    } else if (Login_type === commonFunctions.LoginTypeEnum.SOCIAL) {
      // user.Is_verified = true;
      await sendEmailOTP(Email, otp);
    }

    const tempAccessToken = jwt.sign(sanitizeUser(user), JWT_SECRET, { expiresIn: '1d' });
    AccessToken = tempAccessToken;
    user.AccessToken = tempAccessToken;
    await user.save();

    const sanitizedUser = sanitizeUser(user);

    return res.status(200).json({ message: messages.success.USER_REGISTERED, AccessToken, User: sanitizedUser });
  } catch (error) {
    console.log(error);
    return next(error);
  }
}

async function findExistingUser(loginType, email, phone) {
  if (loginType === commonFunctions.LoginTypeEnum.EMAIL) {
    return await UserModel.findOne({ where: { Email: email, Is_deleted: false } });
  } else if (loginType === commonFunctions.LoginTypeEnum.PHONE) {
    return await UserModel.findOne({ where: { Phone: phone, Is_deleted: false } });
  } else if (loginType === commonFunctions.LoginTypeEnum.SOCIAL) {
    return await UserModel.findOne({ where: { Email: email, Is_deleted: false } });
  }
  return null;
}

function sanitizeUser(user) {
  const sanitizedUser = { ...user.dataValues };
  delete sanitizedUser.Password;
  delete sanitizedUser.Otp;
  delete sanitizedUser.AccessToken;
  delete sanitizedUser.DeviceToken;
  // delete sanitizedUser.UserRoleID;
  delete sanitizedUser.Created_at;
  delete sanitizedUser.Created_by;
  delete sanitizedUser.Updated_at;
  delete sanitizedUser.Updated_by;
  return sanitizedUser;
}

// Login user with Password
async function loginWithPassword(req, res, next) {
  // #swagger.tags = ['Auth']
  // #swagger.description = 'Login user using password'
  let { Login_type, Email, Phone, Password, DeviceToken } = req.body;
  try {

    // Check if email/phone is already registered

    const existingUser = await findExistingUser(Login_type, Email, Phone);
    if (!existingUser) {
      return res.status(409).json({ message: messages.error.USER_NOT_FOUND });
    } else if (!existingUser.Is_verified && (Login_type === commonFunctions.LoginTypeEnum.EMAIL)) {
      return res.status(402).json({ message: messages.error.USER_NOT_VERIFIED });
    }

    // Compare password hashes
    if (Login_type === commonFunctions.LoginTypeEnum.EMAIL) {
      const isPasswordMatch = await bcrypt.compare(Password, existingUser.Password);
      if (!isPasswordMatch) {
        return res.status(401).json({ message: messages.error.INVALID_CREDENTIALS });
      }
    }
    // Generate access token
    const accessToken = jwt.sign(sanitizeUser(existingUser), JWT_SECRET, { expiresIn: '1d' });

    existingUser.AccessToken = accessToken;
    // If login from web then again login from app at that time have to store DeviceToken
    if (DeviceToken) {
      existingUser.DeviceToken = DeviceToken;
    }
    await existingUser.save();

    const sanitizedUser = sanitizeUser(existingUser);

    return res.status(200).json({ message: messages.success.LOGIN_SUCCESS, AccessToken: accessToken, User: sanitizedUser });

  } catch (error) {
    return next(error);
  }
}

async function requestLoginOTP(req, res, next) {
  // #swagger.tags = ['Auth']
  // #swagger.description = 'Request OTP for login'
  try {
    const { Login_type, Phone } = req.body;

    let user;
    if (Login_type === commonFunctions.LoginTypeEnum.PHONE) {
      if (!Phone || Phone === '') {
        return res.status(400).json({ message: messages.error.PHONE_REQUIRED });
      }
      user = await UserModel.findOne({ where: { Phone: Phone, Is_deleted: false } });
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

    return res.status(200).json({ message: messages.success.OTP_SENT, ID: user.ID });
  } catch (error) {
    return next(error);
  }
}

async function loginWithOTP(req, res, next) {
  // #swagger.tags = ['Auth']
  // #swagger.description = 'Login user using OTP'
  try {
    const { Login_type, Phone, OTP, DeviceToken } = req.body;

    let user;
    if (Login_type === commonFunctions.LoginTypeEnum.PHONE) {
      user = await UserModel.findOne({ where: { Phone: Phone, Is_deleted: false } });
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

async function VerifyToken(req, res, next) {
  // #swagger.tags = ['Auth']
  // #swagger.description = 'Verify Token'
  try {
    const { api_token } = req.body;
    console.log(api_token);
    jwt.verify(api_token, JWT_SECRET, (err, decoded) => {
      if (err) {
        // Token is invalid or has expired
        console.error('Token verification failed:', err);
        return res.status(200).json({ message: messages.error.TOKEN_VERIFICATION_FAILED });
      } else {
        console.log('Token verified successfully');
        console.log('Token payload:', decoded);
        delete decoded.iat;
        delete decoded.exp;
        return res.status(200).json({ ...decoded });
      }
    });
  } catch (error) {
    return next(error);
  }
}

// Logout user
async function logout(req, res, next) {
  // #swagger.tags = ['Auth']
  // #swagger.description = 'Logout the user'
  try {
    // Remove user's access token from database
    const user = await UserModel.findOne({ where: { ID: req.user.ID, Is_deleted: false } });
    user.AccessToken = "";
    user.DeviceToken = "";
    await user.save();

    return res.status(200).json({ message: messages.success.LOGGED_OUT });
  } catch (error) {
    return next(error);
  }
}

// Resend OTP
async function resendOTP(req, res, next) {
  // #swagger.tags = ['Auth']
  // #swagger.description = 'Resend OTP for user verification'
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
  const user = await UserModel.findOne({ where: { Phone: Phone, Is_deleted: false } });

  if (!user) {
    return res.status(400).json({ message: messages.error.USER_NOT_FOUND });
  }

  user.Otp = code;
  //user.Is_verified = false;
  user.Is_otp_verified = false;
  user.Otp_expiration_time = expirationTime;
  await user.save();

  await sendSMS(Phone, `${code}`);

  return res.status(200).json({ message: messages.success.OTP_SENT, ID: user.ID });
}

async function resendEmailOTP(req, res) {
  const { Email } = req.body;
  const code = commonFunctions.randomFourDigitCode();
  const expirationTime = new Date(Date.now() + commonFunctions.constants.OTP_EXPIRATION_SECONDS * 1000);
  const user = await UserModel.findOne({ where: { Email: Email, Is_deleted: false } });

  if (!user) {
    return res.status(400).json({ message: messages.error.USER_NOT_FOUND });
  }

  user.Otp = code;
  user.Is_otp_verified = false;
  user.Otp_expiration_time = expirationTime;
  await user.save();

  await sendEmailOTP(Email, code);

  return res.status(200).json({ message: messages.success.OTP_SENT, ID: user.ID });
}

// Verify sent OTP using User ID
async function verifyOTP(req, res, next) {
  // #swagger.tags = ['Auth']
  // #swagger.description = 'Verify OTP using User ID'
  const { ID, Otp, DeviceToken } = req.body;

  try {
    // Check if user exists
    const user = await UserModel.findByPk(ID);
    if (!user) {
      return res.status(404).json({ message: messages.error.USER_NOT_FOUND });
    }

    // Check if OTP is valid
    if (user.Otp !== Otp) {
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

    return res.status(200).json({ message: messages.success.OTP_VERIFIED, AccessToken: accessToken, User: sanitizedUser });
  } catch (error) {
    return next(error);
  }
}

// Verify forget password OTP
async function verifyForgotPasswordOTP(req, res, next) {
  // #swagger.tags = ['Auth']
  // #swagger.description = 'Verify OTP for password reset'
  try {
    const { Login_type, Phone, Email, Otp } = req.body;
    let user;
    if (Login_type == commonFunctions.LoginTypeEnum.PHONE) {

      user = await UserModel.findOne({ where: { Phone: Phone, Is_deleted: false } });
      if (!user) {
        return res.status(400).json({ message: messages.error.USER_NOT_FOUND });
      }

    } else if (Login_type == commonFunctions.LoginTypeEnum.EMAIL) {

      user = await UserModel.findOne({ where: { Email: Email, Is_deleted: false } });
      if (!user) {
        return res.status(400).json({ message: messages.error.USER_NOT_FOUND });
      }
    }

    // Check if OTP is valid
    if (user.Otp !== Otp) {
      return res.status(400).json({ message: messages.error.OTP_MISMATCH });
    }

    // Generate access token
    const accessToken = jwt.sign(sanitizeUser(user), JWT_SECRET, { expiresIn: '1d' });
    user.AccessToken = accessToken;
    // Update user record with consent given
    user.Is_verified = true;
    await user.save();

    return res.status(200).json({ message: messages.success.FORGOT_PASSWORD_OTP_VERIFIED, AccessToken: accessToken });
  } catch (error) {
    return next(error);
  }
}

// Forgot Password
async function forgotPassword(req, res, next) {
  // #swagger.tags = ['Auth']
  // #swagger.description = 'Forgot Password functionality'
  try {

    const { NewPassword } = req.body;
    var hashedPassword = await bcrypt.hash(NewPassword, 10);
    // Remove user's access token from database
    const user = await UserModel.findOne({ where: { ID: req.user.ID, Is_deleted: false } });
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
  // #swagger.tags = ['Auth']
  // #swagger.description = 'Change Password functionality'
  try {
    const { OldPassword, NewPassword } = req.body;

    // Remove user's access token from database
    const user = await UserModel.findOne({ where: { ID: req.user.ID, Is_deleted: false } });
    if (!user) {
      return res.status(400).json({ message: messages.error.USER_NOT_FOUND });
    }

    var isMatch = await bcrypt.compare(OldPassword, user.Password);
    if (!isMatch) {
      return res.status(400).json({ message: messages.error.INVALID_OLD_PASSWORD });
    }

    var hashedPassword = await bcrypt.hash(NewPassword, 10);
    user.Password = hashedPassword;
    user.AccessToken = "";
    await user.save();

    return res.status(200).json({ message: messages.success.PASSWORD_CHANGED });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  loginWithPassword,
  logout,
  resendOTP,
  verifyOTP,
  verifyForgotPasswordOTP,
  forgotPassword,
  changePassword,
  requestLoginOTP,
  loginWithOTP,
  VerifyToken
};
