const sequelize = require('../config/database');
const User = require('./User');
const Category = require('./Category');
const Subcategory = require('./Subcategory');
const SubSubcategory = require('./SubSubcategory');
const Brand = require('./Brand');
const Color = require('./Color');
const Product = require('./Product');
const Cart = require('./Cart');
const CartItem = require('./CartItem');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Wishlist = require('./Wishlist');
const WishlistItem = require('./WishlistItem');
const Address = require('./Address');

// ─── Category Hierarchy ────────────────────────────────
// Category → Subcategory → SubSubcategory
Category.hasMany(Subcategory, { foreignKey: 'category_id', as: 'subcategories' });
Subcategory.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

Subcategory.hasMany(SubSubcategory, { foreignKey: 'subcategory_id', as: 'subSubcategories' });
SubSubcategory.belongsTo(Subcategory, { foreignKey: 'subcategory_id', as: 'subcategory' });

// ─── Product Associations ──────────────────────────────
// Category <-> Product
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// Subcategory <-> Product
Subcategory.hasMany(Product, { foreignKey: 'subcategory_id', as: 'products' });
Product.belongsTo(Subcategory, { foreignKey: 'subcategory_id', as: 'subcategory' });

// SubSubcategory <-> Product
SubSubcategory.hasMany(Product, { foreignKey: 'sub_subcategory_id', as: 'products' });
Product.belongsTo(SubSubcategory, { foreignKey: 'sub_subcategory_id', as: 'subSubcategory' });

// Brand <-> Product
Brand.hasMany(Product, { foreignKey: 'brand_id', as: 'products' });
Product.belongsTo(Brand, { foreignKey: 'brand_id', as: 'brandInfo' });

// ─── User <-> Cart (one-to-one) ────────────────────────
User.hasOne(Cart, { foreignKey: 'user_id', as: 'cart' });
Cart.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Cart <-> CartItem
Cart.hasMany(CartItem, { foreignKey: 'cart_id', as: 'items', onDelete: 'CASCADE' });
CartItem.belongsTo(Cart, { foreignKey: 'cart_id', as: 'cart' });

// CartItem <-> Product
CartItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Product.hasMany(CartItem, { foreignKey: 'product_id', as: 'cartItems' });

// User <-> Order
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Order <-> OrderItem
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// OrderItem <-> Product
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'orderItems' });

// User <-> Wishlist (one-to-one)
User.hasOne(Wishlist, { foreignKey: 'user_id', as: 'wishlist' });
Wishlist.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Wishlist <-> WishlistItem
Wishlist.hasMany(WishlistItem, { foreignKey: 'wishlist_id', as: 'items', onDelete: 'CASCADE' });
WishlistItem.belongsTo(Wishlist, { foreignKey: 'wishlist_id', as: 'wishlist' });

// WishlistItem <-> Product
WishlistItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Product.hasMany(WishlistItem, { foreignKey: 'product_id', as: 'wishlistItems' });

// User <-> Address (one-to-many)
User.hasMany(Address, { foreignKey: 'user_id', as: 'addresses' });
Address.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  User,
  Category,
  Subcategory,
  SubSubcategory,
  Brand,
  Color,
  Product,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Wishlist,
  WishlistItem,
  Address,
};
