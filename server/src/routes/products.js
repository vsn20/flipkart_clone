const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getAllProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/search', productController.searchSuggestions);
router.get('/brands', productController.getBrands);
router.get('/colors', productController.getColors);
router.get('/:id', productController.getProductById);

module.exports = router;
