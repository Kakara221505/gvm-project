const commonFunctions = require('../utils/commonFunctions');
const UserModel = require('../models/user');
const UserRoleModel = require('../models/userRole');
const messages = require('../utils/messages');

async function authenticate(req, res, next) {
  try {
    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: messages.error.AUTH_TOKEN_NOT_FOUND });
    }

    const user = await UserModel.findOne({ where: { AccessToken: token, Is_deleted: false } });
    if (!user) {
      return res.status(401).json({ message: messages.error.AUTH_FAILED });
    }


    const userRole = await UserRoleModel.findOne({
      where: { ID: user.UserRoleID },
    });

    let role;
    if (userRole) {
      role = userRole.Name.toLowerCase();
    }

    req.user = { ...user.dataValues, role };

    next();
  } catch (error) {
    return res.status(401).json({ message: messages.error.AUTH_FAILED });
  }
}

module.exports = authenticate;
