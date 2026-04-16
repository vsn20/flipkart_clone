const sequelize = require('../config/database');

// Get full category tree (categories → subcategories → subSubcategories)
exports.getAllCategories = async (req, res, next) => {
  try {
    // Get all categories
    const categoriesQuery = `SELECT * FROM categories ORDER BY id ASC`;
    const [categories] = await sequelize.query(categoriesQuery);

    // Get all subcategories
    const subcategoriesQuery = `SELECT * FROM subcategories ORDER BY id ASC`;
    const [subcategories] = await sequelize.query(subcategoriesQuery);

    // Get all sub-subcategories
    const subSubcategoriesQuery = `SELECT * FROM sub_subcategories ORDER BY id ASC`;
    const [subSubcategories] = await sequelize.query(subSubcategoriesQuery);

    // Build tree structure
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.id] = {
        ...cat,
        subcategories: []
      };
    });

    const subcategoryMap = {};
    subcategories.forEach(sub => {
      subcategoryMap[sub.id] = {
        ...sub,
        subSubcategories: []
      };
      if (categoryMap[sub.category_id]) {
        categoryMap[sub.category_id].subcategories.push(subcategoryMap[sub.id]);
      }
    });

    subSubcategories.forEach(subsub => {
      if (subcategoryMap[subsub.subcategory_id]) {
        subcategoryMap[subsub.subcategory_id].subSubcategories.push(subsub);
      }
    });

    const result = Object.values(categoryMap);
    res.json({ categories: result });
  } catch (error) {
    next(error);
  }
};

// Get subcategories for a category
exports.getSubcategories = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get subcategories
    const query = `SELECT * FROM subcategories WHERE category_id = ? ORDER BY id ASC`;
    const [subcategories] = await sequelize.query(query, { replacements: [id] });

    // Get sub-subcategories for each
    const subcategoryIds = subcategories.map(s => s.id);
    
    if (subcategoryIds.length > 0) {
      const subSubQuery = `
        SELECT * FROM sub_subcategories 
        WHERE subcategory_id IN (${subcategoryIds.map(() => '?').join(',')})
        ORDER BY id ASC
      `;
      const [allSubSub] = await sequelize.query(subSubQuery, { replacements: subcategoryIds });

      // Group sub-subcategories by subcategory_id
      const subSubMap = {};
      allSubSub.forEach(ss => {
        if (!subSubMap[ss.subcategory_id]) {
          subSubMap[ss.subcategory_id] = [];
        }
        subSubMap[ss.subcategory_id].push(ss);
      });

      // Add sub-subcategories to subcategories
      subcategories.forEach(sub => {
        sub.subSubcategories = subSubMap[sub.id] || [];
      });
    } else {
      subcategories.forEach(sub => {
        sub.subSubcategories = [];
      });
    }

    res.json({ subcategories });
  } catch (error) {
    next(error);
  }
};

// Get sub-subcategories for a subcategory
exports.getSubSubcategories = async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM sub_subcategories WHERE subcategory_id = ? ORDER BY id ASC`;
    const [subSubcategories] = await sequelize.query(query, { replacements: [id] });
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

    // Check category exists
    const catQuery = `SELECT * FROM categories WHERE id = ?`;
    const [cats] = await sequelize.query(catQuery, { replacements: [id] });
    
    if (cats.length === 0) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    const category = cats[0];

    let orderBy = 'is_featured DESC, rating DESC';
    switch (sort) {
      case 'price_low': orderBy = 'price ASC'; break;
      case 'price_high': orderBy = 'price DESC'; break;
      case 'rating': orderBy = 'rating DESC'; break;
      case 'newest': orderBy = 'created_at DESC'; break;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Count products
    const countQuery = `SELECT COUNT(*) as total FROM products WHERE category_id = ? AND stock > 0`;
    const [countResult] = await sequelize.query(countQuery, { replacements: [id] });
    const count = countResult[0].total;

    // Get products
    const productsQuery = `
      SELECT * FROM products
      WHERE category_id = ? AND stock > 0
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;
    const [products] = await sequelize.query(productsQuery, {
      replacements: [id, parseInt(limit), offset]
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
    const query = `SELECT * FROM brands ORDER BY name ASC`;
    const [brands] = await sequelize.query(query);
    res.json({ brands });
  } catch (error) {
    next(error);
  }
};

// Get all colors
exports.getAllColors = async (req, res, next) => {
  try {
    const query = `SELECT * FROM colors ORDER BY name ASC`;
    const [colors] = await sequelize.query(query);
    res.json({ colors });
  } catch (error) {
    next(error);
  }
};
