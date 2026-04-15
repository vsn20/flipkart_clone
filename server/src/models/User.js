const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: true, // null for OAuth users
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  gender: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  super_coins: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  plus_tier: {
    type: DataTypes.ENUM('none', 'silver', 'gold'),
    defaultValue: 'none',
  },
  total_orders: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  is_guest: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  auth_provider: {
    type: DataTypes.ENUM('local', 'google', 'guest'),
    defaultValue: 'local',
  },
  avatar_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
}, {
  tableName: 'users',
});

module.exports = User;
