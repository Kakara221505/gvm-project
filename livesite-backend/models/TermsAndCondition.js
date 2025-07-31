const { Sequelize, DataTypes } = require('sequelize');
const { db } = require('../config');

const env = process.env.NODE_ENV || 'local';
const { database, username, password, host, dialect } = db[env];

const sequelize = new Sequelize(database, username, password, {
  host: host,
  dialect: dialect,
});

const TermsAndCondition = sequelize.define('TermsAndCondition', {
    ID: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    TermsCondition: {
        type: DataTypes.TEXT, // To store HTML content
        allowNull: false,
    },
    Created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    Updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
  tableName: 'TermsAndCondition',
  timestamps: false
});

module.exports = TermsAndCondition;
