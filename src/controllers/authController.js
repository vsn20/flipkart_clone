const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Cart, Wishlist } = require('../models');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || null,
      auth_provider: 'local',
    });

    // Create cart and wishlist for new user
    await Cart.create({ user_id: user.id });
    await Wishlist.create({ user_id: user.id });

    const token = generateToken(user);

    res.status(201).json({
      message: 'Registration successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        super_coins: user.super_coins,
        plus_tier: user.plus_tier,
        avatar_url: user.avatar_url,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!user.password) {
      return res.status(401).json({ message: 'This account uses Google login. Please sign in with Google.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        super_coins: user.super_coins,
        plus_tier: user.plus_tier,
        total_orders: user.total_orders,
        avatar_url: user.avatar_url,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Google OAuth Login/Register
exports.googleAuth = async (req, res, next) => {
  try {
    const { name, email, avatar_url } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    let user = await User.findOne({ where: { email } });

    if (!user) {
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        auth_provider: 'google',
        avatar_url: avatar_url || null,
      });

      // Create cart and wishlist
      await Cart.create({ user_id: user.id });
      await Wishlist.create({ user_id: user.id });
    }

    const token = generateToken(user);

    res.json({
      message: 'Google login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        super_coins: user.super_coins,
        plus_tier: user.plus_tier,
        total_orders: user.total_orders,
        avatar_url: user.avatar_url || avatar_url,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Guest Login
exports.guestLogin = async (req, res, next) => {
  try {
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const user = await User.create({
      name: 'Guest User',
      email: `${guestId}@guest.flipkart.com`,
      is_guest: true,
      auth_provider: 'guest',
    });

    // Create cart and wishlist
    await Cart.create({ user_id: user.id });
    await Wishlist.create({ user_id: user.id });

    const token = generateToken(user);

    res.status(201).json({
      message: 'Guest login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        super_coins: user.super_coins,
        plus_tier: user.plus_tier,
        is_guest: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

// Update profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, gender } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (gender !== undefined) user.gender = gender;

    await user.save();

    res.json({
      message: 'Profile updated successfully.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        gender: user.gender,
        super_coins: user.super_coins,
        plus_tier: user.plus_tier,
        total_orders: user.total_orders,
        avatar_url: user.avatar_url,
      },
    });
  } catch (error) {
    next(error);
  }
};
