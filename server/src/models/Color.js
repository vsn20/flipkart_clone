const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Color = sequelize.define('Color', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  hex_code: {
    type: DataTypes.STRING(7),
    allowNull: true,
  },
}, {
  tableName: 'colors',
});

module.exports = Color;
