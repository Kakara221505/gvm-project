


const { Sequelize, DataTypes } = require('sequelize');
const { db } = require('../config');

const env = process.env.NODE_ENV || 'development';
const { database, username, password, host, dialect } = db[env];

const sequelize = new Sequelize(database, username, password, {
  host: host,
  dialect: dialect,
});

const OrderItem = sequelize.define('OrderItem', {
  ID: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  OrderID: DataTypes.BIGINT,
  ProductID: DataTypes.BIGINT,
  Quantity: DataTypes.INTEGER,
  Color: DataTypes.STRING(50),
  Price: DataTypes.DECIMAL(10, 2),
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
  tableName: 'OrderItem',
  timestamps: false
});

module.exports = OrderItem;