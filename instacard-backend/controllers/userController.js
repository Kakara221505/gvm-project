const mongoose = require("mongoose");
const UserModel = require("../models/User");
const UserRoleModel = require("../models/UserRole");
const UserMediaModel = require("../models/UserMedia");
const messages = require("../utils/messages");
const Address = require('../models/Address'); 
// Get all users
async function getUsers(req, res, next) {
    try {
        const { page = 1, limit, search = '', userRole } = req.query;
        const pageNumber = parseInt(page, 10);
        const pageSize = limit ? parseInt(limit, 10) : 10;
        const skip = (pageNumber - 1) * pageSize;

        // Validate Role
        if (userRole && !["Admin", "User", "Vendor"].includes(userRole)) {
            return res.status(400).json({ message: messages.error.INVALID_ROLE });
        }

        // Build filter conditions
        const filter = { Is_deleted: false, Is_verified: true };

        if (search) {
            filter.Email = { $regex: search, $options: "i" };
        }

        // If userRole is provided, find the matching role ID from UserRole table
        if (userRole) {
            const userRoleRecord = await UserRoleModel.findOne({ Name: userRole }).lean();
            if (!userRoleRecord) {
                return res.status(400).json({ message: messages.error.INVALID_ROLE });
            }
            filter.UserRoleID = userRoleRecord._id; // Apply correct filtering by ID
        }

        // Fetch users based on the updated filter
        const users = await UserModel.find(filter)
            .populate("UserRoleID", "Name") // Populate UserRoleID with Role Name
            .select("-Password -Otp -AccessToken -Created_at -Updated_at")
            .sort({ _id: -1 })
            .skip(skip)
            .limit(pageSize);

        // Fetch user media for all users
        const userIds = users.map(user => user._id);
        const userMediaRecords = await UserMediaModel.find({ UserID: { $in: userIds }, Is_main_media: true })
            .select("UserID Media_url");

        // Create a mapping of UserID to Media_url
        const userMediaMap = {};
        userMediaRecords.forEach(media => {
            userMediaMap[media.UserID] = media.Media_url;
        });

        // Format response to include Role Name and User Media URL
        const formattedUsers = users.map(user => ({
            _id: user._id,
            UserRoleID: user.UserRoleID._id,
            Role: user.UserRoleID.Name,
            Email: user.Email,
            Name: user.Name,
            Country_code: user.Country_code,
            Phone: user.Phone,
            Is_paid_user: user.Is_paid_user,
            Is_verified: user.Is_verified,
            Login_type: user.Login_type,
            Is_deleted: user.Is_deleted,
                Media_url: userMediaMap[user._id] ? `${process.env.BASE_URL}${userMediaMap[user._id]}` : null,
                Media_type: "image"
        }));

        // Count total records
        const count = await UserModel.countDocuments(filter);
        const totalPages = limit ? Math.ceil(count / pageSize) : 1;

        return res.status(200).json({ users: formattedUsers, totalPages, currentPage: pageNumber, totalRecords: count });
    } catch (error) {
        return next(error);
    }
}



async function getUserById(req, res, next) {
    try {
        const userId = req.user.id;

        // Fetch user details, excluding sensitive fields, and populating UserRole
        const requestUser = await UserModel.findOne({ 
            _id: userId, 
            Is_deleted: false, 
            Is_verified: true
        })
        .populate("UserRoleID", "Name") // Fetch role name
        .select("-Password -Otp -AccessToken -Created_at -Updated_at");

        if (!requestUser) {
            return res.status(404).json({ message: messages.error.USER_NOT_FOUND });
        }

        // Fetch user media
        const userMedia = await UserMediaModel.findOne({ UserID: userId, Is_main_media: true })
            .select("Media_url");

        // Fetch user addresses
        const userAddresses = await Address.find({ userId }).select("-createdAt -updatedAt -__v");

        // Format response
        const sanitizedUser = {
            _id: requestUser._id,
            UserRoleID: requestUser.UserRoleID._id,
            Role: requestUser.UserRoleID.Name, 
            Email: requestUser.Email,
            Name: requestUser.Name,
            Country_code: requestUser.Country_code,
            Phone: requestUser.Phone,
            Is_paid_user: requestUser.Is_paid_user,
            Is_verified: requestUser.Is_verified,
            Login_type: requestUser.Login_type,
            Is_deleted: requestUser.Is_deleted,
            UserMedia: {
                Media_url: userMedia ? `${process.env.BASE_URL}${userMedia.Media_url}` : null,
                Media_type: "image"
            },
            Addresses: userAddresses // Include user addresses
        };

        return res.status(200).json({ 
            status: messages.success.STATUS, 
            message: messages.success.USER_FETCHED, 
            data: sanitizedUser 
        });

    } catch (error) {
        return next(error);
    }
}

async function deleteUser(req, res, next) {
    // #swagger.tags = ['Employee']
    // #swagger.description = 'To delete Employee by ID'
    try {
      const { userId } = req.params; // Get the employeeId from the request params
  
      // Find the employee and update Is_deleted to true
      const employee = await UserModel.findByIdAndUpdate(
        userId,
        { Is_deleted: true }, // Soft delete by setting Is_deleted to true
        { new: true } // Return the updated document
      );
      if (!employee) {
        return res
          .status(404)
          .json({ message: messages.error.USER_NOT_FOUND });
      }
  
      return res.status(200).json({ message: messages.success.USER_DELETED });
    } catch (error) {
      console.error("Error deleting employee:", error);
      return next(error);
    }
  }

  async function updateUser(req, res, next) {
      // #swagger.tags = ['UserDetails']
      // #swagger.description = 'Update user details'
    //   console.log("data")
      let { UserID, Name, Email, Phone, Country_code, Is_verified, Login_type, DeviceToken , nick_name, company_name, GST_number, first_name, last_name, phone_number, 
        phone_number_2, address, city, state, postal_code, country, isDefault} = req.body;
      let loginUser = req.user;
     
  
      try {
          // Find the user by ID and ensure it's not deleted
          const requestUser = await UserModel.findOne({ _id: UserID, Is_deleted: false });
  
          if (!requestUser) {
              return res.status(404).json({ message: messages.error.USER_NOT_FOUND, status: messages.error.STATUS });
          }
  
          // Check if email or phone already exists for another user
          if (Email) {
              const existingUserByEmail = await UserModel.findOne({ Email, Is_deleted: false, _id: { $ne: UserID } });
              if (existingUserByEmail) {
                  return res.status(409).json({ message: messages.error.EMAIL_EXISTS, status: messages.error.STATUS });
              }
          }
  
          if (Phone) {
              const existingUserByPhone = await UserModel.findOne({ Phone, Is_deleted: false, _id: { $ne: UserID } });
              if (existingUserByPhone) {
                  return res.status(409).json({ message: messages.error.PHONE_EXISTS, status: messages.error.STATUS });
              }
          }
  
          // Update user fields that exist in the schema
          if (Name) requestUser.Name = Name;
          if (Email) requestUser.Email = Email;
          if (Phone) requestUser.Phone = Phone;
          if (Country_code) requestUser.Country_code = Country_code;
          if (Is_verified !== undefined) requestUser.Is_verified = Is_verified;
          if (Login_type) requestUser.Login_type = Login_type;
          if (DeviceToken) requestUser.DeviceToken = DeviceToken;

          await requestUser.save();
     // Handle Address Update or Creation
      // Find the existing address for the user
      let existingAddress = await Address.findOne({ userId: UserID });

      if (existingAddress) {
          // Update only provided fields
          if (nick_name) existingAddress.nick_name = nick_name;
          if (company_name) existingAddress.company_name = company_name;
          if (GST_number) existingAddress.GST_number = GST_number;
          if (first_name) existingAddress.first_name = first_name;
          if (last_name) existingAddress.last_name = last_name;
          if (phone_number) existingAddress.phone_number = phone_number;
          if (phone_number_2) existingAddress.phone_number_2 = phone_number_2;
          if (address) existingAddress.address = address;
          if (city) existingAddress.city = city;
          if (state) existingAddress.state = state;
          if (postal_code) existingAddress.postal_code = postal_code;
          if (country) existingAddress.country = country;
          if (isDefault !== undefined) existingAddress.isDefault = isDefault;

          await existingAddress.save();
      }
          // Handle Profile Image Upload
          let profileImageURL = "";
          if (req.file) {
              profileImageURL = `${process.env.USER_MEDIA_ROUTE}${req.file.filename}`;
  
              const userMedia = await UserMediaModel.findOne({ UserID, Is_main_media: true });
  
              if (userMedia) {
                  userMedia.Media_url = profileImageURL;
                  await userMedia.save();
              } else {
                  // Create new media entry
                  await UserMediaModel.create({
                      UserID,
                      Media_url: profileImageURL,
                      Media_type: "image",
                      Is_main_media: true,
                  });
              }
          }
  
          // Response Data
          const responseData = {
              User: {
                  ID: requestUser._id,
                  Email: requestUser.Email,
                  Name: requestUser.Name,
                  Phone: requestUser.Phone,
                  Country_code: requestUser.Country_code,
                  Is_verified: requestUser.Is_verified,
                  Login_type: requestUser.Login_type,
                  DeviceToken: requestUser.DeviceToken,
              },
              UserMedia: {
                  Media_url: profileImageURL ? `${process.env.BASE_URL}${profileImageURL}` : null,
                  Media_type: "image",
              },
              Address: existingAddress || "No Address Updated",
          };
  
          return res.status(200).json({ data: responseData, message: messages.success.USER_UPDATED, status: messages.success.STATUS });
      } catch (error) {
          return next(error);
      }
  }
  
  const getUsersForAdminDashboard = async (req, res,next) => {
    try {
      const { search = '', page = 1, limit = 10 } = req.query;
      const userRoleId = '67c00ebaebeb15ebb6b60373'; // Normal user role ID
//   console.log("userRoleId", userRoleId)
      const query = {
        UserRoleID: userRoleId,
        Is_deleted: false,
        $or: [
          { Name: { $regex: search, $options: 'i' } },
          { Email: { $regex: search, $options: 'i' } }
        ]
      };

      const skip = (parseInt(page) - 1) * parseInt(limit);
  
      const [users, totalUsers, activeUsers, inactiveUsers] = await Promise.all([
        UserModel.find(query)
          .skip(skip)
          .limit(parseInt(limit))
          .populate('UserRoleID', 'Name') // This will replace UserRoleID with { _id, Role }
          .select('-Password -Otp -AccessToken -DeviceToken'),
          UserModel.countDocuments({ UserRoleID: userRoleId, Is_deleted: false }),  
          UserModel.countDocuments({ UserRoleID: userRoleId, Is_deleted: false, Is_verified: true }),
          UserModel.countDocuments({ UserRoleID: userRoleId, Is_deleted: false, Is_verified: false }),
      ]);
  
      const formattedUsers = users.map(user => {
        return {
          ...user.toObject(),
          Role: user.UserRoleID?.Name ,
          UserRoleID: user.UserRoleID?._id || null,
        };
      });
  
      res.status(200).json({
        status: messages.success.STATUS, 
        data: formattedUsers,
        totalUsers,
        activeUsers,
        inactiveUsers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalUsers / limit),
        }
      });
    } catch (error) {
        return next(error);
    }
}


module.exports = 
{ 
    getUsers,
    getUserById,
    deleteUser,
    updateUser,
    getUsersForAdminDashboard

};
