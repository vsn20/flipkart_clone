const sequelize = require('../config/database');
const { sendOrderConfirmationEmail } = require('../services/emailService');

// Helper function to safely parse product images
const getProductImage = (images) => {
  if (!images) return null;
  try {
    // If it's a JSON string array, parse it
    const parsed = JSON.parse(images);
    return Array.isArray(parsed) ? parsed[0] : parsed;
  } catch (e) {
    // If it fails, assume it's a direct URL string
    return typeof images === 'string' ? images : null;
  }
};

// Place a new order
exports.placeOrder = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const {
      shipping_name,
      shipping_phone,
      shipping_address,
      shipping_city,
      shipping_state,
      shipping_pincode,
      payment_method = 'COD',
    } = req.body;

    // Validate required fields
    if (!shipping_name || !shipping_phone || !shipping_address || !shipping_city || !shipping_state || !shipping_pincode) {
      return res.status(400).json({ message: 'All shipping details are required.' });
    }

    // Get user's cart ID
    const cartQuery = `SELECT id FROM carts WHERE user_id = ?`;
    const [cartResults] = await sequelize.query(cartQuery, { 
      replacements: [req.user.id],
      transaction: t
    });

    if (cartResults.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: 'Cart not found.' });
    }

    const cartId = cartResults[0].id;

    // Get cart items with product details
    const itemsQuery = `
      SELECT ci.id, ci.quantity, p.id as product_id, p.name, p.price, p.mrp, p.images, p.stock
      FROM cart_items ci
      LEFT JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ?
    `;
    const [cartItems] = await sequelize.query(itemsQuery, { 
      replacements: [cartId],
      transaction: t
    });

    if (cartItems.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: 'Cart is empty.' });
    }

    // Check stock availability for all items
    for (const item of cartItems) {
      if (item.quantity > item.stock) {
        await t.rollback();
        return res.status(400).json({
          message: `Insufficient stock for ${item.name}. Available: ${item.stock}`,
        });
      }
    }

    // Calculate totals
    let totalMRP = 0;
    let totalPrice = 0;
    cartItems.forEach((item) => {
      totalMRP += parseFloat(item.mrp) * item.quantity;
      totalPrice += parseFloat(item.price) * item.quantity;
    });

    const totalDiscount = totalMRP - totalPrice;
    const deliveryCharges = totalPrice >= 500 ? 0 : 40;
    const totalAmount = totalPrice + deliveryCharges;

    // Generate order number
    const orderNumber = `FK${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Calculate SuperCoins earned (1 coin per ₹100 spent)
    const superCoinsEarned = Math.floor(totalPrice / 100);

    // Create order
    const createOrderQuery = `
      INSERT INTO orders 
      (order_number, user_id, shipping_name, shipping_phone, shipping_address, 
       shipping_city, shipping_state, shipping_pincode, total_amount, discount_amount, 
       delivery_charges, payment_method, status, super_coins_earned, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, NOW(), NOW())
    `;
    const [orderResult] = await sequelize.query(createOrderQuery, {
      replacements: [orderNumber, req.user.id, shipping_name, shipping_phone, shipping_address,
                     shipping_city, shipping_state, shipping_pincode, totalAmount, totalDiscount,
                     deliveryCharges, payment_method, superCoinsEarned],
      transaction: t
    });

    const orderId = orderResult;

    // Create order items and update stock
    for (const item of cartItems) {
      const createItemQuery = `
        INSERT INTO order_items (order_id, product_id, quantity, price, product_name, product_image, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;
      const productImage = getProductImage(item.images);
      await sequelize.query(createItemQuery, {
        replacements: [orderId, item.product_id, item.quantity, item.price, item.name, productImage],
        transaction: t
      });

      // Reduce stock
      const updateStockQuery = `UPDATE products SET stock = stock - ? WHERE id = ?`;
      await sequelize.query(updateStockQuery, {
        replacements: [item.quantity, item.product_id],
        transaction: t
      });
    }

    // Clear cart
    const clearCartQuery = `DELETE FROM cart_items WHERE cart_id = ?`;
    await sequelize.query(clearCartQuery, {
      replacements: [cartId],
      transaction: t
    });

    // Get user's current data
    const userQuery = `SELECT email, is_guest, total_orders, super_coins, plus_tier FROM users WHERE id = ?`;
    const [userResults] = await sequelize.query(userQuery, {
      replacements: [req.user.id],
      transaction: t
    });

    const user = userResults[0];
    const newTotalOrders = (user.total_orders || 0) + 1;
    const newSuperCoins = (user.super_coins || 0) + superCoinsEarned;

    // Update Plus tier based on order count
    let plusTier = user.plus_tier;
    if (newTotalOrders >= 20) plusTier = 'gold';
    else if (newTotalOrders >= 10) plusTier = 'silver';

    // Update user
    const updateUserQuery = `
      UPDATE users SET total_orders = ?, super_coins = ?, plus_tier = ?, updated_at = NOW()
      WHERE id = ?
    `;
    await sequelize.query(updateUserQuery, {
      replacements: [newTotalOrders, newSuperCoins, plusTier, req.user.id],
      transaction: t
    });

    await t.commit();

    // Fetch complete order
    const fetchOrderQuery = `
      SELECT o.*, oi.id as item_id, oi.product_id, oi.quantity, oi.price, oi.product_name, oi.product_image
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = ?
    `;
    const [orderData] = await sequelize.query(fetchOrderQuery, { replacements: [orderId] });

    // Format order response
    const orderItems = orderData.map(row => ({
      id: row.item_id,
      order_id: row.id,
      product_id: row.product_id,
      quantity: row.quantity,
      price: row.price,
      product_name: row.product_name,
      product_image: row.product_image,
    })).filter(item => item.id);

    const order = orderData[0];
    const completeOrder = {
      id: order.id,
      order_number: order.order_number,
      user_id: order.user_id,
      total_amount: order.total_amount,
      discount_amount: order.discount_amount,
      delivery_charges: order.delivery_charges,
      payment_method: order.payment_method,
      status: order.status,
      shipping_name: order.shipping_name,
      shipping_phone: order.shipping_phone,
      shipping_address: order.shipping_address,
      shipping_city: order.shipping_city,
      shipping_state: order.shipping_state,
      shipping_pincode: order.shipping_pincode,
      super_coins_earned: order.super_coins_earned,
      created_at: order.created_at,
      items: orderItems,
    };

    // Send order confirmation email (fire-and-forget)
    if (user.email && !user.is_guest) {
      sendOrderConfirmationEmail(user.email, {
        order_number: orderNumber,
        items: cartItems.map(i => ({
          product_name: i.name,
          quantity: i.quantity,
          price: i.price,
          product_image: getProductImage(i.images),
        })),
        total_amount: totalAmount,
        discount_amount: totalDiscount,
        delivery_charges: deliveryCharges,
        shipping_name, shipping_phone, shipping_address,
        shipping_city, shipping_state, shipping_pincode,
        payment_method,
      }).catch(err => console.error('Email send error:', err));
    }

    res.status(201).json({
      message: 'Order placed successfully!',
      order: completeOrder,
      superCoinsEarned,
      newSuperCoinsBalance: newSuperCoins,
      plusTier,
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

// Place a direct order (Buy Now – bypasses cart)
exports.placeDirectOrder = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const {
      shipping_name, shipping_phone, shipping_address,
      shipping_city, shipping_state, shipping_pincode,
      payment_method = 'COD', product_id, quantity = 1,
    } = req.body;

    if (!shipping_name || !shipping_phone || !shipping_address || !shipping_city || !shipping_state || !shipping_pincode) {
      return res.status(400).json({ message: 'All shipping details are required.' });
    }
    if (!product_id) {
      return res.status(400).json({ message: 'product_id is required.' });
    }

    // Get product
    const productQuery = `SELECT id, name, price, mrp, images, stock FROM products WHERE id = ?`;
    const [products] = await sequelize.query(productQuery, {
      replacements: [product_id],
      transaction: t
    });

    if (products.length === 0) {
      await t.rollback();
      return res.status(404).json({ message: 'Product not found.' });
    }

    const product = products[0];
    if (quantity > product.stock) {
      await t.rollback();
      return res.status(400).json({ message: `Insufficient stock. Available: ${product.stock}` });
    }

    const totalMRP = parseFloat(product.mrp) * quantity;
    const totalPrice = parseFloat(product.price) * quantity;
    const totalDiscount = totalMRP - totalPrice;
    const deliveryCharges = totalPrice >= 500 ? 0 : 40;
    const totalAmount = totalPrice + deliveryCharges;
    const orderNumber = `FK${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const superCoinsEarned = Math.floor(totalPrice / 100);

    // Create order
    const createOrderQuery = `
      INSERT INTO orders 
      (order_number, user_id, shipping_name, shipping_phone, shipping_address,
       shipping_city, shipping_state, shipping_pincode, total_amount, discount_amount,
       delivery_charges, payment_method, status, super_coins_earned, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, NOW(), NOW())
    `;
    const [orderResult] = await sequelize.query(createOrderQuery, {
      replacements: [orderNumber, req.user.id, shipping_name, shipping_phone, shipping_address,
                     shipping_city, shipping_state, shipping_pincode, totalAmount, totalDiscount,
                     deliveryCharges, payment_method, superCoinsEarned],
      transaction: t
    });

    const orderId = orderResult;

    // Create order item
    const createItemQuery = `
      INSERT INTO order_items (order_id, product_id, quantity, price, product_name, product_image, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const productImage = getProductImage(product.images);
    await sequelize.query(createItemQuery, {
      replacements: [orderId, product.id, quantity, product.price, product.name, productImage],
      transaction: t
    });

    // Update stock
    const updateStockQuery = `UPDATE products SET stock = stock - ? WHERE id = ?`;
    await sequelize.query(updateStockQuery, {
      replacements: [quantity, product.id],
      transaction: t
    });

    // Get user data
    const userQuery = `SELECT email, is_guest, total_orders, super_coins, plus_tier FROM users WHERE id = ?`;
    const [userResults] = await sequelize.query(userQuery, {
      replacements: [req.user.id],
      transaction: t
    });

    const user = userResults[0];
    const newTotalOrders = (user.total_orders || 0) + 1;
    const newSuperCoins = (user.super_coins || 0) + superCoinsEarned;
    let plusTier = user.plus_tier;
    if (newTotalOrders >= 20) plusTier = 'gold';
    else if (newTotalOrders >= 10) plusTier = 'silver';

    // Update user
    const updateUserQuery = `
      UPDATE users SET total_orders = ?, super_coins = ?, plus_tier = ?, updated_at = NOW()
      WHERE id = ?
    `;
    await sequelize.query(updateUserQuery, {
      replacements: [newTotalOrders, newSuperCoins, plusTier, req.user.id],
      transaction: t
    });

    await t.commit();

    // Fetch complete order
    const fetchOrderQuery = `
      SELECT o.*, oi.id as item_id, oi.product_id, oi.quantity, oi.price, oi.product_name, oi.product_image
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = ?
    `;
    const [orderData] = await sequelize.query(fetchOrderQuery, { replacements: [orderId] });

    const orderItems = orderData.map(row => ({
      id: row.item_id,
      order_id: row.id,
      product_id: row.product_id,
      quantity: row.quantity,
      price: row.price,
      product_name: row.product_name,
      product_image: row.product_image,
    })).filter(item => item.id);

    const order = orderData[0];
    const completeOrder = {
      id: order.id,
      order_number: order.order_number,
      user_id: order.user_id,
      total_amount: order.total_amount,
      discount_amount: order.discount_amount,
      delivery_charges: order.delivery_charges,
      payment_method: order.payment_method,
      status: order.status,
      shipping_name: order.shipping_name,
      shipping_phone: order.shipping_phone,
      shipping_address: order.shipping_address,
      shipping_city: order.shipping_city,
      shipping_state: order.shipping_state,
      shipping_pincode: order.shipping_pincode,
      super_coins_earned: order.super_coins_earned,
      created_at: order.created_at,
      items: orderItems,
    };

    // Send order confirmation email (fire-and-forget)
    if (user.email && !user.is_guest) {
      sendOrderConfirmationEmail(user.email, {
        order_number: orderNumber,
        items: [{
          product_name: product.name,
          quantity,
          price: product.price,
          product_image: getProductImage(product.images),
        }],
        total_amount: totalAmount,
        discount_amount: totalDiscount,
        delivery_charges: deliveryCharges,
        shipping_name, shipping_phone, shipping_address,
        shipping_city, shipping_state, shipping_pincode,
        payment_method,
      }).catch(err => console.error('Email send error:', err));
    }

    res.status(201).json({ message: 'Order placed successfully!', order: completeOrder, superCoinsEarned });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

// Get user's order history
exports.getOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Count total orders
    const countQuery = `SELECT COUNT(*) as total FROM orders WHERE user_id = ?`;
    const [countResult] = await sequelize.query(countQuery, { replacements: [req.user.id] });
    const count = countResult[0].total;

    // Get orders with items
    const ordersQuery = `
      SELECT o.*, oi.id as item_id, oi.product_id, oi.quantity, oi.price, oi.product_name, oi.product_image
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [orderRows] = await sequelize.query(ordersQuery, {
      replacements: [req.user.id, parseInt(limit), offset]
    });

    // Group rows by order
    const ordersMap = {};
    orderRows.forEach(row => {
      if (!ordersMap[row.id]) {
        ordersMap[row.id] = {
          id: row.id,
          order_number: row.order_number,
          user_id: row.user_id,
          total_amount: row.total_amount,
          discount_amount: row.discount_amount,
          delivery_charges: row.delivery_charges,
          payment_method: row.payment_method,
          status: row.status,
          shipping_name: row.shipping_name,
          shipping_phone: row.shipping_phone,
          shipping_address: row.shipping_address,
          shipping_city: row.shipping_city,
          shipping_state: row.shipping_state,
          shipping_pincode: row.shipping_pincode,
          created_at: row.created_at,
          updated_at: row.updated_at,
          items: []
        };
      }
      if (row.item_id) {
        ordersMap[row.id].items.push({
          id: row.item_id,
          order_id: row.id,
          product_id: row.product_id,
          quantity: row.quantity,
          price: row.price,
          product_name: row.product_name,
          product_image: row.product_image,
        });
      }
    });

    const orders = Object.values(ordersMap);

    res.json({
      orders,
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

// Get single order by ID
exports.getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const orderQuery = `
      SELECT o.*, oi.id as item_id, oi.product_id, oi.quantity, oi.price, oi.product_name, oi.product_image,
             p.name, p.images, p.brand
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.id = ? AND o.user_id = ?
    `;
    const [orderRows] = await sequelize.query(orderQuery, { replacements: [id, req.user.id] });

    if (orderRows.length === 0) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Format order
    const firstRow = orderRows[0];
    const order = {
      id: firstRow.id,
      order_number: firstRow.order_number,
      user_id: firstRow.user_id,
      total_amount: firstRow.total_amount,
      discount_amount: firstRow.discount_amount,
      delivery_charges: firstRow.delivery_charges,
      payment_method: firstRow.payment_method,
      status: firstRow.status,
      shipping_name: firstRow.shipping_name,
      shipping_phone: firstRow.shipping_phone,
      shipping_address: firstRow.shipping_address,
      shipping_city: firstRow.shipping_city,
      shipping_state: firstRow.shipping_state,
      shipping_pincode: firstRow.shipping_pincode,
      created_at: firstRow.created_at,
      updated_at: firstRow.updated_at,
      items: orderRows
        .filter(row => row.item_id)
        .map(row => ({
          id: row.item_id,
          order_id: row.id,
          product_id: row.product_id,
          quantity: row.quantity,
          price: row.price,
          product_name: row.product_name,
          product_image: row.product_image,
          product: {
            id: row.product_id,
            name: row.name,
            images: row.images,
            brand: row.brand,
          }
        }))
    };

    res.json({ order });
  } catch (error) {
    next(error);
  }
};
