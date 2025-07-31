const { Sequelize, DataTypes } = require('sequelize');
const { db } = require('../config');

const env = process.env.NODE_ENV || 'development';
const { database, username, password, host, dialect } = db[env];

const sequelize = new Sequelize(database, username, password, {
  host: host,
  dialect: dialect,
});

const UserMedia = sequelize.define('UserMedia', {
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
  Media_url: DataTypes.STRING(255),
  Media_type: DataTypes.ENUM('image', 'video'),
  Is_main_media: {
    type: DataTypes.BOOLEAN,
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
  tableName: 'UserMedia',
  timestamps: false
});

module.exports = UserMedia;
