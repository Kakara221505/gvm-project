const { Sequelize, DataTypes } = require('sequelize');
const { db } = require('../config');
const User = require('./user');
const env = process.env.NODE_ENV || 'development';
const { database, username, password, host, dialect } = db[env];

const sequelize = new Sequelize(database, username, password, {
  host: host,
  dialect: dialect,
});

const UserAirConditionService = sequelize.define('UserAirConditionService', {
  ID: {
    type: DataTypes.BIGINT,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  UserID: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: {
      model: User,
      key: 'ID'
    }
  },
  AC_name: DataTypes.STRING(255),
  Media_url: DataTypes.STRING(255),
  Purchase_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  Last_serviced_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  Next_serviced_date: {
    type: DataTypes.DATE,
    allowNull: true
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
  tableName: 'UserAirConditionService',
  timestamps: false
});

module.exports = UserAirConditionService;
