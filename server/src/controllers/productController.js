const sequelize = require('../config/database');

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

    let whereConditions = ['p.stock > 0'];
    let params = [];

    // Search by name, brand, description, or category name
    if (search) {
      const searchTerm = `%${search}%`;
      whereConditions.push(`(p.name LIKE ? OR p.brand LIKE ? OR p.description LIKE ? OR c.name LIKE ? OR sub.name LIKE ?)`);
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Filter by category (ID or slug)
    if (category_id) {
      whereConditions.push('p.category_id = ?');
      params.push(category_id);
    } else if (category) {
      whereConditions.push('c.slug = ?');
      params.push(category);
    }

    // Filter by subcategory (ID or slug)
    if (subcategory_id) {
      whereConditions.push('p.subcategory_id = ?');
      params.push(subcategory_id);
    } else if (subcategory) {
      whereConditions.push('sub.slug = ?');
      params.push(subcategory);
    }

    // Filter by sub_subcategory (ID or slug)
    if (sub_subcategory_id) {
      whereConditions.push('p.sub_subcategory_id = ?');
      params.push(sub_subcategory_id);
    } else if (sub_subcategory) {
      whereConditions.push('subsub.slug = ?');
      params.push(sub_subcategory);
    }

    // Filter by brand (ID or name list)
    if (brand_id) {
      whereConditions.push('p.brand_id = ?');
      params.push(brand_id);
    } else if (brand) {
      const brands = brand.split(',');
      whereConditions.push(`p.brand IN (${brands.map(() => '?').join(',')})`);
      params.push(...brands);
    }

    // Filter by color
    if (color) {
      const colors = color.split(',');
      whereConditions.push(`p.color IN (${colors.map(() => '?').join(',')})`);
      params.push(...colors);
    }

    // Price range
    if (min_price) {
      whereConditions.push('p.price >= ?');
      params.push(parseFloat(min_price));
    }
    if (max_price) {
      whereConditions.push('p.price <= ?');
      params.push(parseFloat(max_price));
    }

    // Rating filter
    if (min_rating) {
      whereConditions.push('p.rating >= ?');
      params.push(parseFloat(min_rating));
    }

    // Featured filter
    if (featured === 'true') {
      whereConditions.push('p.is_featured = 1');
    }

    // Sort options
    let orderBy = 'p.is_featured DESC, p.rating DESC';
    switch (sort) {
      case 'price_low': orderBy = 'p.price ASC'; break;
      case 'price_high': orderBy = 'p.price DESC'; break;
      case 'rating': orderBy = 'p.rating DESC'; break;
      case 'newest': orderBy = 'p.created_at DESC'; break;
      case 'discount': orderBy = 'p.discount_percent DESC'; break;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Count total
    let countQuery = `
      SELECT COUNT(*) as total FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories sub ON p.subcategory_id = sub.id
      LEFT JOIN sub_subcategories subsub ON p.sub_subcategory_id = subsub.id
      WHERE ${whereConditions.join(' AND ')}
    `;
    
    const [countResult] = await sequelize.query(countQuery, { replacements: params });
    const count = countResult[0].total;

    // Get products
    let productsQuery = `
      SELECT p.*, 
             c.id as cat_id, c.name as cat_name, c.slug as cat_slug,
             sub.id as sub_id, sub.name as sub_name, sub.slug as sub_slug,
             subsub.id as subsub_id, subsub.name as subsub_name, subsub.slug as subsub_slug,
             b.id as brand_id, b.name as brand_name, b.slug as brand_slug, b.logo_url
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories sub ON p.subcategory_id = sub.id
      LEFT JOIN sub_subcategories subsub ON p.sub_subcategory_id = subsub.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    params.push(parseInt(limit), offset);
    const [products] = await sequelize.query(productsQuery, { replacements: params });

    // Format products
    const formattedProducts = products.map(p => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      brand_id: p.brand_id,
      price: p.price,
      mrp: p.mrp,
      discount_percent: p.discount_percent,
      rating: p.rating,
      review_count: p.review_count,
      images: p.images,
      stock: p.stock,
      is_featured: p.is_featured,
      category: { id: p.cat_id, name: p.cat_name, slug: p.cat_slug },
      subcategory: { id: p.sub_id, name: p.sub_name, slug: p.sub_slug },
      subSubcategory: { id: p.subsub_id, name: p.subsub_name, slug: p.subsub_slug },
      brandInfo: { id: p.brand_id, name: p.brand_name, slug: p.brand_slug, logo_url: p.logo_url },
    }));

    res.json({
      products: formattedProducts,
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

    // Get product with relations
    const productQuery = `
      SELECT p.*, 
             c.id as cat_id, c.name as cat_name, c.slug as cat_slug,
             sub.id as sub_id, sub.name as sub_name, sub.slug as sub_slug,
             subsub.id as subsub_id, subsub.name as subsub_name, subsub.slug as subsub_slug,
             b.id as brand_id, b.name as brand_name, b.slug as brand_slug, b.logo_url
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories sub ON p.subcategory_id = sub.id
      LEFT JOIN sub_subcategories subsub ON p.sub_subcategory_id = subsub.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.id = ?
    `;
    const [products] = await sequelize.query(productQuery, { replacements: [id] });

    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const product = products[0];
    const subcategoryId = product.sub_id || product.cat_id;

    // Get similar products (same category AND subcategory, but not necessarily same sub-subcategory)
    let similarQuery = `
      SELECT * FROM products
      WHERE id != ? AND stock > 0
      AND category_id = ? AND subcategory_id = ?
      ORDER BY rating DESC LIMIT 8
    `;
    const similarParams = [id, product.cat_id, product.sub_id];

    const [similarProducts] = await sequelize.query(similarQuery, { replacements: similarParams });

    const formattedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      brand: product.brand,
      brand_id: product.brand_id,
      price: product.price,
      mrp: product.mrp,
      discount_percent: product.discount_percent,
      rating: product.rating,
      review_count: product.review_count,
      images: product.images,
      stock: product.stock,
      color: product.color,
      category: { id: product.cat_id, name: product.cat_name, slug: product.cat_slug },
      subcategory: { id: product.sub_id, name: product.sub_name, slug: product.sub_slug },
      subSubcategory: { id: product.subsub_id, name: product.subsub_name, slug: product.subsub_slug },
      brandInfo: { id: product.brand_id, name: product.brand_name, slug: product.brand_slug, logo_url: product.logo_url },
    };

    res.json({ product: formattedProduct, similarProducts });
  } catch (error) {
    next(error);
  }
};

// Get featured/deal products
exports.getFeaturedProducts = async (req, res, next) => {
  try {
    // Featured products
    const featuredQuery = `
      SELECT p.*, c.id as cat_id, c.name as cat_name, c.slug as cat_slug,
             sub.id as sub_id, sub.name as sub_name, sub.slug as sub_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories sub ON p.subcategory_id = sub.id
      WHERE p.is_featured = 1 AND p.stock > 0
      ORDER BY p.rating DESC LIMIT 12
    `;
    const [featuredProducts] = await sequelize.query(featuredQuery);

    // Top deals
    const dealsQuery = `
      SELECT p.*, c.id as cat_id, c.name as cat_name, c.slug as cat_slug,
             sub.id as sub_id, sub.name as sub_name, sub.slug as sub_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories sub ON p.subcategory_id = sub.id
      WHERE p.discount_percent >= 20 AND p.stock > 0
      ORDER BY p.discount_percent DESC LIMIT 12
    `;
    const [topDeals] = await sequelize.query(dealsQuery);

    // Best sellers
    const sellersQuery = `
      SELECT p.*, c.id as cat_id, c.name as cat_name, c.slug as cat_slug,
             sub.id as sub_id, sub.name as sub_name, sub.slug as sub_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories sub ON p.subcategory_id = sub.id
      WHERE p.rating >= 4.0 AND p.stock > 0
      ORDER BY p.review_count DESC LIMIT 12
    `;
    const [bestSellers] = await sequelize.query(sellersQuery);

    res.json({ 
      featuredProducts: featuredProducts.slice(0, 12),
      topDeals: topDeals.slice(0, 12),
      bestSellers: bestSellers.slice(0, 12)
    });
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

    const searchTerm = `%${q}%`;
    const query = `
      SELECT DISTINCT id, name, brand FROM products
      WHERE (name LIKE ? OR brand LIKE ?) AND stock > 0
      LIMIT 8
    `;
    const [suggestions] = await sequelize.query(query, { replacements: [searchTerm, searchTerm] });

    res.json({ suggestions });
  } catch (error) {
    next(error);
  }
};

// Get brands – supports filtering by category/subcategory context
exports.getBrands = async (req, res, next) => {
  try {
    const { category_id, subcategory_id } = req.query;
    
    let query = `SELECT DISTINCT brand FROM products WHERE brand IS NOT NULL AND brand != ''`;
    const params = [];

    if (category_id) {
      query += ` AND category_id = ?`;
      params.push(category_id);
    }
    if (subcategory_id) {
      query += ` AND subcategory_id = ?`;
      params.push(subcategory_id);
    }

    query += ` ORDER BY brand ASC`;

    const [results] = await sequelize.query(query, { replacements: params });
    const brands = results.map(r => r.brand).filter(Boolean);
    
    res.json({ brands });
  } catch (error) {
    next(error);
  }
};

// Get available colors for a given filter context
exports.getColors = async (req, res, next) => {
  try {
    const { category_id, subcategory_id } = req.query;
    
    let query = `SELECT DISTINCT color FROM products WHERE color IS NOT NULL AND color != ''`;
    const params = [];

    if (category_id) {
      query += ` AND category_id = ?`;
      params.push(category_id);
    }
    if (subcategory_id) {
      query += ` AND subcategory_id = ?`;
      params.push(subcategory_id);
    }

    query += ` ORDER BY color ASC`;

    const [results] = await sequelize.query(query, { replacements: params });
    const colors = results.map(r => r.color).filter(Boolean);
    
    res.json({ colors });
  } catch (error) {
    next(error);
  }
};
