const { Op } = require('sequelize');
const OrderModel = require('../models/order');
const OrderItemModel = require('../models/orderItem');
const PaymentModel = require('../models/payment');
const messages = require('../utils/messages');
const ProductModel = require('../models/product');
const ProductMediaModel = require('../models/productMedia');
const AddressModel = require('../models/address');
const UserDetailsModel = require('../models/userDetails');
const UserModel = require('../models/user');
const CartModel = require('../models/cart');
const sequelize = require('sequelize');


// Function to generate unique OrderNumber
async function generateOrderNumber() {
  // Retrieve the last order number from the database
  const lastOrder = await OrderModel.findOne({
    order: [['Invoice_number', 'DESC']],
    attributes: ['Invoice_number'],
    raw: true
  });

  let orderNumber;

  if (lastOrder && lastOrder.Invoice_number) {
    const lastOrderNumber = lastOrder.Invoice_number;
    const numericPart = parseInt(lastOrderNumber.substr(4)); // Extract the numeric part
    const newNumericPart = numericPart + 1;
    const newNumericPartString = newNumericPart.toString().padStart(6, '0'); // Pad with zeros to make it 6 digits
    orderNumber = `INV-${newNumericPartString}`;
  } else {
    orderNumber = 'INV-000001'; // Initial invoice number
  }

  let isUnique = false;

  while (!isUnique) {
    const existingOrder = await OrderModel.findOne({ where: { Invoice_number: orderNumber } });
    if (!existingOrder) {
      isUnique = true;
    } else {
      const numericPart = parseInt(orderNumber.substr(4)); // Extract the numeric part
      const newNumericPart = numericPart + 1;
      const newNumericPartString = newNumericPart.toString().padStart(6, '0'); // Pad with zeros to make it 6 digits
      orderNumber = `INV-${newNumericPartString}`;
    }
  }

  return orderNumber;
}


// Add Order
async function addOrder(req, res, next) {
  // #swagger.tags = ['Order']
  // #swagger.description = 'Add or update Order details'
  try {
    const { UserID, DealerID, Email, BillingAddressID, ShippingAddressID, Sub_total_amount, Shipping_charge, Discount_amount, orderItems } = req.body;
    // Generate a random invoice number
    let orderNumber = await generateOrderNumber();
    const Invoice_number = orderNumber;
    let totalAmount = Sub_total_amount + Shipping_charge - Discount_amount

    // Check product availability before creating the order
    const unavailableProductsId = [];
    const unavailableProductsName = [];
    for (const item of orderItems) {
      const product = await ProductModel.findByPk(item.ProductID);
      if (item.Quantity > product.Quantity) {
        // Requested quantity is more than available quantity
        unavailableProductsId.push(item.ProductID);
        unavailableProductsName.push(product.Name)

      }
    }
    if (unavailableProductsId.length > 0) {
      return res.status(400).json({
        message: `${unavailableProductsName.join(', ')} is Out of stock`,
        ProductID: `${unavailableProductsId.join(', ')}`,
        status: messages.error.STATUS
      });
    }
    // Create a new order
    const order = await OrderModel.create({
      UserID,
      DealerID,
      Invoice_number,
      Email,
      BillingAddressID,
      ShippingAddressID,
      Sub_total_amount,
      Shipping_charge,
      Discount_amount,
      Total_amount: totalAmount
    });

    // Add order items (assuming orderItems is an array of items in the request)
    if (orderItems && orderItems.length > 0) {
      for (const item of orderItems) {
        await OrderItemModel.create({
          OrderID: order.ID,
          ProductID: item.ProductID,
          Quantity: item.Quantity,
          Color: item.Color,
          Price: item.Price,
        });
      }
    }

    await CartModel.destroy({
      where: { UserID },
    });

    // Return a success response
    return res.status(200).json({ message: messages.success.ORDER_CREATED, status: messages.success.STATUS, OrderID: order.ID });
  } catch (error) {
    return next(error);
  }
}

async function getOrderList(req, res, next) {
  try {
    const user = req.user;
    const userID = user.ID;
    const { Delivery_status } = req.body;
    const condition = {
      UserID: userID,
      ...(Delivery_status && { Delivery_status }),
    };
    const orders = await OrderModel.findAll({
      where: condition,
      order: [
        ['ID', 'DESC'], // Order by Order_date in descending order
      ],
      attributes: [
        'ID',
        'Delivery_status',
        'DealerID',
        [sequelize.fn('DATE', sequelize.col('Order_date')), 'Order_date'],
      ],
    });

    // Map through the orders and fetch associated OrderItems and ProductMedia
    const data = await Promise.all(orders.map(async (order) => {

      // Get the dealer name for the current order
      const dealer = await UserDetailsModel.findOne({
        attributes: ['Company_name'],
        where: {
          ID: order.DealerID, // Filter by DealerID
        },
      });

      // Get the order items for the current order
      const orderItems = await OrderItemModel.findAll({
        attributes: ['Color', 'Quantity', 'ProductID', 'Price'],
        where: {
          OrderID: order.ID, // Filter by OrderID
        },
      });

      // Get the main images for all OrderItems in the current order
      const orderItemData = await Promise.all(orderItems.map(async (orderItem) => {

        // Get the product name for the current order item
        const product = await ProductModel.findOne({
          attributes: ['ID', 'Name', 'SKU_number'],
          where: {
            ID: orderItem.ProductID,
          },
        });

        // Get the main image for the current order item
        const mainMedia = await ProductMediaModel.findOne({
          attributes: ['Media_url'],
          where: {
            ProductID: orderItem.ProductID, // Filter by ProductID
            Is_main_media: true, // Filter by Is_main_media = true
          },
        });

        return {
          ProductID: product ? product.ID : null,
          Color: orderItem.Color,
          Quantity: orderItem.Quantity,
          ProductName: product ? product.Name : null,
          SkuNumber: product ? product.SKU_number : null,
          MainImage: mainMedia ? `${process.env.BASE_URL}${mainMedia.Media_url}` : null,
          Price: orderItem.Price
        };
      }));

      return {
        OrderID: order.ID,
        Delivery_status: order.Delivery_status,
        Order_date: order.Order_date,
        Dealer_name: dealer ? dealer.Company_name : null,
        OrderItems: orderItemData
      };
    })
    );
    return res.status(200).json({ data, status: messages.success.STATUS });
  } catch (error) {
    return next(error);
  }
}


async function getOrderDetails(req, res, next) {
  try {
    const { id } = req.params;

    const order = await OrderModel.findOne({
      where: { ID: id },
      attributes: ['ID', 'Delivery_status', 'DealerID', 'BillingAddressID', 'ShippingAddressID', 'Sub_total_amount', 'Shipping_charge', 'Discount_amount', 'Total_amount', [sequelize.fn('DATE', sequelize.col('Order_date')), 'Order_date']],
    });

    if (!order) {
      return res.status(404).json({ message: messages.error.ORDER_NOT_FOUND, status: messages.error.STATUS });
    }

    const orderItems = await OrderItemModel.findAll({
      where: { OrderID: order.ID },
      attributes: ['Quantity', 'Color', 'ProductID', 'Price'],
    });

    const orderItemsWithDetails = await Promise.all(
      orderItems.map(async (orderItem) => {
        const mainMedia = await ProductMediaModel.findOne({
          attributes: ['Media_url'],
          where: { ProductID: orderItem.ProductID, Is_main_media: true },
        });

        const product = await ProductModel.findOne({
          attributes: ['Name', 'SKU_number'],
          where: { ID: orderItem.ProductID },
        });

        return {
          Quantity: orderItem.Quantity,
          Color: orderItem.Color,
          Price: orderItem.Price,
          ProductImage: mainMedia ? `${process.env.BASE_URL}${mainMedia.Media_url}` : null,
          ProductName: product ? product.Name : null,
          SkuNumber: product ? product.SKU_number : null,
        };
      })
    );

    const dealer = await UserDetailsModel.findOne({
      where: { ID: order.DealerID },
      attributes: ['Company_name', 'Contact_phone', 'DefaultAddressID'],
    });

    let dealerAddress = null;
    if (dealer && dealer.DefaultAddressID) {
      const dealerAddressModel = await AddressModel.findOne({
        where: { ID: dealer.DefaultAddressID },
        attributes: ['Address', 'City', 'State', 'PostalCode', 'Country'],
      });
      dealerAddress = dealerAddressModel ? dealerAddressModel.get() : null;
    }

    const billingAddress = await AddressModel.findOne({
      where: { ID: order.BillingAddressID },
      attributes: ['Company_name', 'GST_number', 'First_name', 'Last_name', 'Phone_number', 'Phone_number_2', 'Address', 'City', 'State', 'PostalCode', 'Country'],
    });

    const shippingAddress = await AddressModel.findOne({
      where: { ID: order.ShippingAddressID },
      attributes: ['First_name', 'Last_name', 'Phone_number', 'Address', 'City', 'State', 'PostalCode', 'Country'],
    });

    const response = {
      OrderID: order.ID,
      Delivery_status: order.Delivery_status,
      Sub_total_amount: order.Sub_total_amount,
      Discount_amount: order.Discount_amount,
      Shipping_charge: order.Shipping_charge,
      Total_amount: order.Total_amount,
      Order_date: order.Order_date,
      DealerDetails: {
        Company_name: dealer ? dealer.Company_name : null,
        Contact_phone: dealer ? dealer.Contact_phone : null,
        Address: dealerAddress || null,
      },
      BillingAddress: billingAddress ? billingAddress.get() : null,
      ShippingAddress: shippingAddress ? shippingAddress.get() : null,
      OrderItems: orderItemsWithDetails,
    };

    return res.status(200).json({ data: response, status: messages.success.STATUS });
  } catch (error) {
    return next(error);
  }
}


// Get All order list
async function getOrderDetailsWithPagination(req, res, next) {
  // #swagger.tags = ['Order']
  // #swagger.description = 'Get Order details with pagination'
  try {
    const { page = 1, limit, search = '', deliveryStatus, paymentStatus } = req.query;
    const offset = (page - 1) * (limit ? parseInt(limit, 10) : 0);
    const whereClause = {};
    if (search) {
      whereClause.Name = { [Op.like]: `%${search}%` };
    }
    if (deliveryStatus) {
      whereClause.Delivery_status = deliveryStatus;
    }

    if (paymentStatus) {
      whereClause.Payment_status = paymentStatus;
    }
    const { count, rows: orderData } = await OrderModel.findAndCountAll({
      attributes: ['ID', 'UserID', 'Invoice_number', 'Order_date', 'Is_delivered', 'Total_amount', 'Delivery_status', 'Payment_status', 'Delivered_at'],
      offset,
      limit: limit ? parseInt(limit, 10) : null,
      where: whereClause,
      order: [['ID', 'DESC']],
      raw: true
    });

    // Extract all unique User IDs from the orders
    const userIds = orderData.map(order => order.UserID);
    const uniqueUserIds = [...new Set(userIds)];

    // Fetch all user details in a single query
    const users = await UserModel.findAll({
      where: {
        ID: { [Op.in]: uniqueUserIds }
      },
      attributes: ['ID', 'Name', 'Email'],
      raw: true
    });

    const orderDetails = orderData.map(async order => {

      const user = users.find(u => u.ID === order.UserID);

      const orderData = {
        ...order,
        UserName: user ? user.Name : null,
        Email: user ? user.Email : null
      };
      return orderData;
    });

    const totalPages = limit ? Math.ceil(count / parseInt(limit, 10)) : 1;
    const currentPage = parseInt(page, 10);

    return res.status(200).json({
      data: await Promise.all(orderDetails), // Wait for all product details to be fetched
      totalPages,
      status: messages.success.STATUS,
      currentPage,
      totalRecords: count
    });
  } catch (error) {
    return next(error);
  }
}





module.exports = {
  addOrder,
  getOrderList,
  getOrderDetails,
  getOrderDetailsWithPagination
};