const { Category, Product } = require('../models');
const { Op } = require('sequelize');

// Get all categories
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      order: [['name', 'ASC']],
    });
    res.json({ categories });
  } catch (error) {
    next(error);
  }
};

// Get products by category
exports.getCategoryProducts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 12, sort = 'relevance' } = req.query;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    let order;
    switch (sort) {
      case 'price_low': order = [['price', 'ASC']]; break;
      case 'price_high': order = [['price', 'DESC']]; break;
      case 'rating': order = [['rating', 'DESC']]; break;
      case 'newest': order = [['created_at', 'DESC']]; break;
      default: order = [['is_featured', 'DESC'], ['rating', 'DESC']];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: products } = await Product.findAndCountAll({
      where: { category_id: id, stock: { [Op.gt]: 0 } },
      order,
      limit: parseInt(limit),
      offset,
    });

    res.json({
      category,
      products,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};
