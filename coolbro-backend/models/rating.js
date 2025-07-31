const { Sequelize, DataTypes } = require('sequelize');
const { db } = require('../config');
const User = require('./user');
const env = process.env.NODE_ENV || 'development';
const { database, username, password, host, dialect } = db[env];

const sequelize = new Sequelize(database, username, password, {
  host: host,
  dialect: dialect,
});

const Rating = sequelize.define('Rating ', {
  ID: {
    type: DataTypes.BIGINT,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  UserID: DataTypes.BIGINT,
  Rated_item_id: DataTypes.BIGINT,
  Rated_item_type: DataTypes.ENUM('product', 'delivery_person', 'order', 'dealer', 'distributor'),
  Rating: DataTypes.ENUM('1', '2', '3', '4', '5'),
  Name:DataTypes.TEXT,
  IsAnonymous: DataTypes.BOOLEAN,
  Review: DataTypes.TEXT,
  Created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  Created_by: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  Updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  Updated_by: {
    type: DataTypes.BIGINT,
    allowNull: true
  }
}, {
  tableName: 'Rating',
  timestamps: false
});


module.exports = Rating;
