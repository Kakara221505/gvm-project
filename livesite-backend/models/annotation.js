const { Sequelize, DataTypes } = require('sequelize');
const { db } = require('../config');

const env = process.env.NODE_ENV || 'local';
const { database, username, password, host, dialect } = db[env];

const sequelize = new Sequelize(database, username, password, {
  host: host,
  dialect: dialect,
});

const Annotations = sequelize.define('Annotations', {
  ID: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },

  UserID: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  front_no_id: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  bob_no_id: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  parentSelectSpecialId: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  isPasteSpecialParent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  LayerID: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  AssignDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  ParentAnnotationID: {
    type: DataTypes.STRING(100),
  },

  Type: {
    type: DataTypes.STRING(50)
  },
  Title: {
    type: DataTypes.STRING(255)
  },
  Comment: {
    type: DataTypes.TEXT
  },
  Coordinates: {
    type: DataTypes.TEXT
  },
  StrokeColor: {
    type: DataTypes.STRING(20)
  },
  StrokeWidth: {
    type: DataTypes.DECIMAL(10, 2)
  },
  AxisX: {
    type: DataTypes.DECIMAL(10, 2)
  },
  AxisY: {
    type: DataTypes.DECIMAL(10, 2)
  },
  Width: {
    type: DataTypes.DECIMAL(10, 2)
  },
  Height: {
    type: DataTypes.DECIMAL(10, 2)
  },
  Rotation: {
    type: DataTypes.DECIMAL(10, 2)
  },
  Opacity: {
    type: DataTypes.DECIMAL(10, 2)
  },
  Scale_width: {
    type: DataTypes.DECIMAL(10, 2)
  },
  Scale_height: {
    type: DataTypes.DECIMAL(10, 2)
  },
  Origin_X: {
    type: DataTypes.DECIMAL(10, 2)
  },
  Origin_Y: {
    type: DataTypes.DECIMAL(10, 2)
  },
  Font_weight: {
    type: DataTypes.DECIMAL(10, 2)
  },
  Font_height: {
    type: DataTypes.DECIMAL(10, 2)
  },
  Font_size: {
    type: DataTypes.DECIMAL(10, 2)
  },
  Font_family: {
    type: DataTypes.STRING(50)
  },
  Font_color: {
    type: DataTypes.STRING(20)
  },
  IsLocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  IsVisible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  properties: {
    type: DataTypes.JSON,
    allowNull: true
  },
  Is_deleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
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
  tableName: 'Annotations',
  timestamps: false
});

module.exports = Annotations;
