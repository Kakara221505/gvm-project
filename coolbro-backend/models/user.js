const { Sequelize, DataTypes } = require('sequelize');
const { db } = require('../config');

const env = process.env.NODE_ENV || 'development';
const { database, username, password, host, dialect } = db[env];

const sequelize = new Sequelize(database, username, password, {
  host: host,
  dialect: dialect,
});

const User = sequelize.define('User', {
  ID: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  Name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  Email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  Password: {
    type: DataTypes.STRING,
    allowNull: true
  },
  Country_code: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  Phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  Otp: {
    type: DataTypes.STRING,
    allowNull: true
  },
  Is_otp_verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  Otp_expiration_time: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  Is_verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  Is_paid_user: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  Login_type: {
    type: DataTypes.STRING, //ENUM('phone','email')
    allowNull: false
  },
  UserRoleID: {
    type: DataTypes.BIGINT, // ENUM('superadmin' 'admin', 'distributor', 'dealer', 'consumer', 'staff')
    allowNull: false,
  },
  AccessToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  DeviceToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  Is_deleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
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
  tableName: 'User',
  timestamps: false
});

module.exports = User;
