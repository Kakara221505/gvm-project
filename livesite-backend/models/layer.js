const { Sequelize, DataTypes } = require('sequelize');
const { db } = require('../config');

const env = process.env.NODE_ENV || 'local';
const { database, username, password, host, dialect } = db[env];

const sequelize = new Sequelize(database, username, password, {
  host: host,
  dialect: dialect,
});
const Layer = sequelize.define('Layer', {
  ID: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  UserID: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  PageID: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  Name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  Group_Name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  Layer_order: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  IsLocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  IsGroup: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  IsVisible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  FillColor: {
    type: DataTypes.STRING(20)
  },
  StrokeColor: {
    type: DataTypes.STRING(20)
  },
  StrokeWidth: {
    type: DataTypes.DECIMAL(10, 2)
  },
  Font_size: {
    type: DataTypes.DECIMAL(10, 2)
  },
  Font_family: {
    type: DataTypes.STRING(50)
  },
  StrokeType : {
    type: DataTypes.STRING(50)
  },
  Collapsed: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  AssignDate: {
    type: DataTypes.DATE,
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
  tableName: 'Layer',
  timestamps: false
});

module.exports = Layer;
