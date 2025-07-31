const { Sequelize, DataTypes } = require('sequelize');
const { db } = require('../config');

const env = process.env.NODE_ENV || 'local';
const { database, username, password, host, dialect } = db[env];

const sequelize = new Sequelize(database, username, password, {
  host: host,
  dialect: dialect,
});

const ContactUs = sequelize.define('ContactUs', {
  ID: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
},
Name: {
    type: DataTypes.TEXT,
    allowNull: false,
},
Email: {
    type: DataTypes.TEXT,
    allowNull: false,
},
Contact: {
    type: DataTypes.BIGINT,
    allowNull: false,
},
Message: {
    type: DataTypes.TEXT,
    allowNull: false,
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
  tableName: 'ContactUs',
  timestamps: false
});

module.exports = ContactUs;
