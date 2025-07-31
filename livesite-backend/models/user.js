const { Sequelize, DataTypes } = require("sequelize");
const { db } = require("../config");
const OrganizationUserRelation = require("./OrganizationUserRelation");

const env = process.env.NODE_ENV || "development";
const { database, username, password, host, dialect } = db[env];
const sequelize = new Sequelize(database, username, password, {
  host: host,
  dialect: dialect,
});

const User = sequelize.define(
  "User",
  {
    ID: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    First_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Last_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    Gender: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Date_of_birth: DataTypes.DATE,

    Password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Otp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    Is_paid_user: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    User_type: {
      type: DataTypes.ENUM("0", "1", "2"),
      allowNull: false,
      defaultValue: "2",
    },
    Login_type: {
      type: DataTypes.ENUM("0", "1"),
      allowNull: false,
      defaultValue: "0",
    },
    Otp_expiration_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    Is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    Is_otp_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    AccessToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    Updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "User",
    timestamps: false,
  }
);

User.hasOne(OrganizationUserRelation, {
  foreignKey: "UserID",
  as: "OrganizationUserRelation",
});

OrganizationUserRelation.belongsTo(User, {
  foreignKey: "UserID",
  as: "User",
});

module.exports = User;
