const commonFunctions = require("../utils/commonFunctions");

const User = require("../models/user");
const bcrypt = require("bcrypt");
const { Op, Sequelize } = require("sequelize");
const messages = require("../utils/messages");
const UserModel = require("../models/user");
const OrganizationModel = require("../models/organization");
const OrganizationUserRealtionModel = require("../models/OrganizationUserRelation");
const ProjectModel = require("../models/Project");

// Add USER

async function addUser(req, res, next) {
  // #swagger.tags = ['user']
  // #swagger.description = 'Add or update user details'
  let {
    First_name,
    Last_name,
    Email,
    Gender,
    Date_of_birth,
    Password,
    Phone,
    User_type,
    Role,
    Is_approved,
  } = req.body;
  try {
    Email = Email.toLowerCase();
    let loginUser = req.user;
    const existingUser = await UserModel.findOne({
      where: { Email: Email, Is_deleted: false },
    });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: messages.error.USER_ALREADY_REGISTERED });
    }

    // Check if a user with the same email already exists in the same organization
    // Find users with the same email in the current organization
    // const organizationUsers = await OrganizationUserRealtionModel.findAll({
    //   where: { OrganizationID: loginUser.OrganizationID, Is_deleted: false },
    // });
    // const userIds = organizationUsers.map(orgUser => orgUser.UserID);

    // const existingUser = await UserModel.findOne({
    //   where: {
    //     ID: userIds,
    //     Email: Email,
    //   }
    // });

    // if (existingUser) {
    //   return res.status(409).json({ message: messages.error.USER_ALREADY_REGISTERED });
    // }
    // Check if the provided role exists
    if (
      !["Basic_User", "Advance_User", "External_User","Admin"].includes(User_type) &&
      User_type !== undefined
    ) {
      return res
        .status(400)
        .json({ message: messages.error.INVALID_ORGNIZATION_ROLE });
    }

    // Hash password
    hashedPassword = await bcrypt.hash(Password, 10);
    // Generate OTP
    // let otp = null;
    // let expirationTime = null;
    // if (Email) {
    //   otp = commonFunctions.randomFourDigitCode();
    //   expirationTime = new Date(Date.now() + commonFunctions.constants.OTP_EXPIRATION_SECONDS * 1000);
    // }
    const userTypeDBValue = commonFunctions.UserRole[User_type];
    // Create new user
    const newUser = {
      First_name,
      Last_name,
      Email,
      Password: hashedPassword,
      Phone,
      Gender,
      Date_of_birth,
      // Otp: otp,
      Is_otp_verified: true,
      // Otp_expiration_time: expirationTime,
      User_type: 1,
      Is_verified: true,
    };

    const user = await UserModel.create(newUser);

    // var AccessToken = "";
    // if (Email) {
    // await sendEmailOTP(Email, otp);
    // }
    // const tempAccessToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' });
    // AccessToken = tempAccessToken;
    // user.AccessToken = tempAccessToken;
    await user.save();
    // Check if the provided role exists
    if (
      !["Basic_User", "Advance_User", "External_User","Admin"].includes(Role) &&
      Role !== undefined
    ) {
      return res
        .status(400)
        .json({ message: messages.error.INVALID_USER_ROLE });
    }
    const userRoleValue = commonFunctions.OrgnizationRole[Role];
    // Create organization
    const newOrganization = {
      UserID: user.ID,
      OrganizationID: loginUser.OrganizationID, // Assuming Key_name is provided in the request
      Role: userRoleValue,
      Is_approved,
    };

    const organization = await OrganizationUserRealtionModel.create(
      newOrganization
    );

    const sanitizedUser = sanitizeUser(user);

    return res
      .status(200)
      .json({ message: messages.success.USER_ADD, User: sanitizedUser });
  } catch (error) {
    return next(error);
  }
}

// Get all users

// async function getUsersListShare(req, res, next) {
//   try {
//     const { page = 1, limit = 10, search = "" } = req.query;
//     const offset = (page - 1) * (parseInt(limit, 10) || 0); // Calculate offset for pagination

//     // Fetch all users based on search criteria and pagination
//     const { count, rows } = await User.findAndCountAll({
//       attributes: {
//         exclude: [
//           "Password",
//           "Otp",
//           "AccessToken",
//           "Created_at",
//           "Otp_expiration_time",
//           "Updated_at",
//         ],
//       },
//       where: {
//         Is_deleted: false, // Only fetch non-deleted users
//         User_type: { [Op.in]: [0, 1] }, // Include only User_type 0 and 1
//         [Op.or]: [
//           { Email: { [Op.like]: `%${search}%` } },
//           { First_name: { [Op.like]: `%${search}%` } },
//           { Last_name: { [Op.like]: `%${search}%` } },
//         ],
//       },
//       offset,
//       limit: limit ? parseInt(limit, 10) : null,
//     });

//     // Fetch all OrganizationUserRelations to map Role and Is_approved
//     const orgUserRelations = await OrganizationUserRealtionModel.findAll({
//       where: {
//         UserID: rows.map((user) => user.ID), // Fetch roles and approvals for all fetched users
//       },
//     });

//     // Fetch all organizations based on OrganizationID
//     const organizations = await OrganizationModel.findAll({
//       where: {
//         ID: orgUserRelations.map((relation) => relation.OrganizationID), // Fetch organizations for these relations
//       },
//     });

//  // Map users with their respective Role, Is_approved, and Organization_name
//  const mappedUsers = rows.map((user) => {
//   const orgUserRelation = orgUserRelations.find(
//     (relation) => relation.UserID === user.ID
//   );
//   const organization = organizations.find(
//     (org) => org.ID === orgUserRelation?.OrganizationID
//   );
//   return {
//     ...user.toJSON(),
//     Role: orgUserRelation ? orgUserRelation.Role : null,
//     Is_approved: orgUserRelation ? orgUserRelation.Is_approved : null,
//     Organization_name: organization ? organization.Organization_name : null,
//   };
// });

// // Calculate total pages for pagination
// const totalPages = limit ? Math.ceil(count / parseInt(limit, 10)) : 1;
// const currentPage = parseInt(page, 10);

// // Send response with users data and pagination info
// return res.status(200).json({
//   users: mappedUsers,
//   totalPages,
//   currentPage,
//   totalRecords: count,
// });
// } catch (error) {
// return next(error);
// }
// }

async function getUsersListShare(req, res, next) {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const offset = (page - 1) * (parseInt(limit, 10) || 0); // Calculate offset for pagination

    const loggedInOrganizationID = req.user.OrganizationID;

    // Fetch all users based on search criteria and pagination
    const { count, rows } = await User.findAndCountAll({
      attributes: {
        exclude: [
          "Password",
          "Otp",
          "AccessToken",
          "Created_at",
          "Otp_expiration_time",
          "Updated_at",
        ],
      },
      where: {
        Is_deleted: false, // Only fetch non-deleted users
        User_type: { [Op.in]: [0, 1] }, // Include only User_type 0 and 1
        [Op.or]: [
          { Email: { [Op.like]: `%${search}%` } },
          { First_name: { [Op.like]: `%${search}%` } },
          { Last_name: { [Op.like]: `%${search}%` } },
        ],
      },
      offset,
      limit: limit ? parseInt(limit, 10) : null,
    });

    // Fetch all OrganizationUserRelations to map Role, Is_approved, and OrganizationID
    const orgUserRelations = await OrganizationUserRealtionModel.findAll({
      where: {
        UserID: rows.map((user) => user.ID), // Fetch roles and approvals for all fetched users
      },
    });

    // Fetch all organizations based on OrganizationID
    const organizations = await OrganizationModel.findAll({
      where: {
        ID: orgUserRelations.map((relation) => relation.OrganizationID), // Fetch organizations for these relations
      },
    });

    // Filter out users who belong to the same organization as the logged-in user
    const filteredRows = rows.filter((user) => {
      const orgUserRelation = orgUserRelations.find(
        (relation) => relation.UserID === user.ID
      );
      // Exclude users belonging to the logged-in user's organization
      return orgUserRelation?.OrganizationID !== loggedInOrganizationID;
    });

    // Map users with their respective Role, Is_approved, and Organization_name
    const mappedUsers = filteredRows.map((user) => {
      const orgUserRelation = orgUserRelations.find(
        (relation) => relation.UserID === user.ID
      );
      const organization = organizations.find(
        (org) => org.ID === orgUserRelation?.OrganizationID
      );
      return {
        ...user.toJSON(),
        Role: orgUserRelation ? orgUserRelation.Role : null,
        Is_approved: orgUserRelation ? orgUserRelation.Is_approved : null,
        Organization_name: organization ? organization.Organization_name : null,
      };
    });

    // Calculate total pages for pagination
    const totalPages = limit ? Math.ceil(count / parseInt(limit, 10)) : 1;
    const currentPage = parseInt(page, 10);

    // Send response with users data and pagination info
    return res.status(200).json({
      users: mappedUsers,
      totalPages,
      currentPage,
      totalRecords: count,
    });
  } catch (error) {
    return next(error);
  }
}



// Get all users who is login

// async function getUsers(req, res, next) {
//   try {
//     const { page = 1, limit, search = "" } = req.query;
//     const loginUser = req.user;
//     const offset = (page - 1) * (limit ? parseInt(limit, 10) : 0);

//     // Fetch OrganizationUserRelation data for the specified OrganizationID
//     const orgUserRelations = await OrganizationUserRealtionModel.findAll({
//       where: { OrganizationID: loginUser.OrganizationID },
//     });

//     // Fetch User IDs from the fetched OrganizationUserRelation data
//     const userIds = orgUserRelations.map((relation) => relation.UserID);

//     // Fetch users based on the fetched User IDs and search criteria
//     const users = await User.findAll({
//       attributes: {
//         exclude: [
//           "Password",
//           "Otp",
//           "AccessToken",
//           "Created_at",
//           "Otp_expiration_time",
//           "Updated_at",
//         ],
//       },
//       where: {
//         [Op.and]: [
//           { ID: userIds },
//           { Is_deleted: false },
//           {
//             [Op.or]: [
//               { Email: { [Op.like]: `%${search}%` } },
//               { First_name: { [Op.like]: `%${search}%` } },
//               { Last_name: { [Op.like]: `%${search}%` } },
//             ],
//           },
//         ],
//       },
//       offset,
//       limit: limit ? parseInt(limit, 10) : null,
//     });

//     // Map the users with Role and Is_approved from OrganizationUserRelation
//     const mappedUsers = users.map((user) => {
//       const orgUserRelation = orgUserRelations.find(
//         (relation) => relation.UserID === user.ID
//       );
//       if (orgUserRelation) {
//         return {
//           ...user.toJSON(),
//           Role: orgUserRelation.Role,
//           Is_approved: orgUserRelation.Is_approved,
//         };
//       } else {
//         return user.toJSON();
//       }
//     });

//     const totalPages = limit
//       ? Math.ceil(users.length / parseInt(limit, 10))
//       : 1;
//     const currentPage = parseInt(page, 10);

//     return res.status(200).json({
//       users: mappedUsers,
//       totalPages,
//       currentPage,
//       totalRecords: users.length,
//     });
//   } catch (error) {
//     return next(error);
//   }
// }


async function getUsers(req, res, next) {
  try {
    const { page = 1, limit, search = "" } = req.query;
    const loginUser = req.user;
    const offset = (page - 1) * (limit ? parseInt(limit, 10) : 0);

    // Fetch OrganizationUserRelation data for the specified OrganizationID
    const orgUserRelations = await OrganizationUserRealtionModel.findAll({
      where: { OrganizationID: loginUser.OrganizationID },
    });

    // Fetch User IDs from the fetched OrganizationUserRelation data
    const userIds = orgUserRelations.map((relation) => relation.UserID);

    // Exclude records where loginUser.ID matches UserID in OrganizationUserRelation
    const excludedUserRelations = await OrganizationUserRealtionModel.findAll({
      where: { UserID: loginUser.ID },
    });
    const excludedUserIds = excludedUserRelations.map((relation) => relation.UserID);

    // Count total matching users excluding the filtered User IDs
    const totalRecords = await User.count({
      where: {
        [Op.and]: [
          { ID: { [Op.in]: userIds, [Op.notIn]: excludedUserIds } },
          { Is_deleted: false },
          {
            [Op.or]: [
              { Email: { [Op.like]: `%${search}%` } },
              { First_name: { [Op.like]: `%${search}%` } },
              { Last_name: { [Op.like]: `%${search}%` } },
            ],
          },
        ],
      },
    });

    // Fetch users based on the fetched User IDs and search criteria with pagination
    const users = await User.findAll({
      attributes: {
        exclude: [
          "Password",
          "Otp",
          "AccessToken",
          "Created_at",
          "Otp_expiration_time",
          "Updated_at",
        ],
      },
      where: {
        [Op.and]: [
          { ID: { [Op.in]: userIds, [Op.notIn]: excludedUserIds } },
          { Is_deleted: false },
          {
            [Op.or]: [
              { Email: { [Op.like]: `%${search}%` } },
              { First_name: { [Op.like]: `%${search}%` } },
              { Last_name: { [Op.like]: `%${search}%` } },
            ],
          },
        ],
      },
      offset,
      limit: limit ? parseInt(limit, 10) : null,
    });

    // Map the users with Role and Is_approved from OrganizationUserRelation
    const mappedUsers = users.map((user) => {
      const orgUserRelation = orgUserRelations.find(
        (relation) => relation.UserID === user.ID
      );
      if (orgUserRelation) {
        return {
          ...user.toJSON(),
          Role: orgUserRelation.Role,
          Is_approved: orgUserRelation.Is_approved,
        };
      } else {
        return user.toJSON();
      }
    });

    // Calculate total pages
    const totalPages = limit ? Math.ceil(totalRecords / parseInt(limit, 10)) : 1;
    const currentPage = parseInt(page, 10);

    return res.status(200).json({
      users: mappedUsers,
      totalPages,
      currentPage,
      totalRecords,
    });
  } catch (error) {
    return next(error);
  }
}


// async function getUsers(req, res, next) {
//   try {
//     const { page = 1, limit, search = "" } = req.query;
//     const loginUser = req.user;
//     const offset = (page - 1) * (limit ? parseInt(limit, 10) : 0);

//     // Fetch OrganizationUserRelation data for the specified OrganizationID
//     const orgUserRelations = await OrganizationUserRealtionModel.findAll({
//       where: { OrganizationID: loginUser.OrganizationID },
//     });

//     // Fetch User IDs from the fetched OrganizationUserRelation data
//     const userIds = orgUserRelations.map((relation) => relation.UserID);

//     // Count total matching users
//     const totalRecords = await User.count({
//       where: {
//         [Op.and]: [
//           { ID: userIds },
//           { Is_deleted: false },
//           {
//             [Op.or]: [
//               { Email: { [Op.like]: `%${search}%` } },
//               { First_name: { [Op.like]: `%${search}%` } },
//               { Last_name: { [Op.like]: `%${search}%` } },
//             ],
//           },
//         ],
//       },
//     });

//     // Fetch users based on the fetched User IDs and search criteria with pagination
//     const users = await User.findAll({
//       attributes: {
//         exclude: [
//           "Password",
//           "Otp",
//           "AccessToken",
//           "Created_at",
//           "Otp_expiration_time",
//           "Updated_at",
//         ],
//       },
//       where: {
//         [Op.and]: [
//           { ID: userIds },
//           { Is_deleted: false },
//           {
//             [Op.or]: [
//               { Email: { [Op.like]: `%${search}%` } },
//               { First_name: { [Op.like]: `%${search}%` } },
//               { Last_name: { [Op.like]: `%${search}%` } },
//             ],
//           },
//         ],
//       },
//       offset,
//       limit: limit ? parseInt(limit, 10) : null,
//     });

//     // Map the users with Role and Is_approved from OrganizationUserRelation
//     const mappedUsers = users.map((user) => {
//       const orgUserRelation = orgUserRelations.find(
//         (relation) => relation.UserID === user.ID
//       );
//       if (orgUserRelation) {
//         return {
//           ...user.toJSON(),
//           Role: orgUserRelation.Role,
//           Is_approved: orgUserRelation.Is_approved,
//         };
//       } else {
//         return user.toJSON();
//       }
//     });

//     // Calculate total pages
//     const totalPages = limit ? Math.ceil(totalRecords / parseInt(limit, 10)) : 1;
//     const currentPage = parseInt(page, 10);

//     return res.status(200).json({
//       users: mappedUsers,
//       totalPages,
//       currentPage,
//       totalRecords,
//     });
//   } catch (error) {
//     return next(error);
//   }
// }


// Get user by ID
async function getUserById(req, res, next) {
  try {
    // Fetch the requested user by ID, excluding sensitive fields
    const requestUser = await User.findByPk(req.params.id, {
      attributes: {
        exclude: [
          "Password",
          "Otp",
          "AccessToken",
          "Otp_expiration_time",
          "Created_at",
          "Updated_at",
        ],
      },
      include: [
        {
          model: OrganizationUserRealtionModel,
          as: "OrganizationUserRelation",
          attributes: ["Role", "Is_approved"], // Fetch Role and Is_approved from OrganizationUserRelation
          where: { Is_deleted: false },
          required: false, // Allow join even if there's no organization relation
        },
      ],
    });

    // If the user is not found
    if (!requestUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Convert Sequelize instance to plain object
    let userData = requestUser.toJSON();

    // Set default values for Role and Is_approved
    userData.Role = null;
    userData.Is_approved = null;
    let organizationID = null;

    // // Check if User_type is '1' (organization user) and org relation exists
    // if (userData.User_type === 1 && requestUser.OrganizationUserRelation) {
    //   // If there's an organization relation, extract Role and Is_approved
    //   userData.Role = requestUser.OrganizationUserRelation.Role;
    //   userData.Is_approved = requestUser.OrganizationUserRelation.Is_approved;
    // }
    // Determine OrganizationID
    if (userData.User_type === 2) {
      // For organizations (UserType = 2), use the User ID as OrganizationID
      organizationID = userData.ID;
    } else if (userData.User_type === 1 && requestUser.OrganizationUserRelation) {
      // For users (UserType = 1), get OrganizationID from OrganizationUserRelation
      const relation = await OrganizationUserRealtionModel.findOne({
        where: {
          UserID: userData.ID,
          Is_deleted: false,
        },
        attributes: ["OrganizationID"],
      });

      if (relation) {
        // Match the OrganizationID in Organization table to get the corresponding UserID
        const organization = await OrganizationModel.findByPk(relation.OrganizationID, {
          attributes: ["UserID"],
        });

        if (organization) {
          organizationID = organization.UserID;
        }
      }

      // Extract Role and Is_approved
      userData.Role = requestUser.OrganizationUserRelation.Role;
      userData.Is_approved = requestUser.OrganizationUserRelation.Is_approved;
    }

    // Add OrganizationID to the response
    userData.OrganizationID = organizationID;



    // Remove the OrganizationUserRelation field from the response
    delete userData.OrganizationUserRelation;

    // Return the modified user data
    return res.status(200).json({ user: userData });
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
    const { Email, Role, Is_approved, organizationID } = req.body; // Extract Role and Is_approved from req.body

    const loginUser = req.user;

    const requestUser = await User.findByPk(req.params.id);
    if (!requestUser) {
      return res.status(404).json({ message: messages.error.USER_NOT_FOUND });
    }

    // Check if email  already exists
    // if (Email) {
    //   const existingUserByEmail = await User.findOne({ where: { Email: Email, Is_deleted:false } });
    //   if (existingUserByEmail && existingUserByEmail.ID !== requestUser.ID) {
    //     return res.status(409).json({ message: messages.error.EMAIL_EXISTS });
    //   }
    // }
    //  const organizationUsers = await OrganizationUserRealtionModel.findAll({
    //   where: { OrganizationID: loginUser.OrganizationID, Is_deleted: false },
    // });

    // Step 1: Find the logged-in user in the User table
    const userRecord = await UserModel.findOne({ where: { ID: loginUser.ID } });
    if (!userRecord) {
      return res.status(404).json({ message: messages.error.USER_NOT_FOUND });
    }

    // Step 2: Find the organization record associated with the logged-in user
    const organizationRecord = await OrganizationModel.findOne({
      where: { UserID: loginUser.ID, Is_deleted: false },
    });

    if (!organizationRecord) {
      return res
        .status(404)
        .json({ message: messages.error.ORGNIZATION_NOT_FOUND });
    }

    // Use the found OrganizationID to filter organization users
    const organizationUsers = await OrganizationUserRealtionModel.findAll({
      where: { OrganizationID: organizationRecord.ID, Is_deleted: false },
    });

    const userIds = organizationUsers.map((orgUser) => orgUser.UserID);

    const existingUser = await UserModel.findOne({
      where: {
        ID: userIds,
        Email: Email,
      },
    });

    if (existingUser && existingUser.ID !== requestUser.ID) {
      return res
        .status(409)
        .json({ message: messages.error.USER_ALREADY_REGISTERED });
    }

    // Update user fields based on request body
    updateFields.forEach((field) => {
      if (
        field !== "Password" &&
        field !== "AccessToken" &&
        field !== "Otp" &&
        field !== "Created_at" &&
        field !== "Updated_at" &&
        field !== "User_type"
      ) {
        requestUser[field] = req.body[field];
      }
    });

    await requestUser.save();

    // Update Role and Is_approved in OrganizationUserRealtion table
    if (Role || Is_approved !== undefined) {
      // Find the organization relation for the user
      const orgUserRelation = await OrganizationUserRealtionModel.findOne({
        where: { UserID: requestUser.ID },
      });

      // If the organization relation exists, update the Role and Is_approved fields
      if (orgUserRelation) {
        // Update the Role if provided
        if (Role) {
          // Validate the provided role
          if (
            !["Basic_User", "Advance_User","Admin", "External_User"].includes(Role) &&
            Role !== undefined
          ) {
            return res
              .status(400)
              .json({ message: messages.error.INVALID_USER_ROLE });
          }

          // Get the userRoleValue based on the provided role
          const userRoleValue = commonFunctions.OrgnizationRole[Role];

          // Update the organization relation's role
          orgUserRelation.Role = userRoleValue;
        }

        // Update the Is_approved field if provided
        if (Is_approved !== undefined) {
          orgUserRelation.Is_approved = Is_approved;
        }
        // Update the OrganizationID if provided
        if (organizationID) {
          orgUserRelation.OrganizationID = organizationID;
        }

        // Save the updated organization relation
        await orgUserRelation.save();
      }
    }

    const sanitizedUser = sanitizeUser(requestUser);

    return res
      .status(200)
      .json({ message: messages.success.USER_UPDATED, user: sanitizedUser });
  } catch (error) {
    return next(error);
  }
}


async function updateUserProfile(req, res, next) {
  // #swagger.tags = ['Users']
  // #swagger.description = 'To update user details by ID'
  const updateFields = Object.keys(req.body);
  try {
    const { Email, Role, Is_approved, organizationID } = req.body; // Extract Role and Is_approved from req.body

    const loginUser = req.user;

    const requestUser = await User.findByPk(req.params.id);
    if (!requestUser) {
      return res.status(404).json({ message: messages.error.USER_NOT_FOUND });
    }

    // Check if email  already exists
    if (Email) {
      const existingUserByEmail = await User.findOne({ where: { Email: Email, Is_deleted:false } });
      if (existingUserByEmail && existingUserByEmail.ID !== requestUser.ID) {
        return res.status(409).json({ message: messages.error.EMAIL_EXISTS });
      }
    }
    //  const organizationUsers = await OrganizationUserRealtionModel.findAll({
    //   where: { OrganizationID: loginUser.OrganizationID, Is_deleted: false },
    // });

    // Step 1: Find the logged-in user in the User table
    const userRecord = await UserModel.findOne({ where: { ID: loginUser.ID } });
    if (!userRecord) {
      return res.status(404).json({ message: messages.error.USER_NOT_FOUND });
    }

    // Step 2: Find the organization record associated with the logged-in user
    // const organizationRecord = await OrganizationModel.findOne({
    //   where: { UserID: loginUser.ID, Is_deleted: false },
    // });

    // if (!organizationRecord) {
    //   return res
    //     .status(404)
    //     .json({ message: messages.error.ORGNIZATION_NOT_FOUND });
    // }

    // Use the found OrganizationID to filter organization users
    // const organizationUsers = await OrganizationUserRealtionModel.findAll({
    //   where: { OrganizationID: organizationRecord.ID, Is_deleted: false },
    // });

    // const userIds = organizationUsers.map((orgUser) => orgUser.UserID);

    // const existingUser = await UserModel.findOne({
    //   where: {
    //     ID: userIds,
    //     Email: Email,
    //   },
    // });

    // if (existingUser && existingUser.ID !== requestUser.ID) {
    //   return res
    //     .status(409)
    //     .json({ message: messages.error.USER_ALREADY_REGISTERED });
    // }

    // Update user fields based on request body
    updateFields.forEach((field) => {
      if (
        field !== "Password" &&
        field !== "AccessToken" &&
        field !== "Otp" &&
        field !== "Created_at" &&
        field !== "Updated_at" &&
        field !== "User_type"
      ) {
        requestUser[field] = req.body[field];
      }
    });

    await requestUser.save();

    // Update Role and Is_approved in OrganizationUserRealtion table
    if (Role || Is_approved !== undefined) {
      // Find the organization relation for the user
      const orgUserRelation = await OrganizationUserRealtionModel.findOne({
        where: { UserID: requestUser.ID },
      });

      // If the organization relation exists, update the Role and Is_approved fields
      if (orgUserRelation) {
        // Update the Role if provided
        if (Role) {
          // Validate the provided role
          if (
            !["Basic_User", "Advance_User", "External_User","Admin"].includes(Role) &&
            Role !== undefined
          ) {
            return res
              .status(400)
              .json({ message: messages.error.INVALID_USER_ROLE });
          }

          // Get the userRoleValue based on the provided role
          const userRoleValue = commonFunctions.OrgnizationRole[Role];

          // Update the organization relation's role
          orgUserRelation.Role = userRoleValue;
        }

        // Update the Is_approved field if provided
        if (Is_approved !== undefined) {
          orgUserRelation.Is_approved = Is_approved;
        }
        // Update the OrganizationID if provided
        if (organizationID) {
          orgUserRelation.OrganizationID = organizationID;
        }

        // Save the updated organization relation
        await orgUserRelation.save();
      }
    }

    const sanitizedUser = sanitizeUser(requestUser);

    return res
      .status(200)
      .json({ message: messages.success.USER_UPDATED, user: sanitizedUser });
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

    // Check if the user exists

    const user = await UserModel.findOne({
      where: { ID: UserID, Is_deleted: false },
    });
    const organizationUserRealtion =
      await OrganizationUserRealtionModel.findOne({
        where: { UserID: UserID, Is_deleted: false },
      });

    if (!user) {
      return res.status(404).json({ message: messages.error.USER_NOT_FOUND });
    }

    if (organizationUserRealtion) {
      organizationUserRealtion.Is_deleted = true;
      await organizationUserRealtion.save();
    }
    user.Is_deleted = true;
    await user.save();

    return res.status(200).json({ message: messages.success.USER_DELETED });
  } catch (error) {
    return next(error);
  }
}

// get AllUser for Admin
async function getAllUsers(req, res, next) {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const offset = (page - 1) * parseInt(limit, 10);

    // Step 1: Fetch users with pagination and filters
    const { count, rows: users } = await UserModel.findAndCountAll({
      where: {
        User_type: 1, // Regular user
        Is_deleted: false,
        [Sequelize.Op.or]: [
          { First_name: { [Sequelize.Op.like]: `%${search}%` } },
          { Last_name: { [Sequelize.Op.like]: `%${search}%` } },
          { Email: { [Sequelize.Op.like]: `%${search}%` } },
        ],
      },
      attributes: [
        "ID",
        "First_name",
        "Last_name",
        "Email",
        "Phone",
        "Gender",
        "Date_of_birth",
      ],
      limit: parseInt(limit, 10),
      offset,
      order: [["Created_at", "DESC"]],
    });

    // Step 2: Fetch related organization data for users
    const userIds = users.map((user) => user.ID);

    const organizationRelations = await OrganizationUserRealtionModel.findAll({
      where: {
        UserID: userIds,
        Is_deleted: false,
      },
      attributes: ["UserID", "OrganizationID", "Role"],
    });

    const organizationIds = organizationRelations.map(
      (relation) => relation.OrganizationID
    );

    // Fetch organizations by their IDs and include Organization_name
    const organizations = await OrganizationModel.findAll({
      where: {
        ID: organizationIds,
        Is_deleted: false,
      },
      attributes: ["ID", "Organization_name"],
    });

    // Map organization data by OrganizationID
    const organizationMap = organizations.reduce((acc, org) => {
      acc[org.ID] = org.Organization_name;
      return acc;
    }, {});

    // Map user organization relationships
    const userOrganizations = organizationRelations.reduce((acc, relation) => {
      acc[relation.UserID] = {
        organizationID: relation.OrganizationID,
        role: relation.Role, // Preserve Role even if it is 0
        organizationName: organizationMap[relation.OrganizationID] || null,
      };
      return acc;
    }, {});

    // Step 3: Map data to users
    const mappedUsers = users.map((user) => {
      const organizationInfo = userOrganizations[user.ID] || {};
      return {
        ID: user.ID,
        First_name: user.First_name,
        Last_name: user.Last_name,
        Email: user.Email,
        Phone: user.Phone,
        Gender: user.Gender,
        Date_of_birth: user.Date_of_birth,
        OrganizationID: organizationInfo.organizationID || null,
        OrganizationName: organizationInfo.organizationName || null,
        Role:
          organizationInfo.role !== undefined && organizationInfo.role !== null
            ? organizationInfo.role
            : null, // Explicitly handle 0 and other falsy values
      };
    });

    // Step 4: Prepare and send the response
    const totalPages = Math.ceil(count / parseInt(limit, 10));
    const currentPage = parseInt(page, 10);

    return res.status(200).json({
      users: mappedUsers,
      totalPages,
      currentPage,
      totalRecords: count,
    });
  } catch (error) {
    return next(error);
  }
}

// add AllUser for Admin
async function adminAddUser(req, res, next) {
  // #swagger.tags = ['user']
  // #swagger.description = 'Add or update user details'
  let {
    First_name,
    Last_name,
    Email,
    Gender,
    Date_of_birth,
    Password,
    Phone,
    User_type,
    Role,
    Is_approved,
    organizationID,
  } = req.body;
  try {
    Email = Email.toLowerCase();
    let loginUser = req.user;

    // Check if the user already exists
    const existingUser = await UserModel.findOne({
      where: { Email: Email, Is_deleted: false },
    });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: messages.error.USER_ALREADY_REGISTERED });
    }

    // Validate User_type
    if (
      !["Basic_User", "Advance_User", "External_User","Admin"].includes(User_type) &&
      User_type !== undefined
    ) {
      return res
        .status(400)
        .json({ message: messages.error.INVALID_ORGNIZATION_ROLE });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(Password, 10);
    const userTypeDBValue = commonFunctions.UserRole[User_type];

    // Create new user
    const newUser = {
      First_name,
      Last_name,
      Email,
      Password: hashedPassword,
      Phone,
      Gender,
      Date_of_birth,
      Is_otp_verified: true,
      User_type: 1,
      Is_verified: true,
    };

    const user = await UserModel.create(newUser);
    await user.save();

    // Validate Role
    if (
      !["Basic_User", "Advance_User", "External_User","Admin"].includes(Role) &&
      Role !== undefined
    ) {
      return res
        .status(400)
        .json({ message: messages.error.INVALID_USER_ROLE });
    }

    const userRoleValue = commonFunctions.OrgnizationRole[Role];

    // Create organization-user relation
    const newOrganization = {
      UserID: user.ID,
      OrganizationID: organizationID,
      Role: userRoleValue,
      Is_approved,
    };

    const organization = await OrganizationUserRealtionModel.create(
      newOrganization
    );

    // Sanitize user
    const sanitizedUser = sanitizeUser(user, organizationID);

    // Add organizationID to the sanitized response
    sanitizedUser.organizationID = organizationID;

    return res
      .status(200)
      .json({ message: messages.success.USER_ADD, User: sanitizedUser });
  } catch (error) {
    return next(error);
  }
}

async function getAllProjectUserOrganizationData(req, res, next) {
  try {
    // Step 1: Fetch total users with UserType 1 (regular users) and not deleted
    const totalUser = await UserModel.count({
      where: {
        User_type: 1, // Regular users
        Is_deleted: false,
      },
    });

    // Step 2: Fetch total organizations with UserType 2 and not deleted
    const totalOrganization = await UserModel.count({
      where: {
        User_type: 2, // Organizations
        Is_deleted: false,
      },
    });

    // Step 3: Fetch total projects from the Project table
    const totalProject = await ProjectModel.count({
    });

    // Step 4: Return the aggregated data
    return res.status(200).json({
      totalUser,
      totalOrganization,
      totalProject,
    });
  } catch (error) {
    return next(error);
  }
}

function sanitizeUser(user) {
  const sanitizedUser = { ...user.dataValues };
  delete sanitizedUser.Password;
  delete sanitizedUser.Otp;
  delete sanitizedUser.User_type;
  delete sanitizedUser.Otp_expiration_time;
  delete sanitizedUser.AccessToken;
  // delete sanitizedUser.UserRoleID;
  delete sanitizedUser.Created_at;
  delete sanitizedUser.Updated_at;
  return sanitizedUser;
}

module.exports = {
  addUser,
  getUsersListShare,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllUsers,
  adminAddUser,
  getAllProjectUserOrganizationData,
  updateUserProfile
};
