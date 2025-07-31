const { Sequelize, DataTypes } = require("sequelize");
const { db } = require("../config");

const env = process.env.NODE_ENV || "development";
const { database, username, password, host, dialect } = db[env];

const sequelize = new Sequelize(database, username, password, {
  host: host,
  dialect: dialect,
});

const HomepageSections = sequelize.define(
  "HomepageSections",
  {
    ID: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    Section_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    Display_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    Status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    Order: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    Is_app: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    Is_web: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    Created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    Updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
  },
  {
    tableName: "HomepageSections",
    timestamps: false,
  }
);

module.exports = HomepageSections;
