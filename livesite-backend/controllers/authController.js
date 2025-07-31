const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const UserModel = require("../models/user");
const OrganizationModel = require("../models/organization");
const OrganizationUserRelationModel = require("../models/OrganizationUserRelation");
const JWT_SECRET = process.env.JWT_SECRET;
const commonFunctions = require("../utils/commonFunctions");
const { sendEmailOTP } = require("../utils/emailUtility");
const { sendSMS } = require("../utils/smsUtility");
const messages = require("../utils/messages");

// Register new user
// async function register(req, res, next) {
//   // #swagger.tags = ['Auth']
//   // #swagger.description = 'Register a new user'
//   let {
//     First_name,
//     Last_name,
//     Email,
//     Gender,
//     Date_of_birth,
//     Key_name,
//     Organization_name,
//     Website,
//     Contact_person_name,
//     Address,
//     City,
//     State,
//     Postal_code,
//     Country,
//     ProfileMedia,
//     Password,
//     Phone,
//     User_type,
//   } = req.body;

//   try {
//     Email = Email.toLowerCase();
//     let file = "";
//     if (req.file) {
//       file = `${process.env.PROFILE_IMAGE_ROUTE}${req.file.filename}`;
//     }
//     const existingUser = await UserModel.findOne({
//       where: { Email: Email, Is_deleted: false },
//     });
//     if (existingUser) {
//       return res
//         .status(409)
//         .json({ message: messages.error.USER_ALREADY_REGISTERED });
//     }
//     // const existingKey = await OrganizationModel.findOne({
//     //   where: { Key_name: Key_name },
//     // });
//     // if (existingKey) {
//     //   return res.status(409).json({ message: messages.error.ORGANIZATION_KEY_ALREADY_REGISTERED });
//     // }

//     // Check if the provided role exists
//     if (
//       !["ADMIN", "USER", "ORGANIZATION"].includes(User_type) &&
//       User_type !== undefined
//     ) {
//       return res
//         .status(400)
//         .json({ message: messages.error.INVALID_ORGNIZATION_ROLE });
//     }

//     // Hash password
//     hashedPassword = await bcrypt.hash(Password, 10);
//     // Generate OTP
//     let otp = null;
//     let expirationTime = null;
//     if (Email) {
//       otp = commonFunctions.randomFourDigitCode();
//       expirationTime = new Date(
//         Date.now() + commonFunctions.constants.OTP_EXPIRATION_SECONDS * 1000
//       );
//     }
//     const userTypeDBValue = commonFunctions.UserRole[User_type];

//     // Create new user
//     const newUser = {
//       First_name,
//       Last_name,
//       Email,
//       Password: hashedPassword,
//       Phone,
//       Gender,
//       Date_of_birth,
//       Otp: otp,
//       Is_otp_verified: false,
//       Otp_expiration_time: expirationTime,
//       User_type: userTypeDBValue,
//     };

//     const user = await UserModel.create(newUser);

//     var AccessToken = "";
//     if (Email) {
//       await sendEmailOTP(Email, otp);
//     }
//     const tempAccessToken = jwt.sign({ id: user.id }, JWT_SECRET, {
//       expiresIn: "1d",
//     });
//     AccessToken = tempAccessToken;
//     user.AccessToken = tempAccessToken;
//     await user.save();

//     // Create organization
//     const newOrganization = {
//       UserID: user.ID,
//       Key_name, // Assuming Key_name is provided in the request
//       Organization_name,
//       Profile_image_url: file,
//       Website,
//       Contact_person_name,
//       Address,
//       City,
//       State,
//       Postal_code,
//       Country,
//     };

//     const organization = await OrganizationModel.create(newOrganization);

//     const sanitizedUser = sanitizeUser(user);

//     return res
//       .status(200)
//       .json({
//         message: messages.success.USER_REGISTERED,
//         AccessToken,
//         User: sanitizedUser,
//       });
//   } catch (error) {
//     console.log(error);
//     return next(error);
//   }
// }

async function register(req, res, next) {
  // #swagger.tags = ['Auth']
  // #swagger.description = 'Register a new user'
  let {
    First_name,
    Last_name,
    Email,
    Gender,
    Date_of_birth,
    Key_name,
    Organization_name,
    Website,
    Contact_person_name,
    Address,
    City,
    State,
    Postal_code,
    Country,
    ProfileMedia,
    Password,
    Phone,
    User_type,
  } = req.body;

  try {
    Email = Email.toLowerCase();
    let file = "";
    if (req.file) {
      file = `${process.env.PROFILE_IMAGE_ROUTE}${req.file.filename}`;
    }

    const existingUser = await UserModel.findOne({
      where: { Email: Email, Is_deleted: false },
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: messages.error.USER_ALREADY_REGISTERED });
    }

    if (
      !["ADMIN", "USER", "ORGANIZATION"].includes(User_type) &&
      User_type !== undefined
    ) {
      return res
        .status(400)
        .json({ message: messages.error.INVALID_ORGNIZATION_ROLE });
    }

    const hashedPassword = await bcrypt.hash(Password, 10);

    let otp = null;
    let expirationTime = null;
    if (Email) {
      otp = commonFunctions.randomFourDigitCode();
      expirationTime = new Date(
        Date.now() + commonFunctions.constants.OTP_EXPIRATION_SECONDS * 1000
      );
    }

    const userTypeDBValue = commonFunctions.UserRole[User_type];

    const newUser = {
      First_name,
      Last_name,
      Email,
      Password: hashedPassword,
      Phone,
      Gender,
      Date_of_birth,
      Otp: otp,
      Is_otp_verified: false,
      Otp_expiration_time: expirationTime,
      User_type: userTypeDBValue,
    };

    const user = await UserModel.create(newUser);

    let AccessToken = "";
    if (Email) {
      await sendEmailOTP(Email, otp);
    }

    const tempAccessToken = jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: "1d",
    });

    AccessToken = tempAccessToken;
    user.AccessToken = tempAccessToken;
    await user.save();

    const newOrganization = {
      UserID: user.ID,
      Key_name,
      Organization_name,
      Profile_image_url: file,
      Website,
      Contact_person_name,
      Address,
      City,
      State,
      Postal_code,
      Country,
    };

    const organization = await OrganizationModel.create(newOrganization);

    // Add entry in OrganizationUserRelation table
    const organizationUserRelation = {
      OrganizationID: organization.ID,
      UserID: user.ID,
      Role: '3', // Assigning Role as '3' per the requirement
      Is_deleted: false,
      Is_approved: false,
    };

    await OrganizationUserRelationModel.create(organizationUserRelation);

    const sanitizedUser = sanitizeUser(user);

    return res.status(200).json({
      message: messages.success.USER_REGISTERED,
      AccessToken,
      User: sanitizedUser,
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
}

function sanitizeUser(user) {
  const sanitizedUser = { ...user.dataValues };
  delete sanitizedUser.Password;
  delete sanitizedUser.Otp;
  delete sanitizedUser.AccessToken;
  // delete sanitizedUser.UserRoleID;
  delete sanitizedUser.Created_at;
  delete sanitizedUser.Updated_at;
  delete sanitizedUser.OrganizationUserRelation;
  return sanitizedUser;
}

// Login user with Password
// async function loginWithPassword(req, res, next) {
//   // #swagger.tags = ['Auth']
//   // #swagger.description = 'Login user using password'
//   let {Email, Password } = req.body;
//   try {

//     // Check if email/phone is already registered
//     let user;
//     if (Email) {
//       user = await UserModel.findOne({ where: { Email } });
//     }

//     if (!user) {
//       return res.status(401).json({ message: messages.error.USER_NOT_FOUND });
//     } else if (!user.Is_verified && Email) {
//       return res.status(402).json({ message: messages.error.USER_NOT_VERIFIED });
//     }

//     // Compare password hashes
//     if (Email) {
//       const isPasswordMatch = await bcrypt.compare(Password, user.Password);
//       if (!isPasswordMatch) {
//         return res.status(401).json({ message: messages.error.INVALID_CREDENTIALS });
//       }
//     }
//     // Generate access token
//     const accessToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' });

//     user.AccessToken = accessToken;
//     await user.save();

//     const sanitizedUser = sanitizeUser(user);

//     return res.status(200).json({ message: messages.success.LOGIN_SUCCESS, AccessToken: accessToken, User: sanitizedUser });

//   } catch (error) {
//     return next(error);
//   }
// }

async function loginWithPassword(req, res, next) {
  // #swagger.tags = ['Auth']
  // #swagger.description = 'Login user using password'
  const { Email, Password } = req.body;
  try {
    let user;
    if (Email) {
      user = await UserModel.findOne({
        where: { Email },
        include: {
          model: OrganizationUserRelationModel,
          as: 'OrganizationUserRelation',
          attributes: ['Role', 'OrganizationID'],
        },
      });
    }

    if (!user) {
      return res.status(401).json({ message: messages.error.USER_NOT_FOUND });
    } else if (!user.Is_verified) {
      return res.status(402).json({ message: messages.error.USER_NOT_VERIFIED });
    }

    const isPasswordMatch = await bcrypt.compare(Password, user.Password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: messages.error.INVALID_CREDENTIALS });
    }

    // Determine the OrganizationID
    let organizationID = null;

    if (user.User_type === 2) {
      // For organizations (UserType = 2), use the User ID as OrganizationID
      organizationID = user.ID;
    } 
    
    else if (user.User_type === 1) {
      // For users (UserType = 1), get OrganizationID from OrganizationUserRelation
      if (user.OrganizationUserRelation) {
        const relation = await OrganizationUserRelationModel.findOne({
          where: {
              UserID: user.ID,
              Is_deleted: false,
          },
          attributes: ['OrganizationID'],
      });
    
      if (relation) {
          // Match the OrganizationID in Organization table to get the corresponding UserID
          const organization = await OrganizationModel.findByPk(relation.OrganizationID, {
              attributes: ['UserID'],
          });
  
          if (organization) {
              organizationID = organization.UserID;
          }
      }
      }
    }

    const accessToken = jwt.sign({ id: user.ID }, JWT_SECRET, {
      expiresIn: '1d',
    });

    user.AccessToken = accessToken;
    await user.save();

    const sanitizedUser = sanitizeUser(user);
    const userWithRole = {
      ...sanitizedUser,
      OrganizationID: organizationID,
      Role: user.OrganizationUserRelation ? user.OrganizationUserRelation.Role : null,
    };

    const io = req.app.get("io"); // Access Socket.IO instance
    io.to(user.ID).emit("forceLogout",{userID:user.ID});
    return res.status(200).json({
      message: messages.success.LOGIN_SUCCESS,
      AccessToken: accessToken,
      User: userWithRole,
    });
  } catch (error) {
    return next(error);
  }
}


// async function loginWithPassword(req, res, next) {
//   // #swagger.tags = ['Auth']
//   // #swagger.description = 'Login user using password'
//   const { Email, Password, UserType } = req.body; // UserType should be passed in the request body
//   try {
//     let user;
//     if (Email && UserType) {
//       user = await UserModel.findOne({
//         where: { Email, User_type: UserType }, // Ensure User_type is matched
//         include: {
//           model: OrganizationUserRelationModel,
//           as: 'OrganizationUserRelation',
//           attributes: ['Role', 'OrganizationID'],
//         },
//       });
//     }
// console.log(user)
//     if (!user) {
//       return res.status(401).json({ message: messages.error.USER_NOT_FOUND });
//     } else if (!user.Is_verified) {
//       return res.status(402).json({ message: messages.error.USER_NOT_VERIFIED });
//     }

//     const isPasswordMatch = await bcrypt.compare(Password, user.Password);
//     if (!isPasswordMatch) {
//       return res.status(401).json({ message: messages.error.INVALID_CREDENTIALS });
//     }

//     const accessToken = jwt.sign({ id: user.ID }, JWT_SECRET, {
//       expiresIn: '1d',
//     });

//     user.AccessToken = accessToken;
//     await user.save();

//     const sanitizedUser = sanitizeUser(user);
//     const userWithRole = {
//       ...sanitizedUser,
//       Role: user.OrganizationUserRelation ? user.OrganizationUserRelation.Role : null,
//     };

//     return res.status(200).json({
//       message: messages.success.LOGIN_SUCCESS,
//       AccessToken: accessToken,
//       User: userWithRole,
//     });
//   } catch (error) {
//     return next(error);
//   }
// }



// Logout user
async function logout(req, res, next) {
  // #swagger.tags = ['Auth']
  // #swagger.description = 'Logout the user'
  try {
    // Remove user's access token from database
    const user = await UserModel.findOne({
      where: { ID: req.user.ID, Is_deleted: false },
    });
    user.AccessToken = "";
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
    const { Email } = req.body;

    if (Email) {
      return await resendEmailOTP(req, res);
    } else {
      return res
        .status(400)
        .json({ message: messages.error.INVALID_REQUEST_TYPE });
    }
  } catch (error) {
    return next(error);
  }
}

async function resendEmailOTP(req, res) {
  const { Email } = req.body;
  const code = commonFunctions.randomFourDigitCode();
  const expirationTime = new Date(
    Date.now() + commonFunctions.constants.OTP_EXPIRATION_SECONDS * 1000
  );
  const user = await UserModel.findOne({
    where: { Email: Email, Is_deleted: false },
  });

  if (!user) {
    return res.status(400).json({ message: messages.error.USER_NOT_FOUND });
  }

  user.Otp = code;
  user.Is_otp_verified = false;
  user.Otp_expiration_time = expirationTime;
  await user.save();

  await sendEmailOTP(Email, code);

  return res
    .status(200)
    .json({ message: messages.success.OTP_SENT, ID: user.ID });
}

// Verify sent OTP using User ID
async function verifyOTP(req, res, next) {
  // #swagger.tags = ['Auth']
  // #swagger.description = 'Verify OTP using User ID'
  const { ID, Otp } = req.body;

  try {
    // Check if user exists
    const user = await UserModel.findByPk(ID);
    if (!user) {
      return res.status(404).json({ message: messages.error.USER_NOT_FOUND });
    }
    // Check if OTP is valid
    // Check if OTP is valid
    if (user.Otp.toString() !== Otp.toString()) {
      return res.status(400).json({ message: messages.error.OTP_MISMATCH });
    }

    if (new Date() > user.Otp_expiration_time) {
      return res.status(400).json({ message: messages.error.OTP_EXPIRED });
    }

    // Generate access token
    const accessToken = jwt.sign(sanitizeUser(user), JWT_SECRET, {
      expiresIn: "1d",
    });

    user.Otp = null;
    user.Is_otp_verified = true;
    user.Is_verified = true;
    user.Otp_expiration_time = null;
    user.AccessToken = accessToken;
    await user.save();

    const sanitizedUser = sanitizeUser(user);

    return res
      .status(200)
      .json({
        message: messages.success.OTP_VERIFIED,
        AccessToken: accessToken,
        User: sanitizedUser,
      });
  } catch (error) {
    return next(error);
  }
}

// Verify forget password OTP
async function verifyForgotPasswordOTP(req, res, next) {
  // #swagger.tags = ['Auth']
  // #swagger.description = 'Verify OTP for password reset'
  try {
    const { Email, Otp } = req.body;
    let user;
    if (Email) {
      user = await UserModel.findOne({
        where: { Email: Email, Is_deleted: false },
      });
      if (!user) {
        return res.status(400).json({ message: messages.error.USER_NOT_FOUND });
      }
    }

    // Check if OTP is valid
    if (user.Otp !== Otp) {
      return res.status(400).json({ message: messages.error.OTP_MISMATCH });
    }

    // Generate access token
    const accessToken = jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: "1d",
    });
    user.AccessToken = accessToken;
    // Update user record with consent given
    user.Is_verified = true;
    await user.save();

    return res
      .status(200)
      .json({
        message: messages.success.FORGOT_PASSWORD_OTP_VERIFIED,
        AccessToken: accessToken,
      });
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
    const user = await UserModel.findOne({
      where: { ID: req.user.ID, Is_deleted: false },
    });
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
    const user = await UserModel.findOne({
      where: { ID: req.user.ID, Is_deleted: false },
    });
    if (!user) {
      return res.status(400).json({ message: messages.error.USER_NOT_FOUND });
    }

    var isMatch = await bcrypt.compare(OldPassword, user.Password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: messages.error.INVALID_OLD_PASSWORD });
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
};
