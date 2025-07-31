const { Sequelize, DataTypes } = require('sequelize');
const { db } = require('../config');

const env = process.env.NODE_ENV || 'local';
const { database, username, password, host, dialect } = db[env];

const sequelize = new Sequelize(database, username, password, {
  host: host,
  dialect: dialect,
});
const Page = sequelize.define('Page', {
  ID: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  UserID: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'User',
      key: 'ID'
    }
  },
  ProjectID: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'Project',
      key: 'ID'
    }
  },
  BackGroundItemsID: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: 'BackgroundItems',
      key: 'ID'
    }
  },
  Name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  Page_order: {
    type: DataTypes.INTEGER,
    allowNull: false
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
  tableName: 'Page',
  timestamps: false
});

module.exports = Page;
