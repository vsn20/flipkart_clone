const { Order, OrderItem, Cart, CartItem, Product, User } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { sendOrderConfirmationEmail } = require('../services/emailService');

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

    // Get user's cart with items
    const cart = await Cart.findOne({
      where: { user_id: req.user.id },
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }],
        },
      ],
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty.' });
    }

    // Check stock availability for all items
    for (const item of cart.items) {
      if (item.quantity > item.product.stock) {
        await t.rollback();
        return res.status(400).json({
          message: `Insufficient stock for ${item.product.name}. Available: ${item.product.stock}`,
        });
      }
    }

    // Calculate totals
    let totalMRP = 0;
    let totalPrice = 0;
    cart.items.forEach((item) => {
      totalMRP += parseFloat(item.product.mrp) * item.quantity;
      totalPrice += parseFloat(item.product.price) * item.quantity;
    });

    const totalDiscount = totalMRP - totalPrice;
    const deliveryCharges = totalPrice >= 500 ? 0 : 40;
    const totalAmount = totalPrice + deliveryCharges;

    // Generate order number
    const orderNumber = `FK${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Calculate SuperCoins earned (1 coin per ₹100 spent)
    const superCoinsEarned = Math.floor(totalPrice / 100);

    // Create order
    const order = await Order.create(
      {
        order_number: orderNumber,
        user_id: req.user.id,
        shipping_name,
        shipping_phone,
        shipping_address,
        shipping_city,
        shipping_state,
        shipping_pincode,
        total_amount: totalAmount,
        discount_amount: totalDiscount,
        delivery_charges: deliveryCharges,
        payment_method,
        status: 'confirmed',
        super_coins_earned: superCoinsEarned,
      },
      { transaction: t }
    );

    // Create order items and update stock
    for (const item of cart.items) {
      await OrderItem.create(
        {
          order_id: order.id,
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
          product_name: item.product.name,
          product_image: item.product.images && item.product.images.length > 0 ? item.product.images[0] : null,
        },
        { transaction: t }
      );

      // Reduce stock
      await Product.update(
        { stock: item.product.stock - item.quantity },
        { where: { id: item.product.id }, transaction: t }
      );
    }

    // Clear cart
    await CartItem.destroy({ where: { cart_id: cart.id }, transaction: t });

    // Update user's SuperCoins and order count
    const user = await User.findByPk(req.user.id);
    const newTotalOrders = (user.total_orders || 0) + 1;
    const newSuperCoins = (user.super_coins || 0) + superCoinsEarned;

    // Update Plus tier based on order count
    let plusTier = user.plus_tier;
    if (newTotalOrders >= 20) plusTier = 'gold';
    else if (newTotalOrders >= 10) plusTier = 'silver';

    await User.update(
      {
        total_orders: newTotalOrders,
        super_coins: newSuperCoins,
        plus_tier: plusTier,
      },
      { where: { id: req.user.id }, transaction: t }
    );

    await t.commit();

    // Fetch complete order
    const completeOrder = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: 'items' }],
    });

    // Send order confirmation email (fire-and-forget)
    if (user.email && !user.is_guest) {
      sendOrderConfirmationEmail(user.email, {
        order_number: orderNumber,
        items: cart.items.map(i => ({
          product_name: i.product.name,
          quantity: i.quantity,
          price: i.product.price,
          product_image: i.product.images && i.product.images.length > 0 ? i.product.images[0] : null,
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

    const product = await Product.findByPk(product_id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    if (quantity > product.stock) {
      return res.status(400).json({ message: `Insufficient stock. Available: ${product.stock}` });
    }

    const totalMRP = parseFloat(product.mrp) * quantity;
    const totalPrice = parseFloat(product.price) * quantity;
    const totalDiscount = totalMRP - totalPrice;
    const deliveryCharges = totalPrice >= 500 ? 0 : 40;
    const totalAmount = totalPrice + deliveryCharges;
    const orderNumber = `FK${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const superCoinsEarned = Math.floor(totalPrice / 100);

    const order = await Order.create({
      order_number: orderNumber, user_id: req.user.id,
      shipping_name, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_pincode,
      total_amount: totalAmount, discount_amount: totalDiscount, delivery_charges: deliveryCharges,
      payment_method, status: 'confirmed', super_coins_earned: superCoinsEarned,
    }, { transaction: t });

    await OrderItem.create({
      order_id: order.id, product_id: product.id, quantity,
      price: product.price, product_name: product.name,
      product_image: product.images?.[0] || null,
    }, { transaction: t });

    await Product.update({ stock: product.stock - quantity }, { where: { id: product.id }, transaction: t });

    const user = await User.findByPk(req.user.id);
    const newTotalOrders = (user.total_orders || 0) + 1;
    const newSuperCoins = (user.super_coins || 0) + superCoinsEarned;
    let plusTier = user.plus_tier;
    if (newTotalOrders >= 20) plusTier = 'gold';
    else if (newTotalOrders >= 10) plusTier = 'silver';

    await User.update({ total_orders: newTotalOrders, super_coins: newSuperCoins, plus_tier: plusTier },
      { where: { id: req.user.id }, transaction: t });

    await t.commit();

    const completeOrder = await Order.findByPk(order.id, { include: [{ model: OrderItem, as: 'items' }] });

    // Send order confirmation email (fire-and-forget)
    if (user.email && !user.is_guest) {
      sendOrderConfirmationEmail(user.email, {
        order_number: orderNumber,
        items: [{
          product_name: product.name,
          quantity,
          price: product.price,
          product_image: product.images?.[0] || null,
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

    const { count, rows: orders } = await Order.findAndCountAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'images'],
            },
          ],
        },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

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

    const order = await Order.findOne({
      where: { id, user_id: req.user.id },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'images', 'brand'],
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    res.json({ order });
  } catch (error) {
    next(error);
  }
};
