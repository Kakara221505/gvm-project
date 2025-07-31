const { Sequelize, DataTypes } = require('sequelize');
const { db } = require('../config');

const env = process.env.NODE_ENV || 'development';
const { database, username, password, host, dialect } = db[env];

const sequelize = new Sequelize(database, username, password, {
  host: host,
  dialect: dialect,
});

const Category = sequelize.define('Category', {
  ID: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  Name: DataTypes.STRING(100),
  Description: DataTypes.TEXT,
  Image_url: DataTypes.STRING(255),
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
  tableName: 'Category',
  timestamps: false
});

module.exports = Category;
