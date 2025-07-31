const Coupon = require("../models/Coupon");
const messages = require("../utils/messages");
// Create Coupon
async function createCoupon(req, res, next) {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res
      .status(200)
      .json({
        status: messages.success.STATUS,
        message: messages.success.COUPON_CREATED,
        data: coupon,
      });
  } catch (error) {
    next(error);
  }
}

// Get All Coupons
async function getAllCoupons(req, res, next) {
  try {
    const { title, discountAmount } = req.query; // Get query parameters

    // Build query object
    const query = {};

    if (title) {
      query.title = { $regex: title, $options: 'i' }; // Case-insensitive search for title
    }

    if (discountAmount) {
      query.discountAmount = discountAmount; // Exact match for discountAmount
    }

    // Find coupons based on the query
    const coupons = await Coupon.find(query);

    res.status(200).json({
      status: messages.success.STATUS,
      message: messages.success.COUPON_FETCHED,
      data: coupons,
    });
  } catch (error) {
    next(error);
  }
}


// Get Coupon by ID
async function getCouponById(req, res, next) {
  try {
    const couponId = req.params.id;
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res
        .status(404)
        .json({
          status: messages.error.STATUS,
          message: messages.success.COUPON_NOT_FOUND,
        });
    }
    res
      .status(200)
      .json({
        status: messages.success.STATUS,
        message: messages.success.COUPON_FETCHED,
        data: coupon,
      });
  } catch (error) {
    next(error);
  }
}

// Update Coupon (Only Provided Fields)
async function updateCoupon(req, res, next) {
  try {
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updatedCoupon) {
      return res
        .status(404)
        .json({
          status: messages.error.STATUS,
          message: messages.success.COUPON_NOT_FOUND,
        });
    }
    res
      .status(200)
      .json({
        status: messages.success.STATUS,
        message: messages.success.COUPON_UPDATED,
        data: updatedCoupon,
      });
  } catch (error) {
    next(error);
  }
}

// Delete Coupon
async function deleteCoupon(req, res, next) {
  try {
    const deletedCoupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!deletedCoupon) {
      return res
        .status(404)
        .json({
          status: messages.error.STATUS,
          message: messages.success.COUPON_NOT_FOUND,
        });
    }
    res
      .status(200)
      .json({
        status: messages.success.STATUS,
        message: messages.success.COUPON_DELETED,
      });
  } catch (error) {
    next(error);
  }
}
// Apply Coupon
// async function applyCoupon(req, res, next) {
//   try {
//     const { code, orderAmount } = req.body;
//     const coupon = await Coupon.findOne({ code, status: "active" });

//     if (!coupon) {
//       return res
//         .status(400)
//         .json({
//           status: messages.error.STATUS,
//           message: messages.error.COUPON_INVALID,
//         });
//     }

//     if (coupon.expires_at && new Date() > coupon.expires_at) {
//       return res
//         .status(400)
//         .json({
//           status: messages.error.STATUS,
//           message: messages.error.COUPON_EXPIRED,
//         });
//     }

//     if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
//       return res
//         .status(400)
//         .json({
//           status: messages.error.STATUS,
//           message: `${messages.error.COUPON_MINIMUM_AMOUNT} ${coupon.minOrderAmount}`,
//         });
//     }

//     let discountAmount = coupon.amount
//       ? coupon.amount
//       : orderAmount * (coupon.discount / 100);
//     if (coupon.maxDiscount) {
//       discountAmount = Math.min(discountAmount, coupon.maxDiscount);
//     }

//     res
//       .status(200)
//       .json({
//         status: messages.success.STATUS,
//         discount: discountAmount,
//         finalAmount: orderAmount - discountAmount,
//       });
//   } catch (error) {
//     next(error);
//   }
// }

async function applyCoupon(req, res, next) {
  try {
    const { code, orderAmount } = req.body;  // Coupon code and the order amount

    // Step 1: Find the coupon based on the code and ensure it is active
    const coupon = await Coupon.findOne({ code, status: "active" });

    if (!coupon) {
      return res
        .status(400)
        .json({
          status: messages.error.STATUS,
          message: messages.error.COUPON_INVALID,
        });
    }

    // Step 2: Check if the coupon has expired
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return res
        .status(400)
        .json({
          status: messages.error.STATUS,
          message: messages.error.COUPON_EXPIRED,
        });
    }

    // Step 3: Check if the coupon requires a minimum order amount
    if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
      return res
        .status(400)
        .json({
          status: messages.error.STATUS,
          message: `${messages.error.COUPON_MINIMUM_AMOUNT} ${coupon.minOrderAmount}`,
        });
    }

    // Step 4: Calculate discount amount based on coupon details
    let discountAmount = 0;

    // Case 1: If coupon has a specific discount amount
    if (coupon.discountAmount) {
      discountAmount = coupon.discountAmount;
    }
    // Case 2: If coupon has a percentage-based discount (assuming there's a percentage field)
    else if (coupon.discount) {
      discountAmount = orderAmount * (coupon.discount / 100);
    }

    // Step 5: Apply maximum discount limit if it exists
    if (coupon.saveAmount) {
      discountAmount = Math.min(discountAmount, coupon.saveAmount);
    }

    // Step 6: Final calculations
    const finalAmount = orderAmount - discountAmount;

    // Step 7: Return the discount and final amount
    res.status(200).json({
      status: messages.success.STATUS,
      discount: discountAmount,
      finalAmount: finalAmount < 0 ? 0 : finalAmount,  // Prevent negative final amount
    });
  } catch (error) {
    next(error);
  }
}


async function activeCoupon(req, res, next) {
  try {
      // Fetch active coupons and sort by the latest creation date
      const activeCoupons = await Coupon.find({ status: "active" })
          .sort({ createdAt: -1 }); // Sorting by latest first

      if (!activeCoupons || activeCoupons.length === 0) {
          return res.status(404).json({
              success: false,
              message: 'No active coupons found.',
          });
      }

      res.status(200).json({
          success: true,
          coupons: activeCoupons,
      });
  } catch (error) {
      console.error("Error fetching active coupons:", error); // Add more detailed logging
      return next(error); // Passes error to Express error handler
  }
}


module.exports = {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
  activeCoupon
};
