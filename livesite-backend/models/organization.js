const { Sequelize, DataTypes } = require('sequelize');
const { db } = require('../config');

const env = process.env.NODE_ENV || 'development';
const { database, username, password, host, dialect } = db[env];

const sequelize = new Sequelize(database, username, password, {
  host: host,
  dialect: dialect,
});

const Organization = sequelize.define('Organization', {
  ID: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  UserID: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'User', // Assuming there's a User table
      key: 'ID'
    }
  },
  Key_name: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  Organization_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  Profile_image_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  Website: {
    type: DataTypes.STRING,
    allowNull: true
  },
  Contact_person_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  Address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  City: {
    type: DataTypes.STRING,
    allowNull: true
  },
  State: {
    type: DataTypes.STRING,
    allowNull: true
  },
  Is_deleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  Postal_code: {
    type: DataTypes.STRING,
    allowNull: true
  },
  Country: {
    type: DataTypes.STRING,
    allowNull: true
  },
  Created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  Updated_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'Organization',
  timestamps: false
});

module.exports = Organization;
