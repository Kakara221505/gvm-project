const { Sequelize, DataTypes } = require('sequelize');
const { db } = require('../config');

const env = process.env.NODE_ENV || 'local';
const { database, username, password, host, dialect } = db[env];

const sequelize = new Sequelize(database, username, password, {
  host: host,
  dialect: dialect,
});

const BackgroundItems = sequelize.define('BackgroundItems', {
  ID: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  UserID: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'User',
      key: 'ID'
    }
  },
  ProjectID: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'Project',
      key: 'ID'
    }
  },
  PageID: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  Type: {
    type: DataTypes.ENUM('0', '1', '2'),
    allowNull: false,
    defaultValue: '0'
  },
  BackGroundColor: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  Is_default: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  Created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  Updated_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'BackgroundItems',
  timestamps: false
});

module.exports = BackgroundItems;
