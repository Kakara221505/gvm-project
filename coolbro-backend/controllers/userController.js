const commonFunctions = require('../utils/commonFunctions');

const UserModel = require('../models/user');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const messages = require('../utils/messages');

// Get all users
async function getUsers(req, res, next) {
  // #swagger.tags = ['Users']
  // #swagger.description = 'To get all user details'
  try {
    const { page = 1, limit, search = '', userRole } = req.query;
    const offset = (page - 1) * (limit ? parseInt(limit, 10) : 0);
    const whereClause = {};
    whereClause.Is_deleted = false;
    if (search) {
      whereClause.Email = { [Op.like]: `%${search}%` };
    }
    if (userRole) {
      whereClause.UserRoleID = userRole;
    }

    const options = {
      attributes: { exclude: ['Password', 'Otp', 'AccessToken', 'Created_at', 'Created_by', 'Updated_at', 'Updated_by'] },
      where: whereClause,
      offset: offset,
      order: [['ID', 'DESC']], 
      limit: limit ? parseInt(limit, 10) : null,
    };

    const { count, rows: users } = await UserModel.findAndCountAll(options);

    const totalPages = limit ? Math.ceil(count / parseInt(limit, 10)) : 1;
    const currentPage = parseInt(page, 10);

    return res.status(200).json({ users, totalPages, currentPage, totalRecords: count });
  } catch (error) {
    return next(error);
  }
}

// Get user by ID
async function getUserById(req, res, next) {
  // #swagger.tags = ['Users']
  // #swagger.description = 'To get user details by ID' 
  try {
    const loginUser = req.user;

    const requestUser = UserModel.findOne({
      where: { ID: req.params.id, Is_deleted: false }
    }, {
      attributes: { exclude: ['Password', 'Otp', 'AccessToken', 'Created_at', 'Created_by', 'Updated_at', 'Updated_by'] },
    });


    if (!requestUser) {
      return res.status(404).json({ message: messages.error.USER_NOT_FOUND });
    }
    else if (requestUser.ID !== loginUser.ID) {
      if (loginUser.role === 'admin') {
        return res.status(200).json({ user: requestUser });
      }
      return res.status(401).json({ message: messages.error.UNAUTHORIZED });
    }
    const sanitizedUser = sanitizeUser(requestUser);

    return res.status(200).json({ user: sanitizedUser });
  } catch (error) {
    return next(error);
  }
}

// Create new user
async function createUser(req, res, next) {
  // #swagger.tags = ['Users']
  // #swagger.description = 'To create a new user'
  const { Name, Email, Password, Phone, Country_code, Login_type, UserRoleID } = req.body;
  try {
    const loginUser = req.user;

    let existingUser;
    if (Login_type === commonFunctions.LoginTypeEnum.EMAIL) {
      existingUser = UserModel.findOne({ where: { Email: Email, Is_deleted: false } });
    } else if (Login_type === commonFunctions.LoginTypeEnum.PHONE) {
      existingUser = UserModel.findOne({ where: { Phone: Phone, Is_deleted: false } });
    }

    if (existingUser) {
      return res.status(409).json({ message: messages.error.USER_ALREADY_REGISTERED });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(Password, 10);

    // Create new user
    const user = await UserModel.create({
      Name,
      Email,
      Password: hashedPassword,
      Phone,
      Country_code,
      Login_type,
      Is_verified: true,
      UserRoleID,
      Created_by: loginUser.ID
    });

    const sanitizedUser = sanitizeUser(user);

    return res.status(201).json({ message: messages.success.USER_CREATED, user: sanitizedUser });
  } catch (error) {
    return next(error);
  }
}

// Update user by ID
async function updateUser(req, res, next) {
  // #swagger.tags = ['Users']
  // #swagger.description = 'To update user details by ID'
  const updateFields = Object.keys(req.body);
  try {
    const { Email, Phone } = req.body;

    const loginUser = req.user;

    const requestUser = UserModel.findOne({
      where: { ID: req.params.id, Is_deleted: false }
    });

    if (!requestUser) {
      return res.status(404).json({ message: messages.error.USER_NOT_FOUND });
    }

    // Check if email or phone already exists
    if (Email) {
      const existingUserByEmail = await UserModel.findOne({ where: { Email: Email, Is_deleted: false } });
      if (existingUserByEmail && existingUserByEmail.ID !== requestUser.ID) {
        return res.status(409).json({ message: messages.error.EMAIL_EXISTS });
      }
    }

    if (Phone) {
      const existingUserByPhone = await UserModel.findOne({ where: { Phone: Phone, Is_deleted: falseF } });
      if (existingUserByPhone && existingUserByPhone.ID !== requestUser.ID) {
        return res.status(409).json({ message: messages.error.PHONE_EXISTS });
      }
    }

    // Update user fields based on request body
    updateFields.forEach(field => {
      if (field !== 'Password' && field !== 'AccessToken' && field !== 'Otp' && field !== 'Login_type' && field !== 'Created_at' && field !== 'Updated_at' && field !== 'UserRoleID') {
        requestUser[field] = req.body[field];
      }
    });

    requestUser.Updated_by = loginUser.ID;
    await requestUser.save();

    const sanitizedUser = sanitizeUser(requestUser);

    return res.status(200).json({ message: messages.success.USER_UPDATED, user: sanitizedUser });
  } catch (error) {
    return next(error);
  }
}


// Delete user by ID
async function deleteUser(req, res, next) {
  // #swagger.tags = ['Users']
  // #swagger.description = 'To delete user by ID'
  try {
    const UserID = req.params.id;
    const loginUser = req.user;

    // Check if the user exists

    const user = await UserModel.findOne({ where: { ID: UserID, Is_deleted: false } });
    if (!user) {
      return res.status(404).json({ message: messages.error.USER_NOT_FOUND });
    }

    // await UserDetails.destroy({ where: { UserID } });
    // await UserMediaModel.destroy({ where: { UserID } });
    // await AddressDetails.destroy({ where: { UserID } });
    // await UserAirConditionService.destroy({ where: { UserID } });
    // await user.destroy();

    user.Updated_by = loginUser.ID;
    user.Is_deleted = true;
    await user.save();

    return res.status(200).json({ message: messages.success.USER_DELETED });
  } catch (error) {
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
  delete sanitizedUser.Created_by;
  delete sanitizedUser.Updated_at;
  delete sanitizedUser.Updated_by;
  return sanitizedUser;
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
