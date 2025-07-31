const { Sequelize, DataTypes } = require('sequelize');
const { db } = require('../config');

const env = process.env.NODE_ENV || 'development';
const { database, username, password, host, dialect } = db[env];

const sequelize = new Sequelize(database, username, password, {
  host: host,
  dialect: dialect,
});

const ContactUs = sequelize.define('ContactUs', {
  ID: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  Name: DataTypes.STRING(100),
  Email: DataTypes.STRING(100),
  Subject:DataTypes.STRING(255),
  Message:DataTypes.TEXT,
  Phone: DataTypes.STRING(20),
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
  tableName: 'ContactUs',
  timestamps: false
});

module.exports = ContactUs;
