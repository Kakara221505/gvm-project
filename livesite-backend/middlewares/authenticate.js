const commonFunctions = require('../utils/commonFunctions');
const User = require('../models/user');
const messages = require('../utils/messages');
const OrganizationModel = require('../models/organization');
const OrganizationUserRelationModel = require('../models/OrganizationUserRelation')

async function authenticate(req, res, next) {
  try {
    const token = req.headers.authorization.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: messages.error.AUTH_TOKEN_NOT_FOUND });
    }

    const user = await User.findOne({ where: { AccessToken: token,Is_deleted: false } });
    if (!user) {
      return res.status(401).json({ message: messages.error.AUTH_FAILED });
    }
    let role;
    let organizationID;
    let userRole;
    if (user.User_type.toString() === commonFunctions.UserRole.ADMIN) {
      role = 'admin';
      req.user = { ...user.dataValues, role };
      console.log("User role:", role); // Log the role here
    } else if (user.User_type.toString() === commonFunctions.UserRole.USER) {
    
      role = 'user';
      const orgUserRelation = await OrganizationUserRelationModel.findOne({ where: { UserID: user.ID, Is_deleted: false } });
      if (orgUserRelation) {
        userRole = orgUserRelation.Role; // Role will be from OrganizationUserRelation table
      }

      req.user = { ...user.dataValues, role,  Role: userRole };
      console.log("User role:", role); // Log the role here
    } else if (user.User_type.toString() === commonFunctions.UserRole.ORGANIZATION) {
      role = 'organization';
     
      const organization = await OrganizationModel.findOne({ where: { UserID: user.ID } });
   
      if (organization) {
        organizationID = organization.ID;
      }
     // Fetch the Role from OrganizationUserRelation table for organization users
      const orgUserRelation = await OrganizationUserRelationModel.findOne({ where: { UserID: user.ID, Is_deleted: false } });
      if (orgUserRelation) {
        userRole = orgUserRelation.Role; // Role will be from OrganizationUserRelation table
      }

      req.user = { ...user.dataValues, role, OrganizationID: organizationID, Role: userRole };
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: messages.error.AUTH_FAILED });
  }
}



module.exports = authenticate;
