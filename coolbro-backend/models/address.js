const { Sequelize, DataTypes } = require('sequelize');
const { db } = require('../config');

const env = process.env.NODE_ENV || 'development';
const { database, username, password, host, dialect } = db[env];

const sequelize = new Sequelize(database, username, password, {
  host: host,
  dialect: dialect,
});

const Address = sequelize.define('Address', {
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
  Nick_name: DataTypes.STRING(100),
  Company_name: DataTypes.STRING(100),
  GST_number: DataTypes.STRING(15),
  First_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  Last_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  Phone_number: DataTypes.STRING(20),
  Phone_number_2: DataTypes.STRING(20),
  Address: DataTypes.TEXT,
  City: DataTypes.STRING(100),
  State: DataTypes.STRING(100),
  PostalCode: DataTypes.STRING(20),
  Country: DataTypes.STRING(100),
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
  tableName: 'Address',
  timestamps: false
});

module.exports = Address;
