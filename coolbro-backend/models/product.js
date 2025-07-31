const { Sequelize, DataTypes } = require('sequelize');
const { db } = require('../config');

const env = process.env.NODE_ENV || 'development';
const { database, username, password, host, dialect } = db[env];

const sequelize = new Sequelize(database, username, password, {
  host: host,
  dialect: dialect,
});

const Product = sequelize.define('Product', {
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
  Name: DataTypes.STRING(100),
  BrandID: DataTypes.BIGINT,
  CategoryID: DataTypes.BIGINT,
  EnergyEfficiencyRatingID: DataTypes.BIGINT,
  Model_number: DataTypes.STRING(100),
  Model_series: DataTypes.STRING(100),
  SKU_number: DataTypes.STRING(100),
  Description: DataTypes.TEXT,
  Price: DataTypes.DECIMAL(10, 2),
  Sale_price: DataTypes.DECIMAL(10, 2),
  Is_price:DataTypes.BOOLEAN,
  Is_price_range:DataTypes.BOOLEAN,
  Min_price:DataTypes.DECIMAL(10, 2),
  Max_price:DataTypes.DECIMAL(10, 2),
  Meta_tag_title:DataTypes.STRING(100),
  Meta_tag_description:DataTypes.TEXT,
  Meta_tag_keywords:DataTypes.TEXT,
  Quantity: DataTypes.INTEGER,
  Status: DataTypes.STRING(20), //ENUM('Published', 'Draft', 'Inactive'),
  Cooling_capacity: DataTypes.DECIMAL(5, 2),
  Is_available: DataTypes.BOOLEAN,
  Is_featured: DataTypes.BOOLEAN,
  Is_new_arrival: DataTypes.BOOLEAN,
  Is_best_seller: DataTypes.BOOLEAN,
  Is_exclusive: DataTypes.BOOLEAN,
  Is_wifi_enabled: DataTypes.BOOLEAN, //Features filter
  Has_voice_control: DataTypes.BOOLEAN, //Features filter
  Has_auto_cleaning: DataTypes.BOOLEAN, //Features filter
  Has_dehumidification: DataTypes.BOOLEAN, //Features filter
  Has_sleep_mode: DataTypes.BOOLEAN, //Features filter
  Has_turbo_mode: DataTypes.BOOLEAN, //Features filter
  Has_eco_mode: DataTypes.BOOLEAN, //Features filter
  Noise_level_indoor:  DataTypes.STRING(50),
  Noise_level_outdoor:  DataTypes.STRING(50),
  Installation_type: DataTypes.STRING(50),
  Remote_control_type: DataTypes.STRING(50), //Standard remote, Smart remote, etc.
  Warranty_period: DataTypes.INTEGER, //in Year
  Cooling_technology: DataTypes.STRING(50), //ENUM('Conventional compressor', 'Inverter compressor'),
  Has_built_in_air_purifier: DataTypes.BOOLEAN, //Air Purification filter
  Has_anti_bacterial_filter: DataTypes.BOOLEAN, //Air Purification filter
  Has_dust_filter: DataTypes.BOOLEAN, //Air Purification filter
  Room_size_suitability: DataTypes.STRING(50), //ENUM('Small room', 'Medium room', 'Large room', 'Extra-large room'),
  Production_year: DataTypes.INTEGER,
  Voltage: DataTypes.DECIMAL(4, 2),
  Wattage: DataTypes.DECIMAL(6, 2),
  Frequency: DataTypes.DECIMAL(5, 2),
  Refrigerant: DataTypes.STRING(50),
  Condenser_coil: DataTypes.STRING(255),
  Dimensions_indoor_width: DataTypes.DECIMAL(6, 2),
  Dimensions_indoor_height: DataTypes.DECIMAL(6, 2),
  Dimensions_indoor_depth: DataTypes.DECIMAL(6, 2),
  Indoor_unit_weight: DataTypes.DECIMAL(6, 2),
  Dimensions_outdoor_width: DataTypes.DECIMAL(6, 2),
  Dimensions_outdoor_height: DataTypes.DECIMAL(6, 2),
  Dimensions_outdoor_depth: DataTypes.DECIMAL(6, 2),
  Outdoor_unit_weight: DataTypes.DECIMAL(6, 2),
  Created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  Created_by: DataTypes.BIGINT,
  Updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  Updated_by: DataTypes.BIGINT
}, {
  tableName: 'Product',
  timestamps: false
});

module.exports = Product;
