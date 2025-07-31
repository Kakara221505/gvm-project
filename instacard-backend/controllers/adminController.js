const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require("bcrypt");
const messages = require('../utils/messages');
const sendEmail = require("../utils/email");
const generatePassword = require("../utils/generatePassword");
const UserModel = require('../models/User'); 
const UserMedia = require('../models/UserMedia');
const Address = require('../models/Address');
const Bank = require('../models/Bank');
const Product = require('../models/Product');
const Order = require('../models/Order');
const CMS = require('../models/cms'); 


const getVendorsWithStats = async (req, res, next) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const vendorRoleId = '67c00ebaebeb15ebb6b60374';

    const query = {
      UserRoleID: vendorRoleId,
      Is_deleted: false,
      $or: [
        { Name: { $regex: search, $options: 'i' } },
        { Email: { $regex: search, $options: 'i' } }
      ]
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [vendors, totalVendors] = await Promise.all([
      UserModel.find(query)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('UserRoleID', 'Name')
        .select('-Password -Otp -AccessToken')
        .lean(),
      UserModel.countDocuments(query)
    ]);

    const vendorIds = vendors.map(v => v._id);

    const [productCounts, deliveredCounts, returnedCounts] = await Promise.all([
      Product.aggregate([
        { $match: { seller_id: { $in: vendorIds } } },
        { $group: { _id: "$seller_id", count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: { sellerId: { $in: vendorIds }, Delivery_status: "Delivered" } },
        { $group: { _id: "$sellerId", count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: { sellerId: { $in: vendorIds }, isCancelled: true } },
        { $group: { _id: "$sellerId", count: { $sum: 1 } } }
      ])
    ]);

    const productMap = Object.fromEntries(productCounts.map(p => [p._id.toString(), p.count]));
    const deliveredMap = Object.fromEntries(deliveredCounts.map(d => [d._id.toString(), d.count]));
    const returnMap = Object.fromEntries(returnedCounts.map(r => [r._id.toString(), r.count]));

    const formattedVendors = vendors.map(vendor => {
      const id = vendor._id.toString();
      return {
        ...vendor,
        totalProducts: productMap[id] || 0,
        totalDelivered: deliveredMap[id] || 0,
        totalReturned: returnMap[id] || 0
      };
    });

    res.status(200).json({
      status: true,
      message: 'Vendor list fetched successfully',
      data: formattedVendors,
      totalRecords: totalVendors,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(totalVendors / limit)
    });
  } catch (error) {
    return next(error);
  }
};




// CREATE CMS Entry
async function createCMS(req, res,next) {
  try {
    const {
      homeContent,
      exploreByCategory,
      offerSection,
      superSaveBanner,
      mobileAccessoriesBanner,
      offer,
      offerExploreByCategory
    } = req.body;

    const newCMS = new CMS({
      homeContent: JSON.parse(homeContent || '[]'),
      exploreByCategory: JSON.parse(exploreByCategory || '[]'),
      offerSection: JSON.parse(offerSection || '[]'),
      superSaveBanner: JSON.parse(superSaveBanner || '[]'),
      mobileAccessoriesBanner: JSON.parse(mobileAccessoriesBanner || '[]'),
      offer: JSON.parse(offer || '[]'),
      offerExploreByCategory: JSON.parse(offerExploreByCategory || '[]')
    });

    await newCMS.save();

    res.status(200).json({
      status: messages.success.STATUS,
      message: 'CMS content created successfully',
      data: newCMS
    });
  } catch (error) {
    return next(error);
}
}

async function uploadCMSImage (req, res,next)  {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file uploaded'
        });
      }
  
      const imageUrl = `${process.env.BASE_URL}${process.env.BANNER_MEDIA_PATH}${req.file.filename}`;
  
      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        imageUrl: imageUrl
      });
    } catch (error) {
      return next(error);
  }
  };


  // Use your actual role IDs here
const USER_ROLE_ID = '67c00ebaebeb15ebb6b60373';
const VENDOR_ROLE_ID = '67c00ebaebeb15ebb6b60374';

async function getAdminDashboardStats  (req, res,next)  {
  try {
    // Total products
    const totalProducts = await Product.countDocuments();

    // Total orders
    const totalOrders = await UserModel.countDocuments();

    // Total users (excluding vendors)
    const totalUsers = await UserModel.countDocuments({ UserRoleID: USER_ROLE_ID });

    // Total vendors
    const totalVendors = await UserModel.countDocuments({ UserRoleID: VENDOR_ROLE_ID });
// Total revenue (admin takes 1% commission on each order)
const orders = await Order.find({}, 'totalAmount');
const totalRevenue = orders.reduce((sum, order) => {
  return sum + (order.totalAmount || 0) * 0.01; // 1% commission
}, 0);
    // Recent 5 orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'Name Email')
      .populate('productId', 'Name Price')
      .select('orderId invoiceNumber totalAmount orderDate Payment_status Delivery_status');

    return res.status(200).json({
     status: messages.success.STATUS,
      data: {
        totalProducts,
        totalOrders,
        totalUsers,
        totalVendors,
        recentOrders,
        totalRevenue: totalRevenue.toFixed(2)
      }
    });
  } catch (error) {
    return next(error);
}
};

async function addUser (req, res, next)  {
  try {
    const { Email, Name, Phone, Country_code } = req.body;

    if (!Email || !Name ) {
      return res.status(400).json({ message: "Email, Name, and UserRoleID are required." });
    }

    const existingUser = await UserModel.findOne({ Email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists." });
    }

    const rawPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const newUser = new UserModel({
      Email,
      Name,
      Phone,
      Country_code,
      UserRoleID:"67c00ebaebeb15ebb6b60373",
      Is_verified: true,
      Password: hashedPassword,
    });

    await newUser.save();

    await sendEmail(
      Email,
      "Welcome to Our Platform",
      `Hello ${Name},\n\nYour account has been created.\nYour temporary password is: ${rawPassword}\n\nPlease change your password after login.`
    );

    res.status(200).json({status: messages.success.STATUS, message: "User created and password sent via email." });
  } catch (error) {
    return next(error);
}
};

async function createUserWithDetails  (req, res,next)  {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, email, phone, address, bank, mediaType, isMainMedia } = req.body;
    const file = req.file; // From multer

    const password = generatePassword(); // Your custom function

    // 1. Create User
    const user = new UserModel({
      Name: name,
      Email: email,
      Phone: phone,
      Password: password,
      UserRoleID: "67c00ebaebeb15ebb6b60374"
    });

    await user.save({ session });

    // 2. Create Address
    const addressEntry = new Address({
      ...address,
      userId: user._id
    });

    await addressEntry.save({ session });

    // 3. Create Bank
    const bankEntry = new Bank({
      ...bank,
      userID: user._id
    });

    await bankEntry.save({ session });

    // 4. Optionally store image (UserMedia)
    if (file) {
      const userMedia = new UserMedia({
        UserID: user._id,
        Media_url: `${process.env.USER_MEDIA_ROUTE}${req.file.filename}`, 
        Media_type: mediaType || 'image',
        Is_main_media: isMainMedia === 'true' || false
      });

      await userMedia.save({ session });
    }

    // 5. Send email with password
    await sendEmail(email, 'Your Account Password', `Your password is: ${password}`);

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      status: messages.success.STATUS,
      message: 'User, address, bank,media created successfully.',
    
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    return next(error);
  }
};
module.exports = {
    getVendorsWithStats,
    createCMS,
    uploadCMSImage,
    getAdminDashboardStats,
    addUser,
    createUserWithDetails
    };