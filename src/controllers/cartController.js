const { Cart, CartItem, Product } = require('../models');

// Get user's cart
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({
      where: { user_id: req.user.id },
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price', 'mrp', 'images', 'stock', 'brand', 'discount_percent'],
            },
          ],
        },
      ],
    });

    if (!cart) {
      cart = await Cart.create({ user_id: req.user.id });
      cart.items = [];
    }

    // Calculate totals
    let totalMRP = 0;
    let totalPrice = 0;
    let totalDiscount = 0;
    let itemCount = 0;

    if (cart.items) {
      cart.items.forEach((item) => {
        const qty = item.quantity;
        totalMRP += parseFloat(item.product.mrp) * qty;
        totalPrice += parseFloat(item.product.price) * qty;
        itemCount += qty;
      });
      totalDiscount = totalMRP - totalPrice;
    }

    const deliveryCharges = totalPrice >= 500 ? 0 : 40;

    res.json({
      cart,
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

    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock.' });
    }

    let cart = await Cart.findOne({ where: { user_id: req.user.id } });
    if (!cart) {
      cart = await Cart.create({ user_id: req.user.id });
    }

    // Check if product already in cart
    let cartItem = await CartItem.findOne({
      where: { cart_id: cart.id, product_id },
    });

    if (cartItem) {
      const newQty = cartItem.quantity + parseInt(quantity);
      if (newQty > product.stock) {
        return res.status(400).json({ message: 'Cannot add more. Exceeds available stock.' });
      }
      cartItem.quantity = newQty;
      await cartItem.save();
    } else {
      cartItem = await CartItem.create({
        cart_id: cart.id,
        product_id,
        quantity: parseInt(quantity),
      });
    }

    // Return updated cart
    const updatedCart = await Cart.findOne({
      where: { user_id: req.user.id },
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price', 'mrp', 'images', 'stock', 'brand', 'discount_percent'],
            },
          ],
        },
      ],
    });

    res.status(201).json({
      message: 'Product added to cart!',
      cart: updatedCart,
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

    const cart = await Cart.findOne({ where: { user_id: req.user.id } });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found.' });
    }

    const cartItem = await CartItem.findOne({
      where: { id: itemId, cart_id: cart.id },
      include: [{ model: Product, as: 'product' }],
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found.' });
    }

    if (quantity > cartItem.product.stock) {
      return res.status(400).json({ message: 'Exceeds available stock.' });
    }

    cartItem.quantity = parseInt(quantity);
    await cartItem.save();

    res.json({ message: 'Cart updated.', cartItem });
  } catch (error) {
    next(error);
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ where: { user_id: req.user.id } });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found.' });
    }

    const cartItem = await CartItem.findOne({
      where: { id: itemId, cart_id: cart.id },
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found.' });
    }

    await cartItem.destroy();

    res.json({ message: 'Item removed from cart.' });
  } catch (error) {
    next(error);
  }
};

// Clear entire cart
exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ where: { user_id: req.user.id } });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found.' });
    }

    await CartItem.destroy({ where: { cart_id: cart.id } });

    res.json({ message: 'Cart cleared.' });
  } catch (error) {
    next(error);
  }
};

// Get cart count (for navbar badge)
exports.getCartCount = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ where: { user_id: req.user.id } });
    if (!cart) {
      return res.json({ count: 0 });
    }

    const items = await CartItem.findAll({ where: { cart_id: cart.id } });
    const count = items.reduce((sum, item) => sum + item.quantity, 0);

    res.json({ count });
  } catch (error) {
    next(error);
  }
};
