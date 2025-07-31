
const CartModel = require('../models/cart');
const VariationModel = require('../models/variation');
const ProductModel = require('../models/product');
const ProductMediaModel = require('../models/productMedia');
const messages = require('../utils/messages');
const { Op } = require('sequelize');

// Add Update Cart
async function addUpdateCart(req, res, next) {
  // #swagger.tags = ['Cart']
  // #swagger.description = 'Add or update Cart details'
  let { UserID, ProductID, VariationID, Quantity, id } = req.body;
  Quantity = parseInt(Quantity); // Parse Quantity as an integer
  try {
    let loginUser = req.user;
    if (!id) {
      // Check if the cart already exists for the same product and variation
      const existingCart = await CartModel.findOne({
        where: {
          UserID,
          ProductID,
          VariationID,
        },
      });

      if (existingCart) {
        // Cart already exists, update the quantity
        existingCart.Quantity += Quantity;
        existingCart.Updated_by = loginUser.ID;
        await existingCart.save();
        return res
          .status(200)
          .json({ message: messages.success.Cart_UPDATE, status: messages.success.STATUS });
      } else {
        // Cart doesn't exist, create a new cart
        await CartModel.create({
          UserID,
          ProductID,
          VariationID,
          Quantity,
          Created_by: loginUser.ID,
        });

        return res.status(200).json({ message: messages.success.Cart_CREATED, status: messages.success.STATUS });
      }
    } else {
      // Find the existing Cart record
      const existingCart = await CartModel.findByPk(id);
      if (!existingCart) {
        return res.status(404).json({ message: messages.error.Cart_NOT_FOUND, status: messages.error.STATUS });
      }
      // if (ProductID && ProductID !== existingCart.ProductID) {
      //   console.log("hii")
      //   return res.status(400).json({ message: messages.error.Product_AVAILABILITY, status: messages.error.STATUS });
      // }

      if (VariationID && VariationID !== existingCart.VariationID) {
        return res.status(400).json({ message: messages.error.Variation_MISMATCH, status: messages.error.STATUS });
      }


      if (Quantity > 0) {
        const product = await ProductModel.findByPk(ProductID);
        if (product) {
          if (Quantity <= product.Quantity) {
            console.log("hii2")
            existingCart.Quantity = Quantity;
          } else {
            return res.status(400).json({
              message: messages.error.Product_AVAILABILITY,
              status: messages.error.STATUS,
            });
          }
        }
        else {
          existingCart.Quantity = Quantity;
        }
      } else {
        return res.status(400).json({
          message: messages.error.Invalid_Quantity,
          status: messages.error.STATUS,
        });
      }

      if (UserID) {
        existingCart.UserID = UserID;
      }
      if (ProductID) {
        existingCart.ProductID = ProductID;
      }
      if (VariationID) {
        existingCart.VariationID = VariationID;
      }


      existingCart.Updated_by = loginUser.ID;
      await existingCart.save();
      return res.status(200).json({ message: messages.success.Cart_UPDATE, status: messages.success.STATUS });
    }
  } catch (error) {
    return next(error);
  }
}





// // Delete Cart by ID
async function deleteCart(req, res, next) {
  // #swagger.tags = ['Cart']
  // #swagger.description = 'Delete Cart by id'
  try {
    const cart = await CartModel.findByPk(req.params.id);
    if (cart) {
      await cart.destroy();
      return res.status(200).json({ message: messages.success.Cart_DELETED, status: messages.success.STATUS });
    } else {
      return res.status(404).json({ message: messages.error.Cart_NOT_FOUND, status: messages.error.STATUS });
    }
  } catch (error) {
    return next(error);
  }
}

// get AllDATA
async function getCartWithPagination(req, res, next) {
  // #swagger.tags = ['Cart']
  // #swagger.description = 'Get Cart with pagination'
  try {
    const { page = 1, limit } = req.query;
    const offset = (page - 1) * (limit ? parseInt(limit, 10) : 0);
    const options = {
      attributes: { exclude: ['Created_at', 'Updated_at'] },
      offset: offset,
      order: [['ID', 'DESC']], 
      limit: limit ? parseInt(limit, 10) : null,
      where: { UserID: req.user.ID },
    };
    const { count, rows: cart } = await CartModel.findAndCountAll(options);

    // Iterate through the cart items and fetch additional details
    const cartItems = [];
    for (const item of cart) {
      // Fetch product details based on ProductID
      const product = await ProductModel.findOne({
        attributes: ['Name', 'SKU_number', 'Price', 'Sale_price'],
        where: { ID: item.ProductID },
      });

      if (!product) {
        await CartModel.destroy({ where: { id: item.ID } });
      } else {
        // Fetch variation details based on VariationID
        const variation = await VariationModel.findOne({
          attributes: ['Type', 'Value'],
          where: { ID: item.VariationID },
        });

        // Fetch the main image for the product
        const productMedia = await ProductMediaModel.findOne({
          attributes: ['Media_url'],
          where: {
            ProductID: item.ProductID,
            Is_main_media: true,
          },
        });
        if (productMedia) {
          productMedia.Media_url = `${process.env.BASE_URL}${productMedia.Media_url}`;
        }
        // Create a new item with combined details
        cartItems.push({
          ID: item.ID,
          ProductID: item.ProductID,
          VariationID: item.VariationID,
          Quantity: item.Quantity,
          Product: product,
          Variation: variation,
          ProductMedia: productMedia,
        });
      }

    }

    const totalPages = limit ? Math.ceil(count / parseInt(limit, 10)) : 1;
    const currentPage = parseInt(page, 10);

    return res.status(200).json({
      data: cartItems,
      status: messages.success.STATUS,
      totalPages,
      currentPage,
      totalRecords: count,
    });
  } catch (error) {
    return next(error);
  }
}
// Get user cart item count
async function getCartItemCount(req, res, next) {
  // #swagger.tags = ['Cart']
  // #swagger.description = 'Get Cart with Count'
  try {
    const user = req.user;

    if (!user) {
      return res
        .status(401)
        .json({
          message: messages.success.UNAUTHORIZED,
          status: messages.success.STATUS,
        });
    }

    // Query the database to get the total number of distinct items in the cart for the user
    const totalItemsInCart = await CartModel.count({
      where: { UserID: user.ID },
    });

    return res.status(200).json({
      count: totalItemsInCart,
      status: messages.success.STATUS,
    });
  } catch (error) {
    return next(error);
  }
}


module.exports = {
  addUpdateCart,
  deleteCart,
  getCartWithPagination,
  getCartItemCount,
};