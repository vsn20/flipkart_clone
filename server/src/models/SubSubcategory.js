const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SubSubcategory = sequelize.define('SubSubcategory', {
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
  subcategory_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'subcategories',
      key: 'id',
    },
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
}, {
  tableName: 'sub_subcategories',
});

module.exports = SubSubcategory;
