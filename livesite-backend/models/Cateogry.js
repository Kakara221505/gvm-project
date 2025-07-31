const { Sequelize, DataTypes } = require('sequelize');
const { db } = require('../config');

const env = process.env.NODE_ENV || 'local';
const { database, username, password, host, dialect } = db[env];

const sequelize = new Sequelize(database, username, password, {
  host: host,
  dialect: dialect,
});

const Category = sequelize.define('Category', {
    ID: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    CategoryName: {
        type: DataTypes.TEXT,
      allowNull: true
    },
    Created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    Updated_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'Category',
    timestamps: false
  });
  
  module.exports = Category;