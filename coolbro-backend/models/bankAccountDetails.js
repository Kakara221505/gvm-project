const { Sequelize, DataTypes } = require('sequelize');
const { db } = require('../config');

const env = process.env.NODE_ENV || 'development';
const { database, username, password, host, dialect } = db[env];

const sequelize = new Sequelize(database, username, password, {
  host: host,
  dialect: dialect,
});

const BankAccountDetails = sequelize.define('BankAccountDetails', {
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
  Account_holder_name: DataTypes.STRING(100),
  Account_number: DataTypes.STRING(100),
  Bank_name: DataTypes.STRING(100),
  Branch: DataTypes.STRING(100),
  IFSC_code: DataTypes.STRING(100),
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
  tableName: 'BankAccountDetails',
  timestamps: false
});

module.exports = BankAccountDetails;
