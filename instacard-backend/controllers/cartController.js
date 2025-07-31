const Cart = require("../models/Cart");
const ProductMedia = require("../models/ProductMedia");
const messages = require("../utils/messages");
const mongoose = require("mongoose");
const path = require("path");
async function addToCart(req, res, next) {
  try {
    const user_id = req.user.id; // Extract user_id from authenticated user
    const { product_id, seller_id, variation_id, quantity } = req.body;

    // Check if the item already exists in the cart
    const existingItem = await Cart.findOne({
      user_id,
      product_id,
      variation_id,
    });

    if (existingItem) {
      existingItem.quantity += quantity; // Update quantity if the item already exists
      await existingItem.save();
      return res
        .status(200)
        .json({
          status:messages.success.STATUS,
          message: messages.success.CART_ITEM_ADDED,
          data: existingItem,
        });
    }

    // If item does not exist, create a new cart entry
    const cartItem = new Cart({
      user_id,
      product_id,
      seller_id,
      variation_id,
      quantity,
    });
    await cartItem.save();

    res
      .status(200)
      .json({status:messages.success.STATUS, message: messages.success.CART_ITEM_ADDED, data: cartItem });
  } catch (error) {
    // res.status(500).json({ message: error.message });
    next(error); // Pass error to Express error handler
  }
}

async function removeFromCart(req, res, next) {
  try {
    const user_id = req.user.id; // Extract user ID from authenticated user
    const { id } = req.params; // Get cart item ID from request

    // Find and delete the cart item by its ObjectId and user_id
    const result = await Cart.findOneAndDelete({ _id: id, user_id });

    if (!result) {
      return res.status(200).json({
        status: messages.success.STATUS,
        message: messages.error.NOT_FOUND_CART
      });
    }

    res.status(200).json({
      status: messages.success.STATUS,
      message: messages.success.CART_ITEM_REMOVED
    });
  } catch (error) {
    next(error); // Pass error to Express error handler
  }
}

async function getCart(req, res, next) {
  try {
    const user_id = req.user.id; // Extract user ID from authenticated user
    const search = req.query.search?.trim(); // Get search query if provided

    // Pagination parameters
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
    const skip = (page - 1) * limit;

    // Define search filter
    let productFilter = {};
    if (search) {
      productFilter.Name = { $regex: search, $options: "i" }; // Case-insensitive search
    }

    // Fetch total count for pagination
    const totalItems = await Cart.countDocuments({ user_id });
    const totalPages = Math.ceil(totalItems / limit);

    // Fetch paginated cart items
    const cartItems = await Cart.find({ user_id })
      .populate({
        path: "product_id",
        model: "Product",
        match: productFilter, // Apply search filter
      })
      .populate({
        path: "variation_id",
        model: "Variation",
      })
      .populate({
        path: "seller_id",
        model: "User",
        select: "Email Name",
      })
      .skip(skip) // Skip records for pagination
      .limit(limit); // Limit the number of records per page

    // Remove entries where product_id is null (filtered out by match)
    const filteredCart = cartItems.filter((item) => item.product_id);

    if (!filteredCart.length) {
      return res.status(200).json({
        status: messages.success.STATUS,
        message: messages.error.NOT_FOUND_CART,
        data: [],
       
          currentPage: page,
          totalPages,
          totalRecords: totalItems,
         
      });
    }

    // Construct base URL for images
    const BASE_URL = process.env.BASE_URL;
    const MEDIA_ROUTE = process.env.PRODUCT_MEDIA_ROUTE;

    // Function to convert Decimal128 to float
    const convertDecimal128 = (value) =>
      value instanceof mongoose.Types.Decimal128 ? parseFloat(value.toString()) : value;

    // Fetch only product media URLs and format them
    const cartItemsWithImages = await Promise.all(
      filteredCart.map(async (cartItem) => {
        const productImages = await ProductMedia.find(
          { ProductID: cartItem.product_id._id },
          "Media_url" // Fetch only Media_url field
        );

        return {
          _id: cartItem._id,
          user_id: cartItem.user_id,
          product_id: {
            ...cartItem.product_id.toObject(),
            Price: convertDecimal128(cartItem.product_id.Price),
            Sale_price: convertDecimal128(cartItem.product_id.Sale_price),
            Min_price: convertDecimal128(cartItem.product_id.Min_price),
            Max_price: convertDecimal128(cartItem.product_id.Max_price),
          },
          variation_id: cartItem.variation_id ? cartItem.variation_id.toObject() : null,
          seller_id: cartItem.seller_id
            ? {
                _id: cartItem.seller_id._id,
                Name: cartItem.seller_id.Name,
                Email: cartItem.seller_id.Email,
              }
            : null,
          timestamp: cartItem.timestamp,
          product_images: productImages.map(
            (img) => `${BASE_URL}${MEDIA_ROUTE}${path.basename(img.Media_url)}`
          ),
        };
      })
    );

    res.status(200).json({
      status: messages.success.STATUS,
      message: messages.success.CART_FETCHED,
      data: cartItemsWithImages,
        currentPage: page,
        totalPages,
        totalRecords:totalItems,
      
   
    });
  } catch (error) {
    next(error);
  }
}




module.exports = {
  addToCart,
  removeFromCart,
  getCart,
};
