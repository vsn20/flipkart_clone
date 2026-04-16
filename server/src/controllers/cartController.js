const sequelize = require('../config/database');

// Get user's cart
exports.getCart = async (req, res, next) => {
  try {
    // Find or create cart
    const findCartQuery = `SELECT id FROM carts WHERE user_id = ?`;
    const [cartResults] = await sequelize.query(findCartQuery, { replacements: [req.user.id] });
    
    let cartId;
    if (cartResults.length === 0) {
      const createCartQuery = `INSERT INTO carts (user_id, created_at, updated_at) VALUES (?, NOW(), NOW())`;
      const [result] = await sequelize.query(createCartQuery, { replacements: [req.user.id] });
      cartId = result;
    } else {
      cartId = cartResults[0].id;
    }

    // Get cart items with product details
    const itemsQuery = `
      SELECT ci.id, ci.cart_id, ci.product_id, ci.quantity, 
             p.id as product_id, p.name, p.price, p.mrp, p.images, p.stock, p.brand, p.discount_percent
      FROM cart_items ci
      LEFT JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ?
    `;
    const [items] = await sequelize.query(itemsQuery, { replacements: [cartId] });

    // Calculate totals
    let totalMRP = 0;
    let totalPrice = 0;
    let itemCount = 0;

    items.forEach((item) => {
      if (item.product_id) {
        const qty = item.quantity;
        totalMRP += parseFloat(item.mrp) * qty;
        totalPrice += parseFloat(item.price) * qty;
        itemCount += qty;
      }
    });

    const totalDiscount = totalMRP - totalPrice;
    const deliveryCharges = totalPrice >= 500 ? 0 : 40;

    // Format items with product objects
    const formattedItems = items.map(item => ({
      id: item.id,
      quantity: item.quantity,
      product: {
        id: item.product_id,
        name: item.name,
        price: item.price,
        mrp: item.mrp,
        images: item.images,
        stock: item.stock,
        brand: item.brand,
        discount_percent: item.discount_percent,
      }
    }));

    res.json({
      cart: {
        id: cartId,
        user_id: req.user.id,
        items: formattedItems,
      },
      summary: {
        totalMRP: totalMRP.toFixed(2),
        totalPrice: totalPrice.toFixed(2),
        totalDiscount: totalDiscount.toFixed(2),
        deliveryCharges: deliveryCharges.toFixed(2),
        totalAmount: (totalPrice + deliveryCharges).toFixed(2),
        itemCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Add item to cart
exports.addToCart = async (req, res, next) => {
  try {
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) {
      return res.status(400).json({ message: 'Product ID is required.' });
    }

    // Check product exists and has stock
    const productQuery = `SELECT id, stock FROM products WHERE id = ?`;
    const [products] = await sequelize.query(productQuery, { replacements: [product_id] });
    
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const product = products[0];
    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock.' });
    }

    // Find or create cart
    const findCartQuery = `SELECT id FROM carts WHERE user_id = ?`;
    const [cartResults] = await sequelize.query(findCartQuery, { replacements: [req.user.id] });
    
    let cartId;
    if (cartResults.length === 0) {
      const createCartQuery = `INSERT INTO carts (user_id, created_at, updated_at) VALUES (?, NOW(), NOW())`;
      const [result] = await sequelize.query(createCartQuery, { replacements: [req.user.id] });
      cartId = result;
    } else {
      cartId = cartResults[0].id;
    }

    // Check if product already in cart
    const checkItemQuery = `SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?`;
    const [existingItems] = await sequelize.query(checkItemQuery, { replacements: [cartId, product_id] });

    if (existingItems.length > 0) {
      const newQty = existingItems[0].quantity + parseInt(quantity);
      if (newQty > product.stock) {
        return res.status(400).json({ message: 'Cannot add more. Exceeds available stock.' });
      }
      const updateQuery = `UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE id = ?`;
      await sequelize.query(updateQuery, { replacements: [newQty, existingItems[0].id] });
    } else {
      const insertQuery = `INSERT INTO cart_items (cart_id, product_id, quantity, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())`;
      await sequelize.query(insertQuery, { replacements: [cartId, product_id, parseInt(quantity)] });
    }

    // Return updated cart
    const itemsQuery = `
      SELECT ci.id, ci.cart_id, ci.product_id, ci.quantity, 
             p.id, p.name, p.price, p.mrp, p.images, p.stock, p.brand, p.discount_percent
      FROM cart_items ci
      LEFT JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ?
    `;
    const [updatedItems] = await sequelize.query(itemsQuery, { replacements: [cartId] });

    const formattedItems = updatedItems.map(item => ({
      id: item.id,
      quantity: item.quantity,
      product: {
        id: item.product_id,
        name: item.name,
        price: item.price,
        mrp: item.mrp,
        images: item.images,
        stock: item.stock,
        brand: item.brand,
        discount_percent: item.discount_percent,
      }
    }));

    res.status(201).json({
      message: 'Product added to cart!',
      cart: {
        id: cartId,
        user_id: req.user.id,
        items: formattedItems,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1.' });
    }

    // Find user's cart
    const cartQuery = `SELECT id FROM carts WHERE user_id = ?`;
    const [carts] = await sequelize.query(cartQuery, { replacements: [req.user.id] });
    
    if (carts.length === 0) {
      return res.status(404).json({ message: 'Cart not found.' });
    }

    const cartId = carts[0].id;

    // Get cart item with product
    const itemQuery = `
      SELECT ci.id, ci.quantity, p.stock
      FROM cart_items ci
      LEFT JOIN products p ON ci.product_id = p.id
      WHERE ci.id = ? AND ci.cart_id = ?
    `;
    const [cartItems] = await sequelize.query(itemQuery, { replacements: [itemId, cartId] });

    if (cartItems.length === 0) {
      return res.status(404).json({ message: 'Cart item not found.' });
    }

    if (quantity > cartItems[0].stock) {
      return res.status(400).json({ message: 'Exceeds available stock.' });
    }

    const updateQuery = `UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE id = ?`;
    await sequelize.query(updateQuery, { replacements: [parseInt(quantity), itemId] });

    // Fetch updated item
    const fetchQuery = `SELECT * FROM cart_items WHERE id = ?`;
    const [updatedItem] = await sequelize.query(fetchQuery, { replacements: [itemId] });

    res.json({ message: 'Cart updated.', cartItem: updatedItem[0] });
  } catch (error) {
    next(error);
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    // Find user's cart
    const cartQuery = `SELECT id FROM carts WHERE user_id = ?`;
    const [carts] = await sequelize.query(cartQuery, { replacements: [req.user.id] });
    
    if (carts.length === 0) {
      return res.status(404).json({ message: 'Cart not found.' });
    }

    const cartId = carts[0].id;

    // Check if item exists in user's cart
    const itemQuery = `SELECT id FROM cart_items WHERE id = ? AND cart_id = ?`;
    const [items] = await sequelize.query(itemQuery, { replacements: [itemId, cartId] });

    if (items.length === 0) {
      return res.status(404).json({ message: 'Cart item not found.' });
    }

    const deleteQuery = `DELETE FROM cart_items WHERE id = ?`;
    await sequelize.query(deleteQuery, { replacements: [itemId] });

    res.json({ message: 'Item removed from cart.' });
  } catch (error) {
    next(error);
  }
};

// Clear entire cart
exports.clearCart = async (req, res, next) => {
  try {
    // Find user's cart
    const cartQuery = `SELECT id FROM carts WHERE user_id = ?`;
    const [carts] = await sequelize.query(cartQuery, { replacements: [req.user.id] });
    
    if (carts.length === 0) {
      return res.status(404).json({ message: 'Cart not found.' });
    }

    const cartId = carts[0].id;

    const deleteQuery = `DELETE FROM cart_items WHERE cart_id = ?`;
    await sequelize.query(deleteQuery, { replacements: [cartId] });

    res.json({ message: 'Cart cleared.' });
  } catch (error) {
    next(error);
  }
};

// Get cart count (for navbar badge)
exports.getCartCount = async (req, res, next) => {
  try {
    const query = `
      SELECT COALESCE(SUM(ci.quantity), 0) as count
      FROM carts c
      LEFT JOIN cart_items ci ON c.id = ci.cart_id
      WHERE c.user_id = ?
    `;
    const [results] = await sequelize.query(query, { replacements: [req.user.id] });

    res.json({ count: results[0].count });
  } catch (error) {
    next(error);
  }
};
