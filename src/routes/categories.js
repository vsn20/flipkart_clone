const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Full category tree (categories → subcategories → subSubcategories)
router.get('/', categoryController.getAllCategories);

// Subcategories of a specific category
router.get('/:id/subcategories', categoryController.getSubcategories);

// Products of a specific category
router.get('/:id/products', categoryController.getCategoryProducts);

// SubSubcategories of a specific subcategory
router.get('/subcategories/:id/subsubcategories', categoryController.getSubSubcategories);

// All brands
router.get('/brands/all', categoryController.getAllBrands);

// All colors
router.get('/colors/all', categoryController.getAllColors);

module.exports = router;
