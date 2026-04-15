const { Wishlist, WishlistItem, Product } = require('../models');

// Get user's wishlist
exports.getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({
      where: { user_id: req.user.id },
      include: [
        {
          model: WishlistItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price', 'mrp', 'images', 'stock', 'brand', 'rating', 'discount_percent'],
            },
          ],
        },
      ],
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user_id: req.user.id });
      wishlist.items = [];
    }

    res.json({ wishlist });
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

    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    let wishlist = await Wishlist.findOne({ where: { user_id: req.user.id } });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user_id: req.user.id });
    }

    // Check if already in wishlist
    const existing = await WishlistItem.findOne({
      where: { wishlist_id: wishlist.id, product_id },
    });

    if (existing) {
      return res.status(409).json({ message: 'Product already in wishlist.' });
    }

    await WishlistItem.create({
      wishlist_id: wishlist.id,
      product_id,
    });

    res.status(201).json({ message: 'Added to wishlist!' });
  } catch (error) {
    next(error);
  }
};

// Remove from wishlist
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ where: { user_id: req.user.id } });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found.' });
    }

    const item = await WishlistItem.findOne({
      where: { wishlist_id: wishlist.id, product_id: productId },
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not in wishlist.' });
    }

    await item.destroy();

    res.json({ message: 'Removed from wishlist.' });
  } catch (error) {
    next(error);
  }
};

// Check if product is in wishlist
exports.checkWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ where: { user_id: req.user.id } });
    if (!wishlist) {
      return res.json({ inWishlist: false });
    }

    const item = await WishlistItem.findOne({
      where: { wishlist_id: wishlist.id, product_id: productId },
    });

    res.json({ inWishlist: !!item });
  } catch (error) {
    next(error);
  }
};
