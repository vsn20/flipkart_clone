const { Op } = require('sequelize');
const { Product, Category, Subcategory, SubSubcategory, Brand } = require('../models');

// Get all products with search, filter, sort, pagination
exports.getAllProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      category_id,
      subcategory,
      subcategory_id,
      sub_subcategory,
      sub_subcategory_id,
      min_price,
      max_price,
      min_rating,
      brand,
      brand_id,
      color,
      sort = 'relevance',
      featured,
    } = req.query;

    const where = {};

    // Search by name, brand, description, or category name
    if (search) {
      const matchingCategories = await Category.findAll({
        where: { name: { [Op.like]: `%${search}%` } },
        attributes: ['id'],
      });
      const matchingSubcategories = await Subcategory.findAll({
        where: { name: { [Op.like]: `%${search}%` } },
        attributes: ['id'],
      });
      const matchingCatIds = matchingCategories.map((c) => c.id);
      const matchingSubCatIds = matchingSubcategories.map((s) => s.id);

      const searchConditions = [
        { name: { [Op.like]: `%${search}%` } },
        { brand: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];

      if (matchingCatIds.length > 0) {
        searchConditions.push({ category_id: { [Op.in]: matchingCatIds } });
      }
      if (matchingSubCatIds.length > 0) {
        searchConditions.push({ subcategory_id: { [Op.in]: matchingSubCatIds } });
      }

      where[Op.or] = searchConditions;
    }

    // Filter by category (ID or slug)
    if (category_id) {
      where.category_id = category_id;
    } else if (category) {
      const cat = await Category.findOne({ where: { slug: category } });
      if (cat) where.category_id = cat.id;
    }

    // Filter by subcategory (ID or slug)
    if (subcategory_id) {
      where.subcategory_id = subcategory_id;
    } else if (subcategory) {
      const sub = await Subcategory.findOne({ where: { slug: subcategory } });
      if (sub) where.subcategory_id = sub.id;
    }

    // Filter by sub_subcategory (ID or slug)
    if (sub_subcategory_id) {
      where.sub_subcategory_id = sub_subcategory_id;
    } else if (sub_subcategory) {
      const subsub = await SubSubcategory.findOne({ where: { slug: sub_subcategory } });
      if (subsub) where.sub_subcategory_id = subsub.id;
    }

    // Filter by brand (ID or name list)
    if (brand_id) {
      where.brand_id = brand_id;
    } else if (brand) {
      where.brand = { [Op.in]: brand.split(',') };
    }

    // Filter by color
    if (color) {
      where.color = { [Op.in]: color.split(',') };
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

    // Featured filter
    if (featured === 'true') {
      where.is_featured = true;
    }

    // Only show in-stock items
    where.stock = { [Op.gt]: 0 };

    // Sort options
    let order;
    switch (sort) {
      case 'price_low': order = [['price', 'ASC']]; break;
      case 'price_high': order = [['price', 'DESC']]; break;
      case 'rating': order = [['rating', 'DESC']]; break;
      case 'newest': order = [['created_at', 'DESC']]; break;
      case 'discount': order = [['discount_percent', 'DESC']]; break;
      default: order = [['is_featured', 'DESC'], ['rating', 'DESC']];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { model: Subcategory, as: 'subcategory', attributes: ['id', 'name', 'slug'] },
        { model: SubSubcategory, as: 'subSubcategory', attributes: ['id', 'name', 'slug'] },
        { model: Brand, as: 'brandInfo', attributes: ['id', 'name', 'slug', 'logo_url'] },
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
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { model: Subcategory, as: 'subcategory', attributes: ['id', 'name', 'slug'] },
        { model: SubSubcategory, as: 'subSubcategory', attributes: ['id', 'name', 'slug'] },
        { model: Brand, as: 'brandInfo', attributes: ['id', 'name', 'slug', 'logo_url'] },
      ],
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Get similar products from same subcategory (or category if no subcategory)
    const similarWhere = {
      id: { [Op.ne]: product.id },
      stock: { [Op.gt]: 0 },
    };
    if (product.subcategory_id) {
      similarWhere.subcategory_id = product.subcategory_id;
    } else {
      similarWhere.category_id = product.category_id;
    }

    const similarProducts = await Product.findAll({
      where: similarWhere,
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
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { model: Subcategory, as: 'subcategory', attributes: ['id', 'name', 'slug'] },
      ],
      limit: 12,
      order: [['rating', 'DESC']],
    });

    const topDeals = await Product.findAll({
      where: { discount_percent: { [Op.gte]: 20 }, stock: { [Op.gt]: 0 } },
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { model: Subcategory, as: 'subcategory', attributes: ['id', 'name', 'slug'] },
      ],
      limit: 12,
      order: [['discount_percent', 'DESC']],
    });

    const bestSellers = await Product.findAll({
      where: { rating: { [Op.gte]: 4.0 }, stock: { [Op.gt]: 0 } },
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { model: Subcategory, as: 'subcategory', attributes: ['id', 'name', 'slug'] },
      ],
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

// Get brands – supports filtering by category/subcategory context
exports.getBrands = async (req, res, next) => {
  try {
    const { category_id, subcategory_id } = req.query;
    const where = {};
    if (category_id) where.category_id = category_id;
    if (subcategory_id) where.subcategory_id = subcategory_id;

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

// Get available colors for a given filter context
exports.getColors = async (req, res, next) => {
  try {
    const { category_id, subcategory_id } = req.query;
    const where = { color: { [Op.ne]: null } };
    if (category_id) where.category_id = category_id;
    if (subcategory_id) where.subcategory_id = subcategory_id;

    const products = await Product.findAll({
      where,
      attributes: ['color'],
      group: ['color'],
      order: [['color', 'ASC']],
    });

    const colors = products.map((p) => p.color).filter(Boolean);
    res.json({ colors });
  } catch (error) {
    next(error);
  }
};
