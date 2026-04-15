const { Op } = require('sequelize');
const { Product, Category } = require('../models');

// Get all products with search, filter, sort, pagination
exports.getAllProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      category_id,
      min_price,
      max_price,
      min_rating,
      brand,
      sort = 'relevance',
      featured,
    } = req.query;

    const where = {};

    // Search by name, brand, description, or category name
    if (search) {
      // Also find matching category IDs
      const matchingCategories = await Category.findAll({
        where: { name: { [Op.like]: `%${search}%` } },
        attributes: ['id'],
      });
      const matchingCatIds = matchingCategories.map((c) => c.id);

      const searchConditions = [
        { name: { [Op.like]: `%${search}%` } },
        { brand: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];

      if (matchingCatIds.length > 0) {
        searchConditions.push({ category_id: { [Op.in]: matchingCatIds } });
      }

      where[Op.or] = searchConditions;
    }

    // Filter by category ID
    if (category_id) {
      where.category_id = category_id;
    }

    // Filter by category slug
    if (category) {
      const cat = await Category.findOne({ where: { slug: category } });
      if (cat) {
        where.category_id = cat.id;
      }
    }

    // Price range
    if (min_price || max_price) {
      where.price = {};
      if (min_price) where.price[Op.gte] = parseFloat(min_price);
      if (max_price) where.price[Op.lte] = parseFloat(max_price);
    }

    // Rating filter
    if (min_rating) {
      where.rating = { [Op.gte]: parseFloat(min_rating) };
    }

    // Brand filter
    if (brand) {
      where.brand = { [Op.in]: brand.split(',') };
    }

    // Featured filter
    if (featured === 'true') {
      where.is_featured = true;
    }

    // Only show in-stock items
    where.stock = { [Op.gt]: 0 };

    // Sort options
    let order;
    switch (sort) {
      case 'price_low':
        order = [['price', 'ASC']];
        break;
      case 'price_high':
        order = [['price', 'DESC']];
        break;
      case 'rating':
        order = [['rating', 'DESC']];
        break;
      case 'newest':
        order = [['created_at', 'DESC']];
        break;
      case 'discount':
        order = [['discount_percent', 'DESC']];
        break;
      default:
        order = [['is_featured', 'DESC'], ['rating', 'DESC']];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug'],
        },
      ],
      order,
      limit: parseInt(limit),
      offset,
    });

    res.json({
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

// Get single product by ID
exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug'],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Get similar products from same category
    const similarProducts = await Product.findAll({
      where: {
        category_id: product.category_id,
        id: { [Op.ne]: product.id },
        stock: { [Op.gt]: 0 },
      },
      limit: 8,
      order: [['rating', 'DESC']],
    });

    res.json({ product, similarProducts });
  } catch (error) {
    next(error);
  }
};

// Get featured/deal products
exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const featuredProducts = await Product.findAll({
      where: { is_featured: true, stock: { [Op.gt]: 0 } },
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }],
      limit: 12,
      order: [['rating', 'DESC']],
    });

    const topDeals = await Product.findAll({
      where: { discount_percent: { [Op.gte]: 20 }, stock: { [Op.gt]: 0 } },
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }],
      limit: 12,
      order: [['discount_percent', 'DESC']],
    });

    const bestSellers = await Product.findAll({
      where: { rating: { [Op.gte]: 4.0 }, stock: { [Op.gt]: 0 } },
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }],
      limit: 12,
      order: [['review_count', 'DESC']],
    });

    res.json({ featuredProducts, topDeals, bestSellers });
  } catch (error) {
    next(error);
  }
};

// Search suggestions (for autocomplete)
exports.searchSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    const products = await Product.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${q}%` } },
          { brand: { [Op.like]: `%${q}%` } },
        ],
      },
      attributes: ['id', 'name', 'brand'],
      limit: 8,
    });

    const suggestions = products.map((p) => ({
      id: p.id,
      text: p.name,
      brand: p.brand,
    }));

    res.json({ suggestions });
  } catch (error) {
    next(error);
  }
};

// Get all unique brands
exports.getBrands = async (req, res, next) => {
  try {
    const { category_id } = req.query;
    const where = {};
    if (category_id) where.category_id = category_id;

    const products = await Product.findAll({
      where,
      attributes: ['brand'],
      group: ['brand'],
      order: [['brand', 'ASC']],
    });

    const brands = products.map((p) => p.brand).filter(Boolean);
    res.json({ brands });
  } catch (error) {
    next(error);
  }
};
