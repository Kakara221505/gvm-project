const commonFunctions = require('../utils/commonFunctions');
const fs = require('fs');
const path = require('path');
const ShareModel = require('../models/Share');
const OrganizationUserRealtionModelModel = require('../models/OrganizationUserRelation');
const UserModel = require('../models/user');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const messages = require('../utils/messages');
const nodemailer = require('nodemailer');
const Organization = require('../models/organization');
const ProjectModel = require('../models/Project');
// AddUpdate Share

async function addUpdateShare(req, res, next) {
    // #swagger.tags = ['Share']
    // #swagger.description = 'Add or update Share details'
    const { UserID, ProjectID, User_access } = req.body;

    try {
        // Check if a share record already exists for the ProjectID
        let existingShare = await ShareModel.findOne({ where: { ProjectID } });

        if (existingShare) {
            // Update the existing share record with new User_access
            existingShare.User_access = User_access;
            await existingShare.save();
            await sendShareEmails(User_access, ProjectID, existingShare);
            return res.status(200).json({ message: messages.success.SHARE_UPDATED, status: messages.success.STATUS });
        } else {
            // Create a new share record
            const newShare = await ShareModel.create({
                UserID,
                ProjectID,
                User_access
            });

            // Send emails to users with the project link and access type
            await sendShareEmails(User_access, ProjectID, newShare);
            return res.status(200).json({ message: messages.success.SHARE_CREATED, status: messages.success.STATUS });
        }
    } catch (error) {
        return next(error);
    }
}


async function addShare(req, res, next) {
    // #swagger.tags = ['Share']
    // #swagger.description = 'Add or update Share details'
    const { UserID, ProjectID, User_access } = req.body;

    try {
        // Check if a share record already exists for the ProjectID
        let existingShare = await ShareModel.findOne({ where: { ProjectID } });

        if (existingShare) {
            // Append new User_access entries without removing existing ones
            let updatedUserAccess = [...existingShare.User_access];

            User_access.forEach(newUserAccess => {
                const userExists = updatedUserAccess.some(userAccess => userAccess.UserID === newUserAccess.UserID);

                // if (!userExists) {
                //     // Add new user access
                //     updatedUserAccess.push(newUserAccess);
                // }
            });

            // Update the existing share record with new User_access
            existingShare.User_access = updatedUserAccess;
            console.log("Updated User_access:", updatedUserAccess);

            await existingShare.save({ fields: ['User_access'] });

            await sendShareEmails(User_access, ProjectID, existingShare);
            return res.status(200).json({ message: messages.success.SHARE_UPDATED, status: messages.success.STATUS });
        } else {
            // Create a new share record
            const newShare = await ShareModel.create({
                UserID,
                ProjectID,
                User_access
            });

            // Send emails to users with the project link and access type
            await sendShareEmails(User_access, ProjectID, newShare);
            return res.status(200).json({ message: messages.success.SHARE_CREATED, status: messages.success.STATUS });
        }
    } catch (error) {
        return next(error);
    }
}



async function sendShareEmails(User_access, ProjectID, shareRecord) {
    const projectLinkBase = 'https://livesite.gvmtechnologies.com/editor/';
    let updatedUserAccess = [...User_access];

    for (const user of User_access) {
        const { UserID, Type, Is_Email, message } = user;

        if (Is_Email) {
            // Find the user by ID to get their email
            const userRecord = await UserModel.findByPk(UserID);

            if (userRecord && userRecord.Email) {
                // Construct the project link
                const projectLink = `${projectLinkBase}${ProjectID}`;

                // Set up the email message with the project link and access type
                const mailOptions = {
                    from: process.env.FROM_MAIL, // Replace with your own email address
                    to: userRecord.Email,
                    subject: 'Project Access Invitation',
                    html: `<p>Hi ${userRecord.First_name},</p>
                           <p>You have been granted <strong>${Type}</strong> access to the project.</p>
                            <p>${message}</p>
                           <p>Access the project using the following link: <a href="${projectLink}">${projectLink}</a></p>
                           <p>Best regards,</p>
                           <p>LiveSite Team</p>`
                };

                // Create a Nodemailer transporter object
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.GMAIL_ID, // Replace with your own Gmail address
                        pass: process.env.GMAIL_PASSWORD // Replace with your own Gmail password
                    }
                });

                // Send the email message
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log(`Error sending email to ${userRecord.Email}: `, error);
                    } else {
                        console.log(`Email sent to ${userRecord.Email}: `, info.response);
                    }
                });

                // Update the Is_Email flag to false
                updatedUserAccess = updatedUserAccess.map(ua =>
                    ua.UserID === UserID ? { ...ua, Is_Email: false } : ua
                );
            }
        }
    }

    // Update the User_access field in the database
    shareRecord.User_access = updatedUserAccess;
    await shareRecord.save();
}




async function getShareAllDataWithPagination(req, res, next) {
    // #swagger.tags = ['Share']
    // #swagger.description = 'Get Share with pagination'
    const { page = 1, limit = 10, ProjectID } = req.query;

    try {
        // Define the query options
        let queryOptions = {
            attributes: ['ID', 'UserID', 'ProjectID', 'User_access'],
            offset: (page - 1) * limit,
            limit: parseInt(limit, 10),
        };

        // Add where clause if ProjectID is provided
        if (ProjectID) {
            queryOptions.where = { ProjectID };
        }

        // Fetch share data with pagination
        const { count, rows } = await ShareModel.findAndCountAll(queryOptions);

        // Map through the rows to modify the response structure
        const shares = await Promise.all(rows.map(async (share) => {
            // Filter out the 'remove' type users and map remaining data
            const userAccess = await Promise.all(share.User_access
                .filter(access => access.Type !== 'remove')
                .map(async (access) => {
                    // Fetch user details
                    const userRecord = await UserModel.findByPk(access.UserID);
                    return {
                        UserID: access.UserID,
                        Type: access.Type,
                        Email: userRecord?.Email || '',
                        Name: `${userRecord?.First_name || ''} ${userRecord?.Last_name || ''}`,
                        Is_Email: access.Is_Email,
                        Organization_name: access.Organization_name || ''
                    };
                })
            );

            // Fetch owner details
            const owner = await UserModel.findByPk(share.UserID);
            return {
                OwnerID: share.UserID,
                OwnerEmail: owner?.Email || '',
                OwnerName: `${owner?.First_name || ''} ${owner?.Last_name || ''}`,
                ProjectID: share.ProjectID,
                User_access: userAccess,
                SharedCount: userAccess.length,
            };
        }));

        // Send response with shares data and pagination info
        return res.json({
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page, 10),
            shares,
        });
    } catch (error) {
        return next(error);
    }
}



 async function getShareAllData(req, res, next) {
    const { ProjectID, OrganizationIDs } = req.body;

    try {
        // Ensure ProjectID is provided
        if (!ProjectID) {
            return res.status(400).json({ message: 'ProjectID is required.' });
        }

        // Fetch share data for the given ProjectID
        const shares = await ShareModel.findAll({
            where: { ProjectID },
            attributes: ['User_access', 'UserID'],
        });

        // Initialize a set to collect unique user IDs
        const userIDs = new Set();

        // Iterate over shares to extract users with access under the given organizations
        shares.forEach(share => {
            share.User_access.forEach(access => {
                // If OrganizationIDs is provided and not empty, filter by it
                console.log("nmbdsj", userIDs.add(access.UserID))
                userIDs.add(access.UserID);
                if (OrganizationIDs.length > 0) {
                    if (OrganizationIDs.includes(access.UserID)) {
                        userIDs.add(access.UserID);
                    }
                } else {
                    // If OrganizationIDs is empty, include all users
                    userIDs.add(access.UserID);
                }
            });
        });

        // Fetch user details for the collected user IDs
        const users = await UserModel.findAll({
            where: {
                ID: Array.from(userIDs),
                Is_deleted: false, // Assuming you want only active users
                User_type: 1,
            },
            attributes: ['ID', 'First_name', 'Last_name', 'Email'],
        });

        // Prepare the response with user details
        const userAccessList = users.map(user => ({
            UserID: user.ID,
            Name: `${user.First_name || ''} ${user.Last_name || ''}`,
            Email: user.Email,
        }));

        // Send the response
        return res.json({
            ProjectID,
            Organizations: OrganizationIDs,
            UsersWithAccess: userAccessList,
        });

    } catch (error) {
        return next(error);
    }
}

// async function getShareAllData(req, res, next) {
//     const { ProjectID, OrganizationIDs } = req.body;

//     try {
//         // Ensure ProjectID is provided
//         if (!ProjectID) {
//             return res.status(400).json({ message: 'ProjectID is required.' });
//         }

//         // Step 1: Fetch Users based on OrganizationIDs if provided, else fetch all users with User_type 1
//         let validUserIDs = [];
        
//         if (OrganizationIDs && OrganizationIDs.length > 0) {
//             const organizationUsers = await OrganizationUserRealtionModelModel.findAll({
//                 where: {
//                     OrganizationID: OrganizationIDs,
//                     Is_deleted: false, // Exclude deleted relations
//                 },
//                 attributes: ['UserID'],
//             });

//             validUserIDs = organizationUsers.map(user => user.UserID);
//         } else {
//             const users = await UserModel.findAll({
//                 where: {
//                     User_type: 1,
//                     Is_deleted: false,
//                 },
//                 attributes: ['ID'],
//             });

//             validUserIDs = users.map(user => user.ID);
//         }

//         console.log("validUserIDs", validUserIDs);

//         // Step 2: Fetch share data for the given ProjectID
//         const shares = await ShareModel.findAll({
//             where: { ProjectID },
//             attributes: ['User_access', 'UserID'],
//         });

//         // Initialize a set to collect unique user IDs
//         const userIDs = new Set();

//         // Step 3: Iterate over shares to extract users with access under the given organizations or criteria
//         shares.forEach(share => {
//             share.User_access.forEach(access => {
//                 // Check if the user is within the validUserIDs
//                 if (validUserIDs.includes(access.UserID)) {
//                     userIDs.add(access.UserID);
//                 }
//             });
//         });

//         console.log("userIDs", userIDs);

//         // Step 4: Fetch user details for the collected user IDs
//         const users = await UserModel.findAll({
//             where: {
//                 ID: Array.from(userIDs),
//                 Is_deleted: false, // Assuming you want only active users
//                 User_type: 1,
//             },
//             attributes: ['ID', 'First_name', 'Last_name', 'Email'],
//         });

//         // Prepare the response with user details
//         const userAccessList = users.map(user => ({
//             UserID: user.ID,
//             Name: `${user.First_name || ''} ${user.Last_name || ''}`,
//             Email: user.Email,
//         }));

//         // Send the response
//         return res.json({
//             ProjectID,
//             Organizations: OrganizationIDs,
//             UsersWithAccess: userAccessList,
//         });

//     } catch (error) {
//         return next(error);
//     }
// }




async function getOranizationAllData(req, res, next) {
    const { page = 1, limit = 10, ProjectID } = req.query;

    try {
        let loginUser = req.user; // Get logged-in user information
        console.log(loginUser);

        // Step 1: Retrieve shares that match the given ProjectID
        const shares = await ShareModel.findAll({
            where: { ProjectID },
            attributes: ['User_access'],
        });

        // Step 2: Extract organization IDs from the User_access JSON array
        const organizationIds = new Set();
        shares.forEach(share => {
            share.User_access.forEach(access => {
                organizationIds.add(access.UserID); // Add UserID to the set
            });
        });

        // Convert Set to Array and implement pagination
        const orgIdsArray = Array.from(organizationIds).slice((page - 1) * limit, page * limit);

        // Step 3: Fetch organization details (ID, First_name, Last_name)
        const organizations = await UserModel.findAll({
            where: {
                ID: orgIdsArray,
                User_type: 2,
                Is_deleted: false, // Assuming you want only active organizations
            },
            attributes: ['ID', 'First_name', 'Last_name'],
        });

        // Step 4: Prepare organization data for response
        let organizationData = organizations.map(org => ({
            OrganizationID: org.ID,
            OrganizationName: `${org.First_name} ${org.Last_name}`,
        }));

        // Step 5: Add logged-in user's organization to the result if not already included
        const loggedInUserOrganization = {
            OrganizationID: loginUser.ID,
            OrganizationName: `${loginUser.First_name} ${loginUser.Last_name}`,
        };

        // Check if logged-in user's organization is already in the list
        const isUserOrgAlreadyIncluded = organizationData.some(
            org => org.OrganizationID === loginUser.ID
        );

        // Add logged-in user's organization if not already included
        if (!isUserOrgAlreadyIncluded) {
            organizationData.unshift(loggedInUserOrganization);
        }

        // Step 6: Send response with organization data and pagination info
        return res.json({
            totalItems: organizationIds.size + (isUserOrgAlreadyIncluded ? 0 : 1),
            totalPages: Math.ceil((organizationIds.size + (isUserOrgAlreadyIncluded ? 0 : 1)) / limit),
            currentPage: parseInt(page, 10),
            organizations: organizationData,
        });
    } catch (error) {
        return next(error);
    }
}



async function getUserType(req, res, next) {
    // #swagger.tags = ['Share']
    // #swagger.description = 'Get User Type with pagination'
    const { UserID, ProjectID } = req.body;

    try {
        // Validate if the UserID exists in the User table
        const userExists = await UserModel.findOne({
            where: { ID: UserID },
            attributes: ["ID"], // Fetch only ID for validation
        });

        if (!userExists) {
            return res.status(404).json({ message: "User not found." });
        }

        // Fetch the requested user by UserID, excluding sensitive fields
        const requestUser = await UserModel.findByPk(UserID, {
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
                    model: OrganizationUserRealtionModelModel,
                    as: "OrganizationUserRelation",
                    attributes: ["Role", "Is_approved"], // Fetch Role and Is_approved from OrganizationUserRelation
                    where: { Is_deleted: false },
                    required: false, // Allow join even if there's no organization relation
                },
            ],
        });

        // Convert Sequelize instance to plain object
        let userData = requestUser.toJSON();

        // Set default values for Role and Is_approved
        userData.Role = null;
        userData.Is_approved = null;
        let organizationID = null;

        // Determine OrganizationID
        if (userData.User_type === 2) {
            // For organizations (UserType = 2), use the User ID as OrganizationID
            organizationID = userData.ID;
        } else if (userData.User_type === 1 && requestUser.OrganizationUserRelation) {
            // For users (UserType = 1), get OrganizationID from OrganizationUserRelation
            const relation = await OrganizationUserRealtionModelModel.findOne({
                where: {
                    UserID: userData.ID,
                    Is_deleted: false,
                },
                attributes: ["OrganizationID"],
            });

            if (relation) {
                // Match the OrganizationID in Organization table to get the corresponding UserID
                const organization = await Organization.findByPk(relation.OrganizationID, {
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

        // Fetch the Share entry with the given ProjectID
        const shareEntry = await ShareModel.findOne({
            where: { ProjectID },
            attributes: ['User_access'],
        });

       // Check if the project is created by the logged-in user
       const projectOwner = await ProjectModel.findOne({
        where: { ID: ProjectID },
        attributes: ["UserID"], // Fetch the owner ID
    });

    if (projectOwner && projectOwner.UserID === UserID) {
        // If the logged-in user is the project owner, set Type as 'Owner'
        userData.Type = "Owner";
    } else {
        // Parse the User_access JSON field and find the matching UserID
        const userAccess = shareEntry ? shareEntry.User_access || [] : [];
        const userEntry = userAccess.find((access) => access.UserID === UserID);

        // If UserID is found, return the associated Type, otherwise set Type to null
        const type = userEntry ? userEntry.Type : null;

        // Add Type to the user response
        userData.Type = type;
    }

        // Remove the OrganizationUserRelation field from the response
        delete userData.OrganizationUserRelation;

        // Return the modified user data
        return res.status(200).json({ user: userData });
    } catch (error) {
        return next(error);
    }
}











module.exports = {
    getShareAllData,
    addUpdateShare,
    getShareAllDataWithPagination,
    addShare,
    getOranizationAllData,
    getUserType
};
