const { Category, Subcategory, SubSubcategory, Product, Brand, Color } = require('../models');
const { Op } = require('sequelize');

// Get full category tree (categories → subcategories → subSubcategories)
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      order: [['id', 'ASC']],
      include: [
        {
          model: Subcategory,
          as: 'subcategories',
          order: [['id', 'ASC']],
          include: [
            {
              model: SubSubcategory,
              as: 'subSubcategories',
              order: [['id', 'ASC']],
            },
          ],
        },
      ],
    });
    res.json({ categories });
  } catch (error) {
    next(error);
  }
};

// Get subcategories for a category
exports.getSubcategories = async (req, res, next) => {
  try {
    const { id } = req.params;
    const subcategories = await Subcategory.findAll({
      where: { category_id: id },
      include: [
        {
          model: SubSubcategory,
          as: 'subSubcategories',
        },
      ],
      order: [['id', 'ASC']],
    });
    res.json({ subcategories });
  } catch (error) {
    next(error);
  }
};

// Get sub-subcategories for a subcategory
exports.getSubSubcategories = async (req, res, next) => {
  try {
    const { id } = req.params;
    const subSubcategories = await SubSubcategory.findAll({
      where: { subcategory_id: id },
      order: [['id', 'ASC']],
    });
    res.json({ subSubcategories });
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

// Get all brands
exports.getAllBrands = async (req, res, next) => {
  try {
    const brands = await Brand.findAll({
      order: [['name', 'ASC']],
    });
    res.json({ brands });
  } catch (error) {
    next(error);
  }
};

// Get all colors
exports.getAllColors = async (req, res, next) => {
  try {
    const colors = await Color.findAll({
      order: [['name', 'ASC']],
    });
    res.json({ colors });
  } catch (error) {
    next(error);
  }
};
