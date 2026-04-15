const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WishlistItem = sequelize.define('WishlistItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  wishlist_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'wishlists',
      key: 'id',
    },
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id',
    },
  },
}, {
  tableName: 'wishlist_items',
});

module.exports = WishlistItem;
