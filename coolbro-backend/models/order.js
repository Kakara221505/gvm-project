


const { Sequelize, DataTypes } = require('sequelize');
const { db } = require('../config');

const env = process.env.NODE_ENV || 'development';
const { database, username, password, host, dialect } = db[env];

const sequelize = new Sequelize(database, username, password, {
  host: host,
  dialect: dialect,
});

const Order = sequelize.define('Order', {
  ID: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  UserID: {
    type: DataTypes.BIGINT,
    references: {
      model: 'User', // Assuming 'User' is the corresponding User model
      key: 'ID'
    }
  },
  DealerID: DataTypes.BIGINT,
  Invoice_number: {
    type: DataTypes.STRING(100), // Make sure it's a string type
    allowNull: false,
    unique: true // You may want to add this constraint to ensure uniqueness
  },
  Order_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  Email: DataTypes.STRING(100),
  BillingAddressID: DataTypes.BIGINT,
  ShippingAddressID: DataTypes.BIGINT,
  Is_delivered: {
    type: DataTypes.BOOLEAN,
    defaultValue: false  // Set default value to false
  },
  Total_amount: DataTypes.DECIMAL(10, 2),
  Sub_total_amount: DataTypes.DECIMAL(10, 2),
  Shipping_charge: DataTypes.DECIMAL(10, 2),
  Discount_amount: DataTypes.DECIMAL(10, 2),
  Delivery_status: {
    type: DataTypes.ENUM('processing', 'shipped', 'delivered', 'cancel'),
    defaultValue: 'processing'  // Set default value to 'processing'
  },
  Payment_status: {
    type: DataTypes.ENUM('pending', 'completed'),
    defaultValue: 'pending'  // Set default value to 'pending'
  },
  Delivered_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  Created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  Updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
}, {
  tableName: 'Order',
  timestamps: false
});

module.exports = Order;