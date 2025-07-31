const { Sequelize, DataTypes } = require('sequelize');
const { db } = require('../config');

const env = process.env.NODE_ENV || 'local';
const { database, username, password, host, dialect } = db[env];

const sequelize = new Sequelize(database, username, password, {
  host: host,
  dialect: dialect,
});

const Calender = sequelize.define('Calender', {
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
    PageID: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    BgID: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    Date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    Notes: {
      type: DataTypes.TEXT,
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
    tableName: 'Calender',
    timestamps: false
  });
  
  module.exports = Calender;