const commonFunctions = require('../utils/commonFunctions');
const UserDetailsModel = require('../models/userDetails');
const AddressModel = require('../models/address');
const UserMediaModel = require('../models/userMedia');
const UserModel = require('../models/user');
const BankAccountDetailsModel = require('../models/bankAccountDetails');
const BusinessDetailsModel = require('../models/businessDetails');
const messages = require('../utils/messages');
const { Op } = require('sequelize');
const Sequelize = require('sequelize');
const fs = require('fs');
const path = require('path');

async function findExistingUser(email, phone) {
    return await UserModel.findOne({
        where: {
            [Op.or]: [
                { Email: email, Is_deleted: false },
                { Phone: phone, Is_deleted: false }
            ]
        }
    });
}

// Add Distributor details
async function addUpdateDistributorDetail(req, res, next) {
    // #swagger.tags = ['Distributor']
    // #swagger.description = 'Add or update distributor details'
    let {
        Email,
        id,
        UPI_id,
        Company_name,
        BusinessType,
        NumberOfEmployees,
        LegalStatus,
        Description,
        Contact_name,
        Contact_email,
        Contact_phone,
        Year_of_establishment,
        Gender,
        Date_of_birth,
        Latitude,
        Longitude,
        GST_number,
        PAN_number,
        Account_holder_name,
        Account_number,
        Bank_name,
        Branch,
        IFSC_code,
        First_name,
        Last_name,
        Phone_number,
        Phone_number_2,
        Address,
        City,
        State,
        PostalCode,
        Country,
        UserMainImage,
        UserMedia,
        MediaIDsToRemove

    } = req.body;

    let user = req.user;
    // const userID = UserID || user.ID;
    let newUser;
    try {
        const userMediaFiles = req.files['UserMedia'];
        const userMainImageFiles = req.files['UserMainImage'];

        if (!id) {
            if (!Email) {
                return res.status(409).json({ message: messages.error.EMAIL_REQUIRED });
            }
            if (!Phone_number) {
                return res.status(409).json({ message: messages.error.PHONE_REQUIRED });
            }
            const existingUser = await findExistingUser(Email, Phone_number);
            if (existingUser) {
                return res.status(409).json({ message: messages.error.DISTRIBUTOR_ALREADY_EXISTS });
            }
            const userRoleID = commonFunctions.UserRole.DISTRIBUTOR;
            const newUser = await UserModel.create({
                Email: Email,
                UserRoleID: userRoleID,
                Phone: Phone_number,
                Name: `${First_name} ${Last_name}`,
                Login_type: commonFunctions.LoginTypeEnum.EMAIL,
                Created_by: user.ID
            });
            // Create AddressModel entry 
            const newAddressDetails = await AddressModel.create({
                UserID: newUser.ID,
                Company_name,
                GST_number,
                First_name: First_name,
                Last_name: Last_name,
                Phone_number: Phone_number,
                Phone_number_2: Phone_number_2,
                Address: Address,
                City: City,
                State: State,
                PostalCode: PostalCode,
                Country: Country,
                Created_by: user.ID
            });
            // Create UserDetailsModel entry
            const userDetails = await UserDetailsModel.create({
                UserID: newUser.ID,
                Company_name,
                UPI_id,
                BusinessType,
                NumberOfEmployees,
                LegalStatus,
                Description,
                Contact_name,
                Contact_email,
                Contact_phone,
                Year_of_establishment,
                Gender,
                Date_of_birth,
                Latitude,
                Longitude,
                DefaultAddressID: newAddressDetails.ID,
                Created_by: user.ID
            });
            if (userMediaFiles) {
                // Create UserMedia entries
                const userMedia = userMediaFiles.map(file => ({
                    UserID: newUser.ID,
                    Media_url: `${process.env.USER_MEDIA_ROUTE}${file.filename}`,
                    Media_type: file.mimetype.includes('image') ? 'image' : 'video',
                    Is_main_media: false,
                    Created_by: user.ID
                }));
                // Save the new UserMedia to the database
                const createUserMedia = await UserMediaModel.bulkCreate(userMedia);
            }
            if (userMainImageFiles) {
                // Create newUsermainImage entry (if applicable) 
                const userMainImage = userMainImageFiles.map(file => ({
                    UserID: newUser.ID,
                    Media_url: `${process.env.USER_MEDIA_ROUTE}${file.filename}`,
                    Media_type: file.mimetype.includes('image') ? 'image' : 'video',
                    Is_main_media: true,
                    Created_by: user.ID
                }));
                // Save the new UsermainImage to the database
                const createUserMainImage = await UserMediaModel.bulkCreate(userMainImage);
            }
            // Create BankAccountDetails entry 
            const newBankAccountDetails = await BankAccountDetailsModel.create({
                UserID: newUser.ID,
                Account_holder_name: Account_holder_name,
                Account_number: Account_number,
                Bank_name: Bank_name,
                Branch: Branch,
                IFSC_code: IFSC_code,
                Created_by: user.ID
            });

            // Create BusinessDetails entry (if applicable)
            const newBusinessDetails = await BusinessDetailsModel.create({
                UserID: newUser.ID,
                GST_number: GST_number,
                PAN_number: PAN_number,
                Created_by: user.ID
            });
            return res.status(200).json({ message: messages.success.DISTRIBUTOR_DETAILS, status: messages.success.STATUS });

        }
        else {
            // Find the existing UserDetailsModel record
            const existingUserDetails = await UserDetailsModel.findByPk(id);
            if (!existingUserDetails) {
                return res.status(404).json({ message: messages.error.DISTRIBUTOR_DETAILS_NOT_FOUND, status: messages.error.STATUS, });
            }

            // Update the fields received in the request for UserDetailsModel
            existingUserDetails.Company_name = Company_name;
            existingUserDetails.UPI_id = UPI_id;
            existingUserDetails.BusinessType = BusinessType;
            existingUserDetails.NumberOfEmployees = NumberOfEmployees;
            existingUserDetails.LegalStatus = LegalStatus;
            existingUserDetails.Description = Description;
            existingUserDetails.Contact_name = Contact_name;
            existingUserDetails.Contact_email = Contact_email;
            existingUserDetails.Contact_phone = Contact_phone;
            existingUserDetails.Year_of_establishment = Year_of_establishment;
            existingUserDetails.Gender = Gender;
            existingUserDetails.Date_of_birth = Date_of_birth;
            existingUserDetails.Latitude = Latitude;
            existingUserDetails.Longitude = Longitude;
            existingUserDetails.Updated_by = user.ID;
            // Check if DefaultAddressID is provided in the request
            if (existingUserDetails.DefaultAddressID) {

                // Update AddressDetails entry
                const existingAddressDetails = await AddressModel.findByPk(existingUserDetails.DefaultAddressID);
                if (existingAddressDetails) {
                    existingAddressDetails.UserID = existingUserDetails.UserID;
                    existingAddressDetails.Company_name = Company_name;
                    existingAddressDetails.GST_number = GST_number;
                    existingAddressDetails.First_name = First_name;
                    existingAddressDetails.Last_name = Last_name;
                    existingAddressDetails.Phone_number = Phone_number;
                    existingAddressDetails.Phone_number_2 = Phone_number_2 || "";
                    existingAddressDetails.Address = Address;
                    existingAddressDetails.City = City;
                    existingAddressDetails.State = State;
                    existingAddressDetails.PostalCode = PostalCode;
                    existingAddressDetails.Country = Country;
                    existingAddressDetails.Updated_by = user.ID;
                    console.log(existingAddressDetails.changed())
                    if (existingAddressDetails.changed()) {
                        await existingAddressDetails.save();
                    }
                }
            } else {
                // Create a new AddressDetails entry
                const newAddressDetails = await AddressModel.create({
                    UserID: existingUserDetails.UserID,
                    Company_name,
                    GST_number,
                    First_name: First_name,
                    Last_name: Last_name,
                    Phone_number: Phone_number,
                    Phone_number_2: Phone_number_2,
                    Address: Address,
                    City: City,
                    State: State,
                    PostalCode: PostalCode,
                    Country: Country,
                    Created_by: user.ID
                });
                // Update DefaultAddressID with the new AddressDetails ID
                existingUserDetails.DefaultAddressID = newAddressDetails.ID;
            }

            // Save the updated UserDetailsModel record
            if (existingUserDetails.changed()) {
                await existingUserDetails.save();
            }

            // Update UserDetails entry
            const existingUser = await UserModel.findOne({
                where: {
                    ID: existingUserDetails.UserID,
                }
            });
            if (existingUser) {
                existingUser.Email = Email;
                existingUser.Name = `${First_name} ${Last_name}`;
                existingUser.Phone = Phone_number;
                existingUser.Updated_by = user.ID;
                if (existingUser.changed()) {
                    await existingUser.save();
                }
            }

            // Update BankAccountDetails entry
            const existingBankAccountDetails = await BankAccountDetailsModel.findOne({
                where: {
                    UserID: existingUserDetails.UserID,
                }
            });

            if (existingBankAccountDetails) {
                existingBankAccountDetails.Account_holder_name = Account_holder_name;
                existingBankAccountDetails.Account_number = Account_number;
                existingBankAccountDetails.Bank_name = Bank_name;
                existingBankAccountDetails.Branch = Branch;
                existingBankAccountDetails.IFSC_code = IFSC_code;
                existingBankAccountDetails.Updated_by = user.ID;
                if (existingBankAccountDetails.changed()) {
                    await existingBankAccountDetails.save();
                }
            }
            // Update BusinessDetails entry
            const existingBusinessDetails = await BusinessDetailsModel.findOne({
                where: {
                    UserID: existingUserDetails.UserID,
                }
            });
            if (existingBusinessDetails) {
                existingBusinessDetails.GST_number = GST_number;
                existingBusinessDetails.PAN_number = PAN_number;
                existingBusinessDetails.Updated_by = user.ID;
                if (existingBusinessDetails.changed()) {
                    await existingBusinessDetails.save();
                }
            }

            // Remove media
            if (MediaIDsToRemove) {
                const parsedMediaIDsToRemove = JSON.parse(MediaIDsToRemove);
                for (const mediaId of parsedMediaIDsToRemove) {
                    await UserMediaModel.destroy({ where: { id: mediaId } });
                }
            }
            if (userMediaFiles) {
                //Add media
                const userMedia = userMediaFiles.map(file => ({
                    UserID: existingUserDetails.UserID,
                    Media_url: `${process.env.USER_MEDIA_ROUTE}${file.filename}`,
                    Media_type: file.mimetype.includes('image') ? 'image' : 'video',
                    Is_main_media: false,
                    Created_by: user.ID
                }));
                // Save the new UserMedia to the database
                await UserMediaModel.bulkCreate(userMedia);
            }
            // Update UserMainImage entries
            if (userMainImageFiles) {
                const userImageData = await UserMediaModel.findOne({ where: { UserID: existingUserDetails.UserID, Is_main_media: true } });
                const updatedMediaUrl = `${process.env.USER_MEDIA_ROUTE}${userMainImageFiles[0].filename}`;

                if (userImageData) {
                    userImageData.Updated_by = user.ID;
                    userImageData.Media_url = updatedMediaUrl;
                    await userImageData.save();
                } else {
                    // If UserMedia doesn't exist, create a new one
                    await UserMediaModel.create({
                        UserID: existingUserDetails.UserID,
                        Media_url: updatedMediaUrl,
                        Media_type: 'image',
                        Is_main_media: true,
                        Created_by: user.ID
                    });
                }
            }

            return res.status(200).json({ message: messages.success.USER_DETAILS_UPDATED, status: messages.success.STATUS });
        }
    } catch (error) {
        return next(error);
    }
}
// getDistributorDetails BY ID
async function getDistributorDetailById(req, res, next) {
    // #swagger.tags = ['Distributor']
    // #swagger.description = 'Get distributor details by ID'
    const { id } = req.params;
    try {

        const userData = await UserModel.findOne({
            where: { ID: id },
            attributes: ['ID', 'Name', 'Email', 'Phone'],
        });

        if (!userData) {
            return res.status(404).json({ message: messages.error.DISTRIBUTOR_DETAILS_NOT_FOUND, status: messages.error.STATUS });
        }

        const userDetails = await UserDetailsModel.findOne({
            where: { UserID: id },
            attributes: { exclude: ['Created_at', 'Created_by', 'Updated_at', 'Updated_by'] }
        });

        const userMedia = await UserMediaModel.findAll({
            where: { UserID: userDetails.UserID },
            attributes: { exclude: ['Created_at', 'Created_by', 'Updated_at', 'Updated_by'] },
            raw: true
        });

        const mainMedia = userMedia.find(media => media.Is_main_media === 1);
        const otherMedias = userMedia.filter(media => media.Is_main_media === 0);

        const formattedMainMedia = mainMedia ? `${process.env.BASE_URL}${mainMedia.Media_url}` : null;

        // Map each other media to include the full URL
        const formattedOtherMedias = otherMedias.map(media => ({
            ID: media.ID,
            Media_url: `${process.env.BASE_URL}${media.Media_url}`,
        }));


        const bankAccountDetails = await BankAccountDetailsModel.findOne({
            where: { UserID: userDetails.UserID },
            attributes: { exclude: ['Created_at', 'Created_by', 'Updated_at', 'Updated_by'] },
            raw: true
        });

        // Retrieve an array of addresses based on DefaultAddressID
        const addressDetailsArray = await AddressModel.findAll({
            where: { UserID: userDetails.UserID, ID: userDetails.DefaultAddressID },
            attributes: ['Address', 'City', 'State', 'PostalCode', 'Country'],
            raw: true
        });

        const businessDetails = await BusinessDetailsModel.findOne({
            where: { UserID: userDetails.UserID },
            attributes: { exclude: ['Created_at', 'Created_by', 'Updated_at', 'Updated_by'] },
            raw: true
        });

        const response = {
            User: userData || null,
            UserDetails: userDetails || null,
            UserMedia: formattedMainMedia || null,
            OtherMedia: formattedOtherMedias || null,
            BankAccountDetails: bankAccountDetails || null,
            AddressDetails: addressDetailsArray || null, // Use the array of addresses
            BusinessDetails: businessDetails || null,
        };

        return res.status(200).json({ data: response, status: messages.success.STATUS });
    } catch (error) {
        return next(error);
    }
}

// getDistributorDetailsWithPagination
async function getDistributorDetailsWithPagination(req, res, next) {
    // #swagger.tags = ['Distributor']
    // #swagger.description = 'Get distributor details with pagination and additional information'
    try {
        const { page = 1, limit, search = '' } = req.query;
        const whereClause = {};
        if (search) {
            whereClause.Name = { [Op.like]: `%${search}%` };
        }

        // Fetch total records count without pagination
        const totalRecordsCount = await UserModel.count({
            where: {
                [Op.and]: [
                    { UserRoleID: commonFunctions.UserRole.DISTRIBUTOR },
                    whereClause, // Include the search condition
                ],
            },
            order: [['ID', 'DESC']],
        });

        // Fetch paginated data
        const userData = await UserModel.findAll({
            attributes: ['ID', 'Name', 'Email', 'Phone', 'UserRoleID'],
            where: {
                [Op.and]: [
                    { UserRoleID: commonFunctions.UserRole.DISTRIBUTOR },
                    whereClause, // Include the search condition
                ],
            },
            raw: true,
            offset: (page - 1) * (limit ? parseInt(limit, 10) : 0),
            limit: limit ? parseInt(limit, 10) : null,
            order: [['ID', 'DESC']],
            raw: true
        });

        const userIds = userData.map(user => user.ID);

        // Fetch data from UserDetails table with pagination
        const userDetailsData = await UserDetailsModel.findAll({
            attributes: { exclude: ['Created_at', 'Created_by', 'Updated_at', 'Updated_by'] },
            where: {
                UserID: userIds,
            },
            raw: true,
        });

        // Fetch UserMedia data for all users
        const userMediaData = await UserMediaModel.findAll({
            attributes: { exclude: ['Created_at', 'Created_by', 'Updated_at', 'Updated_by'] },
            where: {
                UserID: userIds,
                Is_main_media: true
            },
            raw: true
        });

        // Combine data for each user
        const combinedData = userData.map(user => {
            const userDetail = userDetailsData.find(detail => detail.UserID === user.ID);
            const userMedia = userMediaData.find(media => media.UserID === user.ID);

            return {
                UserID: user.ID,
                Name: user.Name,
                Email: user.Email,
                Phone: user.Phone,
                UserDetails: userDetail ? userDetail : null,
                UserMedia: userMedia ? {
                    ID: userMedia.ID,
                    UserID: userMedia.UserID,
                    Media_url: `${process.env.BASE_URL}${userMedia.Media_url}`,
                    Media_type: userMedia.Media_type,
                    Is_main_media: userMedia.Is_main_media
                } : null,
            };
        });

        const totalPages = limit ? Math.ceil(totalRecordsCount / parseInt(limit, 10)) : 1;
        const currentPage = parseInt(page, 10);

        return res.status(200).json({
            data: combinedData,
            totalPages,
            currentPage,
            status: messages.success.STATUS,
            totalRecords: totalRecordsCount
        });
    } catch (error) {
        return next(error);
    }
}

// Delete a AllData by ID
async function deleteDistributorDetail(req, res, next) {
    // #swagger.tags = ['Distributor']
    // #swagger.description = 'Delete distributor details by UserID'
    const { UserID } = req.params;
    try {
        const userMedia = await UserMediaModel.findAll({
            where: { UserID }
        });
        const userDetailsDeleted = await UserDetailsModel.destroy({
            where: { UserID }
        });
        const userMediaDeleted = await UserMediaModel.destroy({
            where: { UserID }
        });
        const bankDetailsDeleted = await BankAccountDetailsModel.destroy({
            where: { UserID }
        });
        const businessDeleted = await BusinessDetailsModel.destroy({
            where: { UserID }
        });

        const addressDeleted = await AddressModel.destroy({
            where: { UserID }
        });

        const userDeleted = await UserModel.destroy({
            where: { ID: UserID }
        });
        for (const media of userMedia) {
            const fileName = path.basename(media.Media_url);
            const outputFilePath = path.join(process.env.USER_MEDIA_PATH, fileName);
            // Delete the media file if it exists
            if (fs.existsSync(outputFilePath)) {
                fs.unlinkSync(outputFilePath);
                console.log("File deleted:", outputFilePath);
            } else {
                console.log("File does not exist:", outputFilePath);
            }
        }
        if (userDetailsDeleted || userMediaDeleted || bankDetailsDeleted || businessDeleted || addressDeleted || userDeleted) {
            return res.status(200).json({ message: messages.success.DISTRIBUTOR_DETAILS_DELETED, status: messages.success.STATUS });
        } else {
            return res.status(404).json({ message: messages.error.DISTRIBUTOR_DETAILS_NOT_FOUND, status: messages.error.STATUS, });
        }
    } catch (error) {
        return next(error);
    }
}

// Add Kyc details
async function updateKycVerification(req, res, next) {
    // #swagger.tags = ['Distributor']
    // #swagger.description = 'Update KYC verification status'
    try {
        let { UserID, Is_kyc_verified } = req.body;
        // Find the UserDetails record by UserID
        const userDetails = await UserDetailsModel.findOne({
            where: {
                UserID: UserID
            }
        });

        if (!userDetails) {
            return res.status(404).json({ message: messages.error.USER_NOT_FOUND, status: messages.error.STATUS });
        }

        // Update the Is_kyc_verified field
        userDetails.Is_kyc_verified = Is_kyc_verified;
        await userDetails.save();

        return res.status(200).json({ message: messages.success.Kyc_DETAILS_UPDATED, status: messages.success.STATUS, });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    addUpdateDistributorDetail,
    getDistributorDetailsWithPagination,
    deleteDistributorDetail,
    getDistributorDetailById,
    updateKycVerification
};
