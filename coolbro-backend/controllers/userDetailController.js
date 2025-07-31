const commonFunctions = require('../utils/commonFunctions');
const UserDetailsModel = require('../models/userDetails');
const UserModel = require('../models/user');
const UserMediaModel = require('../models/userMedia');
const AddressModel = require('../models/address');
const messages = require('../utils/messages');
const UserRoleModel = require('../models/userRole');
const { Op } = require('sequelize');

// Update UserDetails
async function updateUserDetail(req, res, next) {
    // #swagger.tags = ['UserDetails']
    // #swagger.description = 'Add or update user details'
    let { UserID, Name, Email, Phone, Gender, Date_of_birth,Date_of_anniversary,Blood_group ,UserMedia } = req.body;

    let loginUser = req.user;
    try {
        const requestUser = await UserModel.findOne({ where: { ID: UserID, Is_deleted: false } });
        if (!requestUser) {
            return res.status(404).json({ message: messages.error.USER_NOT_FOUND, status: messages.error.STATUS });
        }

        // Check if email or phone already exists
        if (Email) {
            const existingUserByEmail = await UserModel.findOne({ where: { Email: Email, Is_deleted: false } });
            if (existingUserByEmail && existingUserByEmail.ID !== requestUser.ID) {
                return res.status(409).json({ message: messages.error.EMAIL_EXISTS, status: messages.error.STATUS, });
            }
        }

        if (Phone) {
            const existingUserByPhone = await UserModel.findOne({ where: { Phone: Phone, Is_deleted: false } });
            if (existingUserByPhone && existingUserByPhone.ID !== requestUser.ID) {
                return res.status(409).json({ message: messages.error.PHONE_EXISTS, status: messages.error.STATUS });
            }
        }

        if (Name) {
            requestUser.Name = Name;
        }
        if (Email) {
            requestUser.Email = Email;
        }
        if (Phone) {
            requestUser.Phone = Phone;
        }
        requestUser.Blood_group = Blood_group;
        requestUser.Date_of_anniversary = Date_of_anniversary;

        requestUser.Updated_by = loginUser.ID;
        await requestUser.save();

        // Save image if present
        let profileImageURL = '';
        if (req.file) {
            profileImageURL = `${process.env.USER_MEDIA_ROUTE}${req.file.filename}`

            const userMedia = await UserMediaModel.findOne({ where: { UserID: UserID, Is_main_media: true } });
            if (userMedia) {
                userMedia.Updated_by = loginUser.ID;
                userMedia.Media_url = profileImageURL;
                await userMedia.save();
            } else {
                // If userMedia doesn't exist, create a new one
                await UserMediaModel.create({
                    UserID: UserID,
                    Media_url: profileImageURL,
                    Media_type: 'image',
                    Is_main_media: true,
                    Created_by: loginUser.ID
                });
            }
        }

        // Find the existing record
        const existingUserDetails = await UserDetailsModel.findOne({ where: { UserID: UserID } });

        if (!existingUserDetails) {
            await UserDetailsModel.create({
                UserID,
                Gender,
                Date_of_birth,
                Date_of_anniversary: typeof Date_of_anniversary !== 'undefined' ? Date_of_anniversary || null : null,
                Blood_group
            });
        } else {
            // Update the fields received in the request
            if (Gender) {
                existingUserDetails.Gender = Gender;
            }
            if (Date_of_birth) {
                existingUserDetails.Date_of_birth = Date_of_birth;
            }
          
            existingUserDetails.Date_of_anniversary = typeof Date_of_anniversary !== 'undefined' ? Date_of_anniversary || null : null;
            
           
                existingUserDetails.Blood_group = Blood_group;
            
            // Save the updated record
            existingUserDetails.Updated_by = loginUser.ID;
            await existingUserDetails.save();
        }

        const responseData = {
            User: {
                ID: requestUser.ID,
                Email: requestUser.Email,
                Name: requestUser.Name,
                Phone: requestUser.Phone,
            },
            UserDetails: {
                ID: existingUserDetails ? existingUserDetails.ID : null,
                Gender: Gender,
                Date_of_birth: Date_of_birth,
                Blood_group:Blood_group,
                Date_of_anniversary:Date_of_anniversary,
                DefaultAddressID: existingUserDetails ? existingUserDetails.DefaultAddressID : null,
                UserID: parseInt(UserID, 10),
            },
            UserMedia: {
                Media_url: `${process.env.BASE_URL}${profileImageURL}`,
                Media_type: 'image',
            }
        };

        return res.status(200).json({ data: responseData, message: messages.success.USER_DETAILS_UPDATED, status: messages.success.STATUS });
    } catch (error) {
        return next(error);
    }
}

// Get user details by userID
async function getUserDetailById(req, res, next) {
    // #swagger.tags = ['UserDetails']
    // #swagger.description = 'Get user details by ID'
    const { UserID } = req.params;
    try {

        const requestUser = await UserModel.findOne({ where: { ID: UserID, Is_deleted: false }, attributes: ['ID', 'Email', 'Name', 'Phone','Country_code'] });
        if (!requestUser) {
            return res.status(404).json({ message: messages.error.USER_NOT_FOUND, status: messages.error.STATUS });
        }

        const userDetails = await UserDetailsModel.findOne({
            where: { UserID: UserID },
            attributes: ['ID', 'Gender', 'Date_of_birth', 'DefaultAddressID', 'UserID','Date_of_anniversary','Blood_group']
        });

        let addressDetailsArray = null;
        let userMedia = null;
        if (userDetails) {
            // Retrieve an array of addresses based on DefaultAddressID
            addressDetailsArray = await AddressModel.findOne({
                where: { UserID: userDetails.UserID, ID: userDetails.DefaultAddressID },
                attributes: ['ID', 'Address', 'City', 'State', 'PostalCode', 'Country'],
                raw: true
            });
            userMedia = await UserMediaModel.findOne({
                where: { UserID: UserID, Is_main_media: true },
                attributes: ['Media_url', 'Media_type'],
                raw: true
            });

            if (userMedia) {
                userMedia.Media_url = `${process.env.BASE_URL}${userMedia.Media_url}`;
            }
        }

        const response = {
            User: requestUser,
            UserDetails: userDetails,
            UserMedia: userMedia,
            AddressDetails: addressDetailsArray
        };

        return res.status(200).json({ data: response, status: messages.success.STATUS });
    } catch (error) {
        return next(error);
    }
}


// Delete a AHMember by ID
async function deleteUserDetail(req, res, next) {
    // #swagger.tags = ['UserDetails']
    // #swagger.description = 'Delete user details by UserID'
    const { UserID } = req.params;
    try {
        const userDetailsDeleted = await UserDetailsModel.destroy({
            where: { UserID }
        });
        const userMediaDeleted = await UserMediaModel.destroy({
            where: { UserID }
        });
        const addressDeleted = await AddressModel.destroy({
            where: { UserID }
        });

        const fileName = path.basename(userMediaDeleted.Media_url);
        const outputFilePath = path.join(process.env.USER_MEDIA_PATH, fileName)
        if (fs.existsSync(outputFilePath)) {
            // Delete the image file
            fs.unlinkSync(outputFilePath);
        }
        if (userDetailsDeleted || userMediaDeleted || addressDeleted) {
            return res.status(200).json({ message: messages.success.USER_DETAILS_DELETED, status: messages.success.STATUS });
        } else {
            return res.status(404).json({ message: messages.error.USER_DETAILS_NOT_FOUND, status: messages.error.STATUS });
        }
    } catch (error) {
        return next(error);
    }
}


//get AllUser
async function getUserDetailsWithPagination(req, res, next) {
    // #swagger.tags = ['UserDetails']
    // #swagger.description = 'Get user list with pagination'
    try {
        const { page = 1, limit, search = '' } = req.query;
        const offset = (page - 1) * (limit ? parseInt(limit, 10) : 0);

        // Use Sequelize's Op.or to search by name or email
        const options = {
            attributes: {
                exclude: ['Password', 'Otp', 'AccessToken', 'Created_at', 'Created_by', 'Updated_at', 'Updated_by', 'Otp_expiration_time', 'Is_paid_user', 'DeviceToken'],
            },
            where: {
                Is_deleted: false,
                [Op.or]: [
                    {
                        Name: {
                            [Op.like]: `%${search}%`,
                        },
                    },
                    {
                        Email: {
                            [Op.like]: `%${search}%`,
                        },
                    },
                ],
            },
            offset: offset,
            limit: limit ? parseInt(limit, 10) : null,
            order: [['ID', 'DESC']],
        };

        const { count, rows: users } = await UserModel.findAndCountAll(options);

        const totalPages = limit ? Math.ceil(count / parseInt(limit, 10)) : 1;
        const currentPage = parseInt(page, 10);


        const formattedUsers = await Promise.all(users.map(async (user) => {
            const [userMedia, userRole, userAddress, userDetails] = await Promise.all([
                UserMediaModel.findOne({
                    attributes: ['Media_url'],
                    where: {
                        UserID: user.ID,
                        Is_main_media: true,
                    },
                }),
                UserRoleModel.findOne({
                    attributes: ['Name'],
                    where: {
                        ID: user.UserRoleID,
                    },
                }),
                AddressModel.findOne({
                    attributes: ['Address', 'City', 'State', 'PostalCode', 'Country'],
                    where: {
                        UserID: user.ID,
                    },
                }),
                UserDetailsModel.findOne({
                    attributes: ['Gender', 'Date_of_birth'],
                    where: {
                        UserID: user.ID,
                    },
                }),
            ]);

            return {
                ID: user.ID,
                Name: user.Name,
                Email: user.Email,
                Phone: `${user.Country_code} ${user.Phone}`,
                Is_otp_verified: user.Is_otp_verified,
                Is_verified: user.Is_verified,
                Login_type: user.Login_type,
                UserRoleID: user.UserRoleID,
                UserRole: userRole ? userRole.Name : null,
                Gender: userDetails ? userDetails.Gender : null,
                Date_of_birth: userDetails ? userDetails.Date_of_birth : null,
                Media_url: userMedia ? `${process.env.BASE_URL}${userMedia.Media_url}` : null,
                Address: userAddress ? userAddress.Address : null,
                City: userAddress ? userAddress.City : null,
                State: userAddress ? userAddress.State : null,
                PostalCode: userAddress ? userAddress.PostalCode : null,
                Country: userAddress ? userAddress.Country : null,
            };
        }));

        return res.status(200).json({ users: formattedUsers, totalPages, currentPage, totalRecords: count });
    } catch (error) {
        return next(error);
    }
}




module.exports = {
    updateUserDetail,
    getUserDetailById,
    deleteUserDetail,
    getUserDetailsWithPagination
};

