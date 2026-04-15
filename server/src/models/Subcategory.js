const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Subcategory = sequelize.define('Subcategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id',
    },
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  icon_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
}, {
  tableName: 'subcategories',
});

module.exports = Subcategory;
