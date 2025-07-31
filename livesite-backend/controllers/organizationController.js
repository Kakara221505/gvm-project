const commonFunctions = require('../utils/commonFunctions');
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const User = require('../models/user');
const bcrypt = require('bcrypt');
// const { Op } = require('sequelize');
const { Sequelize, Op } = require('sequelize');
const messages = require('../utils/messages');
const UserModel = require('../models/user');
const OrganizationModel = require('../models/organization');
const ProjectModel = require('../models/Project');
const OrganizationUserRelation = require('../models/OrganizationUserRelation');
const ShareModel = require('../models/Share');



// Get all Organization

// async function getAllOrganization(req, res, next) {
//   try {
//     const { page = 1, limit, search = '' } = req.query;
//     const loginUser = req.user;

//     const offset = (page - 1) * (limit ? parseInt(limit, 10) : 0);

//     // Fetch organizations based on the specified UserID
//     const orgUserRelations = await OrganizationModel.findAll({
//       where: { UserID: loginUser.ID }
//     });

//     // Fetch User IDs from the fetched OrganizationUserRelation data
//     const userIds = orgUserRelations.map(relation => relation.UserID);

//     // Fetch users based on the fetched User IDs and search criteria
//     const users = await User.findAll({
//       attributes: { exclude: ['Password', 'Otp', 'AccessToken', 'Created_at','Otp_expiration_time', 'Updated_at'] },
//       where: {
//         [Op.and]: [
//           { ID: userIds },
//           {
//             [Op.or]: [
//               { Email: { [Op.like]: `%${search}%` } },
//               { First_name: { [Op.like]: `%${search}%` } },
//               { Last_name: { [Op.like]: `%${search}%` } }
//             ]
//           }
//         ]
//       },
//       offset,
//       limit: limit ? parseInt(limit, 10) : null
//     });

//     // Map the users with Role and Is_approved from OrganizationUserRelation
//     const mappedOrganizations = orgUserRelations.map(org => {
//       const user = users.find(u => u.ID === org.UserID);
//       if (user) {
//         return {
//           ...org.toJSON(),
//           User: {
//             ID: user.ID,
//             First_name: user.First_name,
//             Last_name: user.Last_name,
//             Email: user.Email,
//             Gender: user.Gender,
//             Date_of_birth: user.Date_of_birth,
//             Phone: user.Phone,
//             Is_verified: user.Is_verified,
//             Is_paid_user: user.Is_paid_user,
//             User_type: user.User_type,
//             Login_type: user.Login_type,
//             Is_deleted: user.Is_deleted,
//             Is_otp_verified: user.Is_otp_verified,
//             AccessToken: user.AccessToken
//           }
//         };
//       } else {
//         return org.toJSON();
//       }
//     });

//     const totalPages = limit ? Math.ceil(mappedOrganizations.length / parseInt(limit, 10)) : 1;
//     const currentPage = parseInt(page, 10);

//     return res.status(200).json({ organizations: mappedOrganizations, totalPages, currentPage, totalRecords: mappedOrganizations.length });
//   } catch (error) {
//     return next(error);
//   }
// }

async function getAllOrganization(req, res, next) {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    const offset = (page - 1) * parseInt(limit, 10);

    // Fetch related users where User_type is 2
    const users = await UserModel.findAll({
      where: {
        User_type: '2',
        Is_deleted: false,
        [Op.or]: [
          { Email: { [Op.like]: `%${search}%` } },
          { First_name: { [Op.like]: `%${search}%` } },
          { Last_name: { [Op.like]: `%${search}%` } }
        ]
      },
      attributes: ['ID', 'First_name', 'Last_name', 'Email', 'Phone', 'Date_of_birth'],
      offset,
      limit: parseInt(limit, 10)
    });

    // Get user IDs
    const userIds = users.map(user => user.ID);

    // Fetch organizations that match user IDs
    const organizations = await OrganizationModel.findAll({
      where: {
        UserID: userIds
      }
    });

    // Map users and their corresponding organizations into one object
    const mappedData = users.map(user => {
      const org = organizations.find(org => org.UserID === user.ID);
      return {
        ID: user.ID,
        First_name: user.First_name,
        Last_name: user.Last_name,
        Email: user.Email,
        Dob: user.Date_of_birth,
        Phone: user.Phone,
        Key_name: org ? org.Key_name : null,
        Organization_name: org ? org.Organization_name : null,
        OrganizationID: org ? org.ID : null,
        Profile_image_url: org ? org.Profile_image_url : null,
        Website: org ? org.Website : null,
        Address: org ? org.Address : null,
        City: org ? org.City : null,
        State: org ? org.State : null,
        Postal_code: org ? org.Postal_code : null,
        Country: org ? org.Country : null
      };
    });

    // Get total count of users for pagination
    const totalRecords = await UserModel.count({
      where: {
        User_type: '2',
        Is_deleted: false
      }
    });

    const totalPages = Math.ceil(totalRecords / parseInt(limit, 10));
    const currentPage = parseInt(page, 10);

    // Return the mapped data along with pagination details
    return res.status(200).json({
      organizations: mappedData,
      totalPages,
      currentPage,
      totalRecords
    });

  } catch (error) {
    next(error);
  }
}


// Get user by ID
async function getOrganizationById(req, res, next) {
  try {
    const loginUser = req.user;
    const userId = req.params.id;

    // Fetch user details by ID from the User table
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['Password', 'Otp', 'AccessToken', 'Otp_expiration_time', 'Created_at', 'Updated_at'] },
    });

    if (!user) {
      return res.status(404).json({ message: messages.error.USER_NOT_FOUND });
    }

    // Fetch organization data for the specified UserID
    const organization = await OrganizationModel.findOne({
      where: { UserID: userId }
    });

    if (organization) {
      let profileImageUrl = organization.Profile_image_url;
      // Concatenate base URL with Profile_image_url if Profile_image_url is not empty or null
      if (profileImageUrl && profileImageUrl.trim() !== "") {
        profileImageUrl = `${process.env.BASE_URL}/${profileImageUrl}`;
      }
      // Replace "null" strings with null values
      const sanitizedOrganization = Object.fromEntries(
        Object.entries(organization.toJSON()).map(([key, value]) => [key, value === "null" ? null : value])
      );
      return res.status(200).json({ user: user.toJSON(), organization: { ...sanitizedOrganization, Profile_image_url: profileImageUrl } });
    }

    // If no organization data is found, just return the user data
    return res.status(200).json({ user });
  } catch (error) {
    return next(error);
  }
}

// Update user by ID
async function updateOrganization(req, res, next) {
  // #swagger.tags = ['Users']
  // #swagger.description = 'To update user details by ID'
  const updateFields = Object.keys(req.body);
  try {
    const { Email, Key_name, Organization_name, Website, Contact_person_name, Address, City, State, Postal_code, Country,
      New_password, ProfileMedia } = req.body; // Extract Role and Is_approved from req.body
    console.log("hii", req.First_name)
    const loginUser = req.user;

    const requestUser = await User.findByPk(req.params.id);
    if (!requestUser) {
      return res.status(404).json({ message: messages.error.USER_NOT_FOUND });
    }

    // Check if email already exists
    if (Email) {
      const existingUserByEmail = await User.findOne({ where: { Email: Email, Is_deleted: false } });
      if (existingUserByEmail && existingUserByEmail.ID !== requestUser.ID) {
        return res.status(409).json({ message: messages.error.EMAIL_EXISTS });
      }
    }

// Password update logic
if (New_password) {
  // const isPasswordValid = await bcrypt.compare(Current_password, requestUser.Password);
  // if (!isPasswordValid) {
  //   return res.status(400).json({ message: messages.error.INVALID_CURRENT_PASSWORD });
  // }
  // Hash the new password before saving
  const hashedNewPassword = await bcrypt.hash(New_password, 10);
  requestUser.Password = hashedNewPassword;
}

    // Update user fields based on request body
    updateFields.forEach(field => {
      if (field !== 'Password' && field !== 'AccessToken' && field !== 'Otp' && field !== 'Created_at' && field !== 'Updated_at' && field !== 'User_type') {
        requestUser[field] = req.body[field] !== 'null' ? req.body[field] : null;
      }
    });

    await requestUser.save();

    const organization = await OrganizationModel.findOne({ where: { UserID: requestUser.ID } });
    let file = '';
    if (req.file) {
      file = `${process.env.PROFILE_IMAGE_ROUTE}${req.file.filename}`
    }
    if (organization) {
      // if (Key_name && Key_name !== organization.Key_name) {
      //   const existingKey = await OrganizationModel.findOne({ where: { Key_name: Key_name } });
      //   if (existingKey && existingKey.UserID !== requestUser.ID) {
      //     console.log("kjfdj", Key_name, organization.Key_name)
      //     return res.status(409).json({ message: messages.error.ORGANIZATION_KEY_ALREADY_REGISTERED });
      //   }
      //   organization.Key_name = Key_name;
      // }

      if (Organization_name) {
        organization.Organization_name = Organization_name;
      }
      if (Website) {
        organization.Website = Website;
      }
      if (Contact_person_name) {
        organization.Contact_person_name = Contact_person_name;
      }
      if (Address) {
        organization.Address = Address;
      }
      if (City) {
        organization.City = City;
      }
      if (State) {
        organization.State = State;
      }
      if (Postal_code) {
        organization.Postal_code = Postal_code;
      }
      if (Country) {
        organization.Country = Country;
      }
      if (file !== "") {
        organization.Profile_image_url = file;
      }
      await organization.save();
    }


    const sanitizedUser = sanitizeUser(requestUser);

    return res.status(200).json({ message: messages.success.ORGANIZATION_UPDATED, user: sanitizedUser });
  } catch (error) {
    return next(error);
  }
}



// Delete user by ID
async function deleteOrganization(req, res, next) {
  // #swagger.tags = ['Users']
  // #swagger.description = 'To delete user by ID'
  try {
    const UserID = req.params.id;

    // Check if the user exists

    const user = await UserModel.findOne({ where: { ID: UserID, Is_deleted: false } });

    const organization = await OrganizationModel.findOne({ where: { UserID: UserID, Is_deleted: false } });
    if (!user && !organization) {
      return res.status(404).json({ message: messages.error.USER_NOT_FOUND });
    }
    organization.Is_deleted = true;
    user.Is_deleted = true;
    await organization.save();
    await user.save();


    return res.status(200).json({ message: messages.success.USER_DELETED });
  } catch (error) {
    return next(error);
  }
}


async function getAllOwnProject(req, res, next) {
  try {
    console.log("hii12")
    const { page = 1, limit = 10000000000, search = '' } = req.query;
    const offset = (page - 1) * parseInt(limit, 10);
    const loginUser = req.user; // Assuming loginUser contains logged-in user information

    // Step 1: Fetch logged-in user's data
    const user = await UserModel.findOne({
      where: { ID: loginUser.ID },
      attributes: ['ID', 'User_type']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Step 2: Check if the user is User_type 1 or 2
    if (user.User_type === 1) {
      // Step 3: Fetch the user's role from OrganizationUserRelation for User_type 1
      const organizationRelation = await OrganizationUserRelation.findOne({
        where: { UserID: loginUser.ID, Is_deleted: false },
        attributes: ['Role']
      });

      if (!organizationRelation) {
        return res.status(403).json({ message: 'User does not have access to any organization' });
      }

      const { Role } = organizationRelation;

      // Only proceed if the user has a role of basic ('1') or advance ('0')
      if (Role === 2) {
        return res.status(403).json({ message: 'External users do not have access to the projects' });
      }

      // Fetch projects for users with User_type 1 (regular user)
      const projects = await ProjectModel.findAll({
        where: {
          UserID: user.ID,  // Matching logged-in user's ID with Project's UserID
          Name: { [Op.like]: `%${search}%` },  // Optional search filter
        },
        attributes: ['ID', 'Name', 'UserID', 'Description', 'Created_at'], // Select only the necessary fields
        order: [['Created_at', 'DESC']],
        offset,
        limit: parseInt(limit, 10),
      });

      // Get total project count for pagination
      const totalRecords = await ProjectModel.count({
        where: {
          UserID: user.ID,
          Name: { [Op.like]: `%${search}%` }, // Optional search filter
        }
      });

      const totalPages = Math.ceil(totalRecords / parseInt(limit, 10));
      const currentPage = parseInt(page, 10);

      return res.status(200).json({
        projects,
        totalPages,
        currentPage,
        totalRecords,
      });
    } else if (user.User_type === 2) {
      // Step 4: Handle case for User_type = 2
      // Fetch projects for users with User_type 2 by matching UserID in the Project table with the logged-in user's ID

      const projects = await ProjectModel.findAll({
        where: {
          UserID: user.ID,  // Match UserID with the logged-in user's ID
          Name: { [Op.like]: `%${search}%` },  // Optional search filter
        },
        attributes: ['ID', 'Name', 'UserID', 'Description', 'Created_at'], // Select only the necessary fields
        order: [['Created_at', 'DESC']],
        offset,
        limit: parseInt(limit, 10),
      });

      // Get total project count for pagination
      const totalRecords = await ProjectModel.count({
        where: {
          UserID: user.ID,
          Name: { [Op.like]: `%${search}%` }, // Optional search filter
        }
      });

      const totalPages = Math.ceil(totalRecords / parseInt(limit, 10));
      const currentPage = parseInt(page, 10);

      // Return the project list for User_type 2
      return res.status(200).json({
        projects,
        totalPages,
        currentPage,
        totalRecords,
      });
    } else {
      // If User_type is not 1 or 2, deny access
      const projects = await ProjectModel.findAll({
        where: {
          UserID: user.ID,  // Match UserID with the logged-in user's ID
          Name: { [Op.like]: `%${search}%` },  // Optional search filter
        },
        attributes: ['ID', 'Name', 'UserID', 'Description', 'Created_at'], // Select only the necessary fields
        order: [['Created_at', 'DESC']],
        offset,
        limit: parseInt(limit, 10),
      });

      // Get total project count for pagination
      const totalRecords = await ProjectModel.count({
        where: {
          UserID: user.ID,
          Name: { [Op.like]: `%${search}%` }, // Optional search filter
        }
      });

      const totalPages = Math.ceil(totalRecords / parseInt(limit, 10));
      const currentPage = parseInt(page, 10);

      // Return the project list for User_type 2
      return res.status(200).json({
        projects,
        totalPages,
        currentPage,
        totalRecords,
      });
    }

  } catch (error) {
    next(error);
  }
}





// async function getAllOrganizationProject(req, res, next) {
//   try {
//     const { page = 1, limit = 100000000000, search = '' } = req.query;
//     const offset = (page - 1);
//     const loginUser = req.user; // Assuming loginUser contains logged-in user information

//     // Step 1: Fetch logged-in user's data
//     const user = await UserModel.findOne({
//       where: { ID: loginUser.ID },
//       attributes: ['ID', 'User_type']
//     });

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     // Step 2: Check the user's User_type
//     if (user.User_type === 1) {
//       // User_type 1: regular user, existing logic to fetch projects
//       if (loginUser.Role === 0) {
//         // Fetch the user's organization relation
//         const organizationRelations = await OrganizationUserRelation.findAll({
//           where: { UserID: user.ID, Is_deleted: false },
//           attributes: ['OrganizationID', 'Role']
//         });

//         if (!organizationRelations.length) {
//           return res.status(404).json({ message: 'No organizations found for this user' });
//         }

//         // Get the OrganizationIDs for this user
//         const organizationIds = organizationRelations.map(rel => rel.OrganizationID);

//         // Step 3: Fetch organizations that match these OrganizationIDs
//         const organizations = await OrganizationModel.findAll({
//           where: {
//             ID: { [Op.in]: organizationIds },
//             Is_deleted: false
//           },
//           attributes: ['UserID']
//         });

//         if (!organizations.length) {
//           return res.status(404).json({ message: 'No valid organizations found' });
//         }

//         // Get the UserIDs from organizations
//         const organizationUserIds = organizations.map(org => org.UserID);

//         // Step 4: Fetch the projects related to the organization UserIDs
//         const projects = await ProjectModel.findAll({
//           where: {
//             UserID: { [Op.in]: organizationUserIds }, // Matching UserIDs from organizations
//             Name: { [Op.like]: `%${search}%` } // Optional search filter
//           },
//           attributes: ['ID', 'Name', 'UserID', 'Description', 'Created_at'],
//           order: [['Created_at', 'DESC']],
//           offset,
//           limit: parseInt(limit, 10),
//         });

//         // Step 5: Get total project count for pagination
//         const totalRecords = await ProjectModel.count({
//           where: {
//             UserID: { [Op.in]: organizationUserIds },
//             Name: { [Op.like]: `%${search}%` } // Optional search filter
//           }
//         });

//         const totalPages = Math.ceil(totalRecords / parseInt(limit, 10));
//         const currentPage = parseInt(page, 10);

//         // Step 6: Return the response with the list of projects and pagination
//         return res.status(200).json({
//           projects,
//           totalPages,
//           currentPage,
//           totalRecords,
//         });
//       }

//     }
//     else if (user.User_type === 2) {
//       // User_type 2: fetch projects for the user based on their organization

//       // Step 1: Find the organization the user is associated with
//       const organization = await OrganizationModel.findOne({
//         where: { UserID: user.ID, Is_deleted: false },
//         attributes: ['ID']
//       });

//       if (!organization) {
//         return res.status(404).json({ message: 'No organization found for this user' });
//       }

//       // Step 2: Get the OrganizationID
//       const organizationId = organization.ID;

//       // Step 3: Fetch all UserIDs associated with the OrganizationID
//       const organizationUserRelations = await OrganizationUserRelation.findAll({
//         where: { OrganizationID: organizationId, Is_deleted: false },
//         attributes: ['UserID']
//       });

//       const organizationUserIds = organizationUserRelations.map(rel => rel.UserID);

//       // Step 4: Fetch all projects associated with these UserIDs
//       const organizationProjects = await ProjectModel.findAll({
//         where: {
//           UserID: { [Op.in]: organizationUserIds }, // Matching UserIDs from organizations
//           Name: { [Op.like]: `%${search}%` } // Optional search filter
//         },
//         attributes: ['ID', 'Name', 'UserID', 'Description', 'Created_at'],
//         order: [['Created_at', 'DESC']],
//         offset,
//         limit: parseInt(limit, 10),
//       });

//       // Step 5: Fetch projects created by the logged-in user
//       const userProjects = await ProjectModel.findAll({
//         where: {
//           UserID: user.ID, // Match the logged-in user's ID
//           Name: { [Op.like]: `%${search}%` } // Optional search filter
//         },
//         attributes: ['ID', 'Name', 'UserID', 'Description', 'Created_at'],
//         order: [['Created_at', 'DESC']],
//         offset,
//         limit: parseInt(limit, 10),
//       });

//       // Step 6: Combine both project lists
//       const combinedProjects = [...organizationProjects, ...userProjects];

//       // Step 7: Get total project count for pagination
//       const totalRecords = await ProjectModel.count({
//         where: {
//           [Op.or]: [
//             { UserID: { [Op.in]: organizationUserIds } },
//             { UserID: user.ID }
//           ],
//           Name: { [Op.like]: `%${search}%` } // Optional search filter
//         }
//       });

//       const totalPages = Math.ceil(totalRecords / parseInt(limit, 10));
//       const currentPage = parseInt(page, 10);

//       // Step 8: Return the response with the list of combined projects and pagination
//       return res.status(200).json({
//         projects: combinedProjects,
//         totalPages,
//         currentPage,
//         totalRecords,
//       });
//     } else {
//       // If User_type is not 1 or 2, deny access
//       return res.status(403).json({ message: 'Access denied' });
//     }

//   } catch (error) {
//     next(error);
//   }
// }




// async function getAllOrganizationProject(req, res, next) {
//   try {
//     const { page = 1, limit = 100000000000, search = '' } = req.query;
//     const offset = (page - 1);
//     const loginUser = req.user; // Assuming loginUser contains logged-in user information

//     // Step 1: Fetch logged-in user's data
//     const user = await UserModel.findOne({
//       where: { ID: loginUser.ID },
//       attributes: ['ID', 'User_type']
//     });
//     console.log("loginUser",user.User_type)
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     // Step 2: Check the user's User_type
//     if (user.User_type === 1) {
//       // User_type 1: regular user, existing logic to fetch projects
//       if (loginUser.Role === 0) {
//         // Step 1: Fetch the user's organization relations
//         const organizationRelations = await OrganizationUserRelation.findAll({
//           where: { UserID: user.ID, Is_deleted: false },
//           attributes: ['OrganizationID']
//         });

//         if (!organizationRelations.length) {
//           return res.status(404).json({ message: 'No organizations found for this user' });
//         }

//         // Step 2: Get the OrganizationIDs for this user
//         const organizationIds = organizationRelations.map(rel => rel.OrganizationID);

//         // Step 3: Fetch all users associated with these organizations
//         const allOrganizationRelations = await OrganizationModel.findAll({
//           where: {
//             ID: { [Op.in]: organizationIds }, // Match OrganizationIDs
//             Is_deleted: false
//           },
//           attributes: ['UserID', 'ID']
//         });
//         const organizationUserIds = allOrganizationRelations.map(rel => rel.UserID);
//         // Step 4: Fetch projects created by users in the same organizations
//         const organizationProjects = await ProjectModel.findAll({
//           where: {
//             UserID: { [Op.in]: organizationUserIds }, // Match UserIDs from the same organizations
//             Name: { [Op.like]: `%${search}%` } // Optional search filter
//           },
//           attributes: ['ID', 'Name', 'UserID', 'Description', 'Created_at'],
//           order: [['Created_at', 'DESC']],
//           offset,
//           limit: parseInt(limit, 10),
//         });
//         const allUserId = allOrganizationRelations.map(rel => rel.ID);

//         // Step 3: Fetch all UserIDs associated with the OrganizationID
//         const organizationUserRelations = await OrganizationUserRelation.findAll({
//           where: { OrganizationID: allUserId, Is_deleted: false },
//           attributes: ['UserID']
//         });
//         console.log("organizationUserRelations", organizationUserRelations)
//         const allUser = organizationUserRelations.map(rel => rel.UserID);

//         // Step 5: Fetch projects created by the logged-in user
//         const userProjects = await ProjectModel.findAll({
//           where: {
//             UserID: allUser, // Match the logged-in user's ID
//             Name: { [Op.like]: `%${search}%` } // Optional search filter
//           },
//           attributes: ['ID', 'Name', 'UserID', 'Description', 'Created_at'],
//           order: [['Created_at', 'DESC']],
//           offset,
//           limit: parseInt(limit, 10),
//         });

//         // Step 6: Combine the project lists (avoid duplicates)
//         const combinedProjects = [...new Set([...userProjects, ...organizationProjects])];

//         // Step 7: Calculate total count for all projects (ignoring limit and offset for count)
//         const totalRecords = await ProjectModel.count({
//           where: {
//             [Op.or]: [
//               { UserID: { [Op.in]: organizationUserIds } }, // Projects by organization users
//               { UserID: user.ID } // Projects by the logged-in user
//             ],
//             Name: { [Op.like]: `%${search}%` } // Optional search filter
//           }
//         });

//         const totalPages = Math.ceil(combinedProjects / parseInt(limit, 10));
//         const currentPage = parseInt(page, 10);

//         // Step 8: Return the response with combined project list and pagination
//         return res.status(200).json({
//           projects: combinedProjects,
//           totalPages,
//           currentPage,
//           totalRecords,
//         });
//       }
//       else if (loginUser.Role === 3) {
//               // Step 1: Find the organization the user is associated with
//               const userData = await OrganizationUserRelation.findOne({
//                 where: {  UserID: loginUser.ID, Is_deleted: false },
//                 attributes: ['OrganizationID']
//               });
//              const userDataId = userData.OrganizationID
//               const organization = await OrganizationModel.findOne({
//                 where: { ID: userDataId, Is_deleted: false },
//                 attributes: ['UserID']
//               });
//               if (!organization) {
//                 return res.status(404).json({ message: 'No organization found for this user' });
//               }
//               // Step 2: Get the OrganizationID
//               const organizationId = organization.UserID;
        
//               // Step 3: Fetch all UserIDs associated with the OrganizationID
//               const organizationUserRelations = await OrganizationUserRelation.findAll({
//                 where: { OrganizationID: userDataId, Is_deleted: false },
//                 attributes: ['UserID']
//               });
        
//               const organizationUserIds = organizationUserRelations.map(rel => rel.UserID);
        
//               // Step 4: Fetch all projects associated with these UserIDs
//               const organizationProjects = await ProjectModel.findAll({
//                 where: {
//                   UserID: { [Op.in]: organizationUserIds }, // Matching UserIDs from organizations
//                   Name: { [Op.like]: `%${search}%` } // Optional search filter
//                 },
//                 attributes: ['ID', 'Name', 'UserID', 'Description', 'Created_at'],
//                 order: [['Created_at', 'DESC']],
//                 offset,
//                 limit: parseInt(limit, 10),
//               });
        
//               // Step 5: Fetch projects created by the admin organization
//               const userProjects = await ProjectModel.findAll({
//                 where: {
//                   UserID: organizationId, // Match the logged-in user's ID
//                   Name: { [Op.like]: `%${search}%` } // Optional search filter
//                 },
//                 attributes: ['ID', 'Name', 'UserID', 'Description', 'Created_at'],
//                 order: [['Created_at', 'DESC']],
//                 offset,
//                 limit: parseInt(limit, 10),
//               });
        
//               // Step 6: Combine both project lists
//               const combinedProjects = [...organizationProjects, ...userProjects];
        
//               // Step 7: Get total project count for pagination
//               const totalRecords = await ProjectModel.count({
//                 where: {
//                   [Op.or]: [
//                     { UserID: { [Op.in]: organizationUserIds } },
//                     { UserID: user.ID }
//                   ],
//                   Name: { [Op.like]: `%${search}%` } // Optional search filter
//                 }
//               });
        
//               const totalPages = Math.ceil(totalRecords / parseInt(limit, 10));
//               const currentPage = parseInt(page, 10);
        
//               // Step 8: Return the response with the list of combined projects and pagination
//               return res.status(200).json({
//                 projects: combinedProjects,
//                 totalPages,
//                 currentPage,
//                 totalRecords:combinedProjects.length,
//               });
//             } 
//     }
//     else if (user.User_type === 2 || loginUser.Role ===3) {

//       // Step 1: Find the organization the user is associated with
//       const organization = await OrganizationModel.findOne({
//         where: { UserID: user.ID, Is_deleted: false },
//         attributes: ['ID']
//       });
     

//       if (!organization) {
//         return res.status(404).json({ message: 'No organization found for this user' });
//       }

//       // Step 2: Get the OrganizationID
//       const organizationId = organization.ID;

//       // Step 3: Fetch all UserIDs associated with the OrganizationID
//       const organizationUserRelations = await OrganizationUserRelation.findAll({
//         where: { OrganizationID: organizationId, Is_deleted: false },
//         attributes: ['UserID']
//       });

//       const organizationUserIds = organizationUserRelations.map(rel => rel.UserID);

//       // Step 4: Fetch all projects associated with these UserIDs
//       const organizationProjects = await ProjectModel.findAll({
//         where: {
//           UserID: { [Op.in]: organizationUserIds }, // Matching UserIDs from organizations
//           Name: { [Op.like]: `%${search}%` } // Optional search filter
//         },
//         attributes: ['ID', 'Name', 'UserID', 'Description', 'Created_at'],
//         order: [['Created_at', 'DESC']],
//         offset,
//         limit: parseInt(limit, 10),
//       });

//       // Step 5: Fetch projects created by the logged-in user
//       const userProjects = await ProjectModel.findAll({
//         where: {
//           UserID: user.ID, // Match the logged-in user's ID
//           Name: { [Op.like]: `%${search}%` } // Optional search filter
//         },
//         attributes: ['ID', 'Name', 'UserID', 'Description', 'Created_at'],
//         order: [['Created_at', 'DESC']],
//         offset,
//         limit: parseInt(limit, 10),
//       });

//       // Step 6: Combine both project lists
//       const combinedProjects = [...organizationProjects, ...userProjects];

//       // Step 7: Get total project count for pagination
//       const totalRecords = await ProjectModel.count({
//         where: {
//           [Op.or]: [
//             { UserID: { [Op.in]: organizationUserIds } },
//             { UserID: user.ID }
//           ],
//           Name: { [Op.like]: `%${search}%` } // Optional search filter
//         }
//       });

//       const totalPages = Math.ceil(totalRecords / parseInt(limit, 10));
//       const currentPage = parseInt(page, 10);

//       // Step 8: Return the response with the list of combined projects and pagination
//       return res.status(200).json({
//         projects: combinedProjects,
//         totalPages,
//         currentPage,
//         totalRecords,
//       });
//     } 
   
//     else {
//      // Step 1: Find the organization the user is associated with
//      const organization = await OrganizationModel.findOne({
//       where: { UserID: user.ID, Is_deleted: false },
//       attributes: ['ID']
//     });

//     if (!organization) {
//       return res.status(404).json({ message: 'No organization found for this user' });
//     }

//     // Step 2: Get the OrganizationID
//     const organizationId = organization.ID;

//     // Step 3: Fetch all UserIDs associated with the OrganizationID
//     const organizationUserRelations = await OrganizationUserRelation.findAll({
//       where: { OrganizationID: organizationId, Is_deleted: false },
//       attributes: ['UserID']
//     });

//     const organizationUserIds = organizationUserRelations.map(rel => rel.UserID);

//     // Step 4: Fetch all projects associated with these UserIDs
//     const organizationProjects = await ProjectModel.findAll({
//       where: {
//         UserID: { [Op.in]: organizationUserIds }, // Matching UserIDs from organizations
//         Name: { [Op.like]: `%${search}%` } // Optional search filter
//       },
//       attributes: ['ID', 'Name', 'UserID', 'Description', 'Created_at'],
//       order: [['Created_at', 'DESC']],
//       offset,
//       limit: parseInt(limit, 10),
//     });

//     // Step 5: Fetch projects created by the logged-in user
//     const userProjects = await ProjectModel.findAll({
//       where: {
//         UserID: user.ID, // Match the logged-in user's ID
//         Name: { [Op.like]: `%${search}%` } // Optional search filter
//       },
//       attributes: ['ID', 'Name', 'UserID', 'Description', 'Created_at'],
//       order: [['Created_at', 'DESC']],
//       offset,
//       limit: parseInt(limit, 10),
//     });

//     // Step 6: Combine both project lists
//     const combinedProjects = [...organizationProjects, ...userProjects];

//     // Step 7: Get total project count for pagination
//     const totalRecords = await ProjectModel.count({
//       where: {
//         [Op.or]: [
//           { UserID: { [Op.in]: organizationUserIds } },
//           { UserID: user.ID }
//         ],
//         Name: { [Op.like]: `%${search}%` } // Optional search filter
//       }
//     });

//     const totalPages = Math.ceil(totalRecords / parseInt(limit, 10));
//     const currentPage = parseInt(page, 10);

//     // Step 8: Return the response with the list of combined projects and pagination
//     return res.status(200).json({
//       projects: combinedProjects,
//       totalPages,
//       currentPage,
//       totalRecords,
//     });
//     }

//   } catch (error) {
//     next(error);
//   }
// }

async function getAllOrganizationProject(req, res, next) {
  try {
    const { page = 1, limit = 100000000000, search = '' } = req.query;
    const offset = (page - 1) * parseInt(limit, 10);  // Correct pagination offset
    const loginUser = req.user;  // Assuming loginUser contains logged-in user information
    
    // Step 1: Fetch logged-in user's data
    const user = await UserModel.findOne({
      where: { ID: loginUser.ID },
      attributes: ['ID', 'User_type']
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Step 2: Check the user's User_type and Role
    if (user.User_type === 1) {
      // Regular user (User_type 1)
      if (loginUser.Role === 0) {
        // Step 3: Fetch the user's organization relations
        const organizationRelations = await OrganizationUserRelation.findAll({
          where: { UserID: user.ID, Is_deleted: false },
          attributes: ['OrganizationID']
        });

        if (!organizationRelations.length) {
          return res.status(404).json({ message: 'No organizations found for this user' });
        }

        const organizationIds = organizationRelations.map(rel => rel.OrganizationID);

        // Step 4: Fetch all users associated with these organizations
        const allOrganizationRelations = await OrganizationModel.findAll({
          where: {
            ID: { [Op.in]: organizationIds },
            Is_deleted: false
          },
          attributes: ['UserID', 'ID']
        });

        const organizationUserIds = allOrganizationRelations.map(rel => rel.UserID);

        // Step 5: Fetch projects created by users in the same organizations
        const organizationProjects = await ProjectModel.findAll({
          where: {
            UserID: { [Op.in]: organizationUserIds },
            Name: { [Op.like]: `%${search}%` }  // Optional search filter
          },
          attributes: ['ID', 'Name', 'UserID', 'Description', 'Created_at'],
          order: [['Created_at', 'DESC']],
          offset,
          limit: parseInt(limit, 10)
        });

        // Step 6: Fetch projects created by the logged-in user
        const userProjects = await ProjectModel.findAll({
          where: {
            UserID: user.ID,
            Name: { [Op.like]: `%${search}%` }  // Optional search filter
          },
          attributes: ['ID', 'Name', 'UserID', 'Description', 'Created_at'],
          order: [['Created_at', 'DESC']],
          offset,
          limit: parseInt(limit, 10)
        });

        // Step 7: Combine the project lists and remove duplicates by ID
        const combinedProjects = [
          ...new Map([...userProjects, ...organizationProjects].map(item => [item.ID, item])).values()
        ];

        // Step 8: Calculate the total count for pagination (count based on filter applied)
        const totalRecords = await ProjectModel.count({
          where: {
            [Op.or]: [
              { UserID: { [Op.in]: organizationUserIds } },
              { UserID: user.ID }
            ],
            Name: { [Op.like]: `%${search}%` }
          }
        });

        const totalPages = Math.ceil(totalRecords / parseInt(limit, 10));
        const currentPage = parseInt(page, 10);

        // Step 9: Return the response with combined project list and pagination
        return res.status(200).json({
          projects: combinedProjects,
          totalPages,
          currentPage,
          totalRecords
        });
      }
      // For any other role within User_type 1, handle accordingly
    } else if (user.User_type === 2 || loginUser.Role === 3) {
      // Admin or super user (User_type 2 or Role 3)
      
      // Step 1: Fetch the organization associated with the user
      const organization = await OrganizationModel.findOne({
        where: { UserID: user.ID, Is_deleted: false },
        attributes: ['ID']
      });

      if (!organization) {
        return res.status(404).json({ message: 'No organization found for this user' });
      }

      const organizationId = organization.ID;

      // Step 2: Fetch all users associated with this organization
      const organizationUserRelations = await OrganizationUserRelation.findAll({
        where: { OrganizationID: organizationId, Is_deleted: false },
        attributes: ['UserID']
      });

      const organizationUserIds = organizationUserRelations.map(rel => rel.UserID);

      // Step 3: Fetch all projects associated with these UserIDs
      const organizationProjects = await ProjectModel.findAll({
        where: {
          UserID: { [Op.in]: organizationUserIds },
          Name: { [Op.like]: `%${search}%` }
        },
        attributes: ['ID', 'Name', 'UserID', 'Description', 'Created_at'],
        order: [['Created_at', 'DESC']],
        offset,
        limit: parseInt(limit, 10)
      });

      // Step 4: Fetch projects created by the logged-in user (admin/super-user)
      const userProjects = await ProjectModel.findAll({
        where: {
          UserID: user.ID,
          Name: { [Op.like]: `%${search}%` }
        },
        attributes: ['ID', 'Name', 'UserID', 'Description', 'Created_at'],
        order: [['Created_at', 'DESC']],
        offset,
        limit: parseInt(limit, 10)
      });

      // Step 5: Combine both project lists and remove duplicates
      const combinedProjects = [
        ...new Map([...organizationProjects, ...userProjects].map(item => [item.ID, item])).values()
      ];

      // Step 6: Calculate the total count for pagination
      const totalRecords = await ProjectModel.count({
        where: {
          [Op.or]: [
            { UserID: { [Op.in]: organizationUserIds } },
            { UserID: user.ID }
          ],
          Name: { [Op.like]: `%${search}%` }
        }
      });

      const totalPages = Math.ceil(totalRecords / parseInt(limit, 10));
      const currentPage = parseInt(page, 10);

      // Step 7: Return the response with the combined project list and pagination
      return res.status(200).json({
        projects: combinedProjects,
        totalPages,
        currentPage,
        totalRecords
      });
    } else {
      // For all other cases (user.User_type !== 1, 2, or loginUser.Role !== 0 or 3)
      // Step 1: Find the organization the user is associated with
      const organization = await OrganizationModel.findOne({
        where: { UserID: user.ID, Is_deleted: false },
        attributes: ['ID']
      });

      if (!organization) {
        return res.status(404).json({ message: 'No organization found for this user' });
      }

      const organizationId = organization.ID;

      // Step 2: Fetch all users associated with the organization
      const organizationUserRelations = await OrganizationUserRelation.findAll({
        where: { OrganizationID: organizationId, Is_deleted: false },
        attributes: ['UserID']
      });

      const organizationUserIds = organizationUserRelations.map(rel => rel.UserID);

      // Step 3: Fetch all projects associated with these UserIDs
      const organizationProjects = await ProjectModel.findAll({
        where: {
          UserID: { [Op.in]: organizationUserIds },
          Name: { [Op.like]: `%${search}%` }
        },
        attributes: ['ID', 'Name', 'UserID', 'Description', 'Created_at'],
        order: [['Created_at', 'DESC']],
        offset,
        limit: parseInt(limit, 10)
      });

      // Step 4: Fetch projects created by the logged-in user
      const userProjects = await ProjectModel.findAll({
        where: {
          UserID: user.ID,
          Name: { [Op.like]: `%${search}%` }
        },
        attributes: ['ID', 'Name', 'UserID', 'Description', 'Created_at'],
        order: [['Created_at', 'DESC']],
        offset,
        limit: parseInt(limit, 10)
      });

      // Step 5: Combine both project lists and remove duplicates
      const combinedProjects = [
        ...new Map([...organizationProjects, ...userProjects].map(item => [item.ID, item])).values()
      ];

      // Step 6: Calculate the total count for pagination
      const totalRecords = await ProjectModel.count({
        where: {
          [Op.or]: [
            { UserID: { [Op.in]: organizationUserIds } },
            { UserID: user.ID }
          ],
          Name: { [Op.like]: `%${search}%` }
        }
      });

      const totalPages = Math.ceil(totalRecords / parseInt(limit, 10));
      const currentPage = parseInt(page, 10);

      // Step 7: Return the response with the combined project list and pagination
      return res.status(200).json({
        projects: combinedProjects,
        totalPages,
        currentPage,
        totalRecords
      });
    }
  } catch (error) {
    next(error);
  }
}



async function getAllAccessableProject(req, res, next) {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * parseInt(limit, 10);
    const loginUser = req.user; // Assuming loginUser contains logged-in user info

    // Step 1: Fetch logged-in user's data
    const user = await UserModel.findOne({
      where: { ID: loginUser.ID },
      attributes: ['ID', 'User_type'],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Step 2: Check the user's User_type
    let projectIds = [];

    if (user.User_type === 1) {
      // User_type 1: regular user, fetch organization relations and projects
      const organizationRelations = await OrganizationUserRelation.findAll({
        where: { UserID: user.ID, Is_deleted: false },
        attributes: ['UserID'],
      });

      if (!organizationRelations.length) {
        return res.status(404).json({ message: 'No organizations found for this user' });
      }

      // Get the UserIDs from organization relations
      const userIds = organizationRelations.map((rel) => rel.UserID);

      // Fetch shared projects where User_access JSON contains the logged-in user's ID
      const shares = await ShareModel.findAll({
        where: Sequelize.literal(`JSON_CONTAINS(User_access, '{"UserID": ${user.ID}}')`),
        attributes: ['ProjectID'],
      });

      if (!shares.length) {
        return res.status(200).json({ projects: [], totalPages: 0, currentPage: page, totalRecords: 0 });
      }

      // Extract ProjectIDs from shares
      projectIds = shares.map((share) => share.ProjectID);

    } else if (user.User_type === 2) {
      // User_type 2: fetch shared projects based on User_access
      const shares = await ShareModel.findAll({
        where: Sequelize.literal(`JSON_CONTAINS(User_access, '{"UserID": ${user.ID}}')`),
        attributes: ['ProjectID'],
      });

      if (!shares.length) {
        return res.status(200).json({ projects: [], totalPages: 0, currentPage: page, totalRecords: 0 });
      }

      // Extract ProjectIDs from shares
      projectIds = shares.map((share) => share.ProjectID);
    } else {
       // User_type 2: fetch shared projects based on User_access
       const shares = await ShareModel.findAll({
        where: Sequelize.literal(`JSON_CONTAINS(User_access, '{"UserID": ${user.ID}}')`),
        attributes: ['ProjectID'],
      });

      if (!shares.length) {
        return res.status(200).json({ projects: [], totalPages: 0, currentPage: page, totalRecords: 0 });
      }

      // Extract ProjectIDs from shares
      projectIds = shares.map((share) => share.ProjectID);
    }

    // Step 3: Fetch projects where the ProjectID matches those in the Share table
    const projects = await ProjectModel.findAll({
      where: {
        ID: { [Op.in]: projectIds }, // Match ProjectIDs
        Name: { [Op.like]: `%${search}%` }, // Optional search filter by project name
      },
      attributes: ['ID', 'Name', 'UserID', 'Description', 'Created_at'],
      order: [['Created_at', 'DESC']],
      offset,
      limit: parseInt(limit, 10),
    });

    // Step 4: Get total project count for pagination
    const totalRecords = await ProjectModel.count({
      where: {
        ID: { [Op.in]: projectIds },
        Name: { [Op.like]: `%${search}%` }, // Optional search filter
      },
    });

    const totalPages = Math.ceil(totalRecords / parseInt(limit, 10));
    const currentPage = parseInt(page, 10);

    // Step 5: Return the response with the list of projects and pagination
    return res.status(200).json({
      projects,
      totalPages,
      currentPage,
      totalRecords,
    });

  } catch (error) {
    next(error);
  }
}



async function addOrganization(req, res, next) {
  // #swagger.tags = ['Organization']
  // #swagger.description = 'Add organization'
  let {
    First_name,
    Last_name,
    Email,
    Gender,
    Password,
    Phone,
    User_type,
    Organization_name
  } = req.body;

  try {
    Email = Email.toLowerCase();
    let file = "";
    if (req.file) {
      file = `${process.env.PROFILE_IMAGE_ROUTE}${req.file.filename}`;
    }
    const existingUser = await UserModel.findOne({
      where: { Email: Email, Is_deleted: false, User_type: '2' },
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

    // Hash password
    hashedPassword = await bcrypt.hash(Password, 10);
    const userTypeDBValue = commonFunctions.UserRole[User_type];

    // Create new user
    const newUser = {
      First_name,
      Last_name,
      Email,
      Password: hashedPassword,
      Phone,
      Gender,
      Is_otp_verified: true,
      Is_verified: true,
      User_type: userTypeDBValue,
    };

    const user = await UserModel.create(newUser);

    var AccessToken = "";
    // if (Email) {
    //   await sendEmailOTP(Email, otp);
    // }
    const tempAccessToken = jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: "1d",
    });
    AccessToken = tempAccessToken;
    user.AccessToken = tempAccessToken;
    await user.save();

    // Create organization
    const newOrganization = {
      UserID: user.ID,
      Organization_name
    };

    const organization = await OrganizationModel.create(newOrganization);

    const sanitizedUser = sanitizeUser(user);

    return res
      .status(200)
      .json({
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
  delete sanitizedUser.User_type;
  delete sanitizedUser.Otp_expiration_time;
  delete sanitizedUser.AccessToken;
  // delete sanitizedUser.UserRoleID;
  delete sanitizedUser.Created_at;
  delete sanitizedUser.Updated_at;
  return sanitizedUser;
}

module.exports = {
  getAllOrganization,
  addOrganization,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
  getAllOwnProject,
  getAllOrganizationProject,
  getAllAccessableProject

};
