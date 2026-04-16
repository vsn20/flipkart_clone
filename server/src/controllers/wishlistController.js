const sequelize = require('../config/database');

// Get user's wishlist
exports.getWishlist = async (req, res, next) => {
  try {
    // Find or create wishlist
    const findQuery = `SELECT id FROM wishlists WHERE user_id = ?`;
    const [wishlistResults] = await sequelize.query(findQuery, { replacements: [req.user.id] });
    
    let wishlistId;
    if (wishlistResults.length === 0) {
      const createQuery = `INSERT INTO wishlists (user_id, created_at, updated_at) VALUES (?, NOW(), NOW())`;
      const [result] = await sequelize.query(createQuery, { replacements: [req.user.id] });
      wishlistId = result;
    } else {
      wishlistId = wishlistResults[0].id;
    }

    // Get wishlist items with product details
    const itemsQuery = `
      SELECT wi.id, wi.product_id, p.name, p.price, p.mrp, p.images, p.stock, p.brand, p.rating, p.discount_percent
      FROM wishlist_items wi
      LEFT JOIN products p ON wi.product_id = p.id
      WHERE wi.wishlist_id = ?
    `;
    const [items] = await sequelize.query(itemsQuery, { replacements: [wishlistId] });

    const formattedItems = items.map(item => ({
      id: item.id,
      product_id: item.product_id,
      product: {
        id: item.product_id,
        name: item.name,
        price: item.price,
        mrp: item.mrp,
        images: item.images,
        stock: item.stock,
        brand: item.brand,
        rating: item.rating,
        discount_percent: item.discount_percent,
      }
    }));

    res.json({
      wishlist: {
        id: wishlistId,
        user_id: req.user.id,
        items: formattedItems,
      }
    });
  } catch (error) {
    next(error);
  }
};

// Add to wishlist
exports.addToWishlist = async (req, res, next) => {
  try {
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({ message: 'Product ID is required.' });
    }

    // Check product exists
    const productQuery = `SELECT id FROM products WHERE id = ?`;
    const [products] = await sequelize.query(productQuery, { replacements: [product_id] });
    
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Find or create wishlist
    const findQuery = `SELECT id FROM wishlists WHERE user_id = ?`;
    const [wishlistResults] = await sequelize.query(findQuery, { replacements: [req.user.id] });
    
    let wishlistId;
    if (wishlistResults.length === 0) {
      const createQuery = `INSERT INTO wishlists (user_id, created_at, updated_at) VALUES (?, NOW(), NOW())`;
      const [result] = await sequelize.query(createQuery, { replacements: [req.user.id] });
      wishlistId = result;
    } else {
      wishlistId = wishlistResults[0].id;
    }

    // Check if already in wishlist
    const checkQuery = `SELECT id FROM wishlist_items WHERE wishlist_id = ? AND product_id = ?`;
    const [existing] = await sequelize.query(checkQuery, { replacements: [wishlistId, product_id] });

    if (existing.length > 0) {
      return res.status(409).json({ message: 'Product already in wishlist.' });
    }

    // Add to wishlist
    const addQuery = `
      INSERT INTO wishlist_items (wishlist_id, product_id, created_at, updated_at)
      VALUES (?, ?, NOW(), NOW())
    `;
    await sequelize.query(addQuery, { replacements: [wishlistId, product_id] });

    res.status(201).json({ message: 'Added to wishlist!' });
  } catch (error) {
    next(error);
  }
};

// Remove from wishlist
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // Get user's wishlist
    const findQuery = `SELECT id FROM wishlists WHERE user_id = ?`;
    const [wishlistResults] = await sequelize.query(findQuery, { replacements: [req.user.id] });
    
    if (wishlistResults.length === 0) {
      return res.status(404).json({ message: 'Wishlist not found.' });
    }

    const wishlistId = wishlistResults[0].id;

    // Check if item exists
    const checkQuery = `SELECT id FROM wishlist_items WHERE wishlist_id = ? AND product_id = ?`;
    const [items] = await sequelize.query(checkQuery, { replacements: [wishlistId, productId] });

    if (items.length === 0) {
      return res.status(404).json({ message: 'Item not in wishlist.' });
    }

    // Remove item
    const deleteQuery = `DELETE FROM wishlist_items WHERE wishlist_id = ? AND product_id = ?`;
    await sequelize.query(deleteQuery, { replacements: [wishlistId, productId] });

    res.json({ message: 'Removed from wishlist.' });
  } catch (error) {
    next(error);
  }
};

// Check if product is in wishlist
exports.checkWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // Get user's wishlist
    const findQuery = `SELECT id FROM wishlists WHERE user_id = ?`;
    const [wishlistResults] = await sequelize.query(findQuery, { replacements: [req.user.id] });
    
    if (wishlistResults.length === 0) {
      return res.json({ inWishlist: false });
    }

    const wishlistId = wishlistResults[0].id;

    // Check if product in wishlist
    const checkQuery = `SELECT id FROM wishlist_items WHERE wishlist_id = ? AND product_id = ?`;
    const [items] = await sequelize.query(checkQuery, { replacements: [wishlistId, productId] });

    res.json({ inWishlist: items.length > 0 });
  } catch (error) {
    next(error);
  }
};
