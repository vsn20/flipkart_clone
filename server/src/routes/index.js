const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const productRoutes = require('./products');
const categoryRoutes = require('./categories');
const cartRoutes = require('./cart');
const orderRoutes = require('./orders');
const wishlistRoutes = require('./wishlist');
const addressRoutes = require('./addresses');

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/addresses', addressRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Flipkart Clone API is running!' });
});

module.exports = router;
