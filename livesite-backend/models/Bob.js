const { Sequelize, DataTypes } = require('sequelize');
const { db } = require('../config');

const env = process.env.NODE_ENV || 'local';
const { database, username, password, host, dialect } = db[env];

const sequelize = new Sequelize(database, username, password, {
  host: host,
  dialect: dialect,
});

const Bob = sequelize.define('Bob', {
  ID: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },

  UserID: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  bob_no_id: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  properties: {
    type: DataTypes.JSON,
    allowNull: true
  },
 
  CategoryID: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  SubCategoryID: {
    type: DataTypes.BIGINT,
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
  tableName: 'Bob',
  timestamps: false
});

module.exports = Bob;
