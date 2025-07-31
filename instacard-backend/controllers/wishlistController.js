const Wishlist = require("../models/WishList");
const ProductMedia = require("../models/ProductMedia");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const messages = require("../utils/messages");
const path = require("path");
dotenv.config();

BASE_URL = process.env.BASE_URL;
PRODUCT_MEDIA_ROUTE = process.env.PRODUCT_MEDIA_ROUTE;
async function addToWishlist(req, res, next) {
  try {
    const user_id = req.user.id; 
    const { product_id, seller_id } = req.body;
    // Check if the item already exists in the wishlist
    const existingItem = await Wishlist.findOne({ user_id, product_id });

    if (existingItem) {
      return res
        .status(200)
        .json({ message: messages.success.ITEM_ALREADY_IN_WISHLIST, data: existingItem });
    }

    // Add new item to wishlist
    const wishlistItem = new Wishlist({ user_id, product_id, seller_id });
    await wishlistItem.save();

    res
      .status(200)
      .json({status:messages.success.STATUS, message: messages.success.WISHLIST_ITEM_ADDED, data: wishlistItem });
  } catch (error) {
    // res.status(500).json({ message: error.message });
    next(error); // Pass error to Express error handler
  }
}

async function removeFromWishlist(req, res, next) {
  try {
    const user_id = req.user.id; // Get user ID from token
    const { id } = req.params; // Wishlist item ID

    // Find and delete the wishlist item by its ObjectId and user_id
    const result = await Wishlist.findOneAndDelete({ _id: id, user_id });

    if (!result) {
      return res.status(404).json({
        status: messages.error.STATUS,
        message: messages.error.NO_ITEM_FOUND
      });
    }

    res.status(200).json({
      status: messages.success.STATUS,
      message: messages.success.WISHLIST_ITEM_REMOVED
    });
  } catch (error) {
    next(error); // Pass error to Express error handler
  }
}

async function getWishlist(req, res, next) {
  try {
    const user_id = req.user.id;
    const search = req.query.search?.trim();

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let productFilter = {};
    if (search) {
      productFilter.Name = { $regex: search, $options: "i" };
    }

    // Count total records for pagination
    const totalRecords = await Wishlist.countDocuments({ user_id });
    const totalPages = Math.ceil(totalRecords / limit);

    const wishlistItems = await Wishlist.find({ user_id })
      .populate({
        path: "product_id",
        model: "Product",
        match: productFilter,
      })
      .populate({
        path: "seller_id",
        model: "User",
        select: "Name Email",
      })
      .skip(skip)
      .limit(limit);

    const filteredWishlist = wishlistItems.filter((item) => item.product_id);

    if (!filteredWishlist.length) {
      return res.status(200).json({
        status: messages.success.STATUS,
        message: messages.error.NO_ITEM_FOUND,
        data: [],
      
          totalPages,
          currentPage: page,
          totalRecords,
        
      });
    }

    const updatedWishlist = await Promise.all(
      filteredWishlist.map(async (item) => {
        const productImages = await ProductMedia.find({
          ProductID: item.product_id._id,
        });

        const convertDecimal128 = (value) =>
          value instanceof mongoose.Types.Decimal128 ? parseFloat(value.toString()) : value;

        return {
          _id: item._id,
          user_id: item.user_id,
          product_id: {
            ...item.product_id.toObject(),
            Price: convertDecimal128(item.product_id.Price),
            Sale_price: convertDecimal128(item.product_id.Sale_price),
            Min_price: convertDecimal128(item.product_id.Min_price),
            Max_price: convertDecimal128(item.product_id.Max_price),
          },
          seller_id: item.seller_id
            ? { _id: item.seller_id._id, Name: item.seller_id.Name, Email: item.seller_id.Email }
            : null,
          timestamp: item.timestamp,
          product_images: productImages.map((img) => `${BASE_URL}${PRODUCT_MEDIA_ROUTE}${path.basename(img.Media_url)}`),
        };
      })
    );

    res.status(200).json({
      status: messages.success.STATUS,
      message: messages.success.WISHLIST_FETCHED,
      data: updatedWishlist,
      
        totalPages,
        currentPage: page,
        totalRecords,
    
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
};
