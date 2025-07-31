const { Sequelize, DataTypes } = require('sequelize');
const { db } = require('../config');
// const UserModel = require('./user');
// const OrganizationModel = require('./organization');

const env = process.env.NODE_ENV || 'development';
const { database, username, password, host, dialect } = db[env];

const sequelize = new Sequelize(database, username, password, {
  host: host,
  dialect: dialect,
});

const OrganizationUserRelation = sequelize.define('OrganizationUserRelation', {
  ID: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  OrganizationID: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'Organization',
      key: 'ID'
    }
  },
  UserID: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'User',
      key: 'ID'
    }
  },
  Role: {
    type: DataTypes.ENUM('0', '1','2','3'),
    allowNull: false,
    defaultValue: '1'
  },
  Is_deleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  Is_approved: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  Created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  Updated_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  }
}, {
  tableName: 'OrganizationUserRelation',
  timestamps: false
});

module.exports = OrganizationUserRelation;
