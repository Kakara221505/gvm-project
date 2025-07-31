const { Sequelize, DataTypes } = require('sequelize');
const { db } = require('../config');
const User = require('./user');
const env = process.env.NODE_ENV || 'development';
const { database, username, password, host, dialect } = db[env];

const sequelize = new Sequelize(database, username, password, {
  host: host,
  dialect: dialect,
});

const UserDetails = sequelize.define('UserDetails ', {
  ID: {
    type: DataTypes.BIGINT,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  UserID: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: {
      model: User,
      key: 'ID'
    }
  },
  Company_name: DataTypes.STRING(100),
  BusinessType: DataTypes.STRING(100),
  NumberOfEmployees: DataTypes.INTEGER,
  LegalStatus: DataTypes.STRING(100),
  Description: DataTypes.TEXT,
  Contact_name: DataTypes.STRING(100),
  Contact_email: DataTypes.STRING(100),
  Contact_phone: DataTypes.STRING(20),
  Year_of_establishment: DataTypes.DATE,
  Gender: DataTypes.STRING(20),
  Date_of_birth: DataTypes.DATE,
  Date_of_anniversary:DataTypes.DATE,
  Blood_group:DataTypes.STRING(20),
  DefaultAddressID:DataTypes.BIGINT,
  UPI_id: DataTypes.STRING(100),
  Latitude: DataTypes.DECIMAL(10, 8),
  Longitude: DataTypes.DECIMAL(10, 8),
  Is_kyc_verified: {
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
  tableName: 'UserDetails',
  timestamps: false
});

// define association between User and FamilyMember models
User.hasOne(UserDetails, { foreignKey: 'UserID' });
UserDetails.belongsTo(User);

module.exports = UserDetails;
