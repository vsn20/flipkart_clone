const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  order_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  shipping_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  shipping_phone: {
    type: DataTypes.STRING(15),
    allowNull: false,
  },
  shipping_address: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  shipping_city: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  shipping_state: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  shipping_pincode: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  delivery_charges: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  payment_method: {
    type: DataTypes.ENUM('COD', 'UPI'),
    defaultValue: 'COD',
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled'),
    defaultValue: 'confirmed',
  },
  super_coins_earned: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'orders',
});

module.exports = Order;
