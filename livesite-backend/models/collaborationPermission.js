const { Sequelize, DataTypes } = require('sequelize');
const { db } = require('../config');

const env = process.env.NODE_ENV || 'local';
const { database, username, password, host, dialect } = db[env];

const sequelize = new Sequelize(database, username, password, {
  host: host,
  dialect: dialect,
});

const CollaborationPermission = sequelize.define('CollaborationPermission', {
    ID: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    UserID: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    ProjectID: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    CanView: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    CanEdit: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    CanDelete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    CanShare: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    CanManageLayers: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    CanManageUsers: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    Created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      Updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
  }, {
    tableName: 'CollaborationPermission',
    timestamps: false
  });
  
  module.exports = CollaborationPermission;
