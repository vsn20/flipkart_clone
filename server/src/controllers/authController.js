const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sequelize = require('../config/database');

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

    // Check if email already exists
    const checkQuery = `SELECT id FROM users WHERE email = ?`;
    const [existingUser] = await sequelize.query(checkQuery, { replacements: [email] });
    
    if (existingUser.length > 0) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert user
    const insertUserQuery = `INSERT INTO users (name, email, password, phone, auth_provider, created_at, updated_at) 
                             VALUES (?, ?, ?, ?, 'local', NOW(), NOW())`;
    const [userResult] = await sequelize.query(insertUserQuery, {
      replacements: [name, email, hashedPassword, phone || null]
    });

    const userId = userResult;

    // Create cart for new user
    const createCartQuery = `INSERT INTO carts (user_id, created_at, updated_at) VALUES (?, NOW(), NOW())`;
    await sequelize.query(createCartQuery, { replacements: [userId] });

    // Create wishlist for new user
    const createWishlistQuery = `INSERT INTO wishlists (user_id, created_at, updated_at) VALUES (?, NOW(), NOW())`;
    await sequelize.query(createWishlistQuery, { replacements: [userId] });

    // Fetch created user
    const fetchUserQuery = `SELECT id, name, email, phone, super_coins, plus_tier, avatar_url FROM users WHERE id = ?`;
    const [users] = await sequelize.query(fetchUserQuery, { replacements: [userId] });
    const user = users[0];

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

    // Find user by email
    const query = `SELECT * FROM users WHERE email = ?`;
    const [users] = await sequelize.query(query, { replacements: [email] });
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = users[0];

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

    // Find user by email
    const findQuery = `SELECT * FROM users WHERE email = ?`;
    const [users] = await sequelize.query(findQuery, { replacements: [email] });

    let user;
    let userId;

    if (users.length === 0) {
      // Create new user
      const insertQuery = `INSERT INTO users (name, email, auth_provider, avatar_url, created_at, updated_at) 
                           VALUES (?, ?, 'google', ?, NOW(), NOW())`;
      const [result] = await sequelize.query(insertQuery, {
        replacements: [name || email.split('@')[0], email, avatar_url || null]
      });

      userId = result;

      // Create cart
      const createCartQuery = `INSERT INTO carts (user_id, created_at, updated_at) VALUES (?, NOW(), NOW())`;
      await sequelize.query(createCartQuery, { replacements: [userId] });

      // Create wishlist
      const createWishlistQuery = `INSERT INTO wishlists (user_id, created_at, updated_at) VALUES (?, NOW(), NOW())`;
      await sequelize.query(createWishlistQuery, { replacements: [userId] });

      // Fetch created user
      const fetchQuery = `SELECT * FROM users WHERE id = ?`;
      const [newUsers] = await sequelize.query(fetchQuery, { replacements: [userId] });
      user = newUsers[0];
    } else {
      user = users[0];
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

    // Insert guest user
    const insertQuery = `INSERT INTO users (name, email, is_guest, auth_provider, created_at, updated_at) 
                         VALUES (?, ?, true, 'guest', NOW(), NOW())`;
    const [userResult] = await sequelize.query(insertQuery, {
      replacements: ['Guest User', `${guestId}@guest.flipkart.com`]
    });

    const userId = userResult;

    // Create cart for guest user
    const cartQuery = `INSERT INTO carts (user_id, created_at, updated_at) VALUES (?, NOW(), NOW())`;
    await sequelize.query(cartQuery, { replacements: [userId] });

    // Create wishlist for guest user
    const wishlistQuery = `INSERT INTO wishlists (user_id, created_at, updated_at) VALUES (?, NOW(), NOW())`;
    await sequelize.query(wishlistQuery, { replacements: [userId] });

    // Fetch guest user
    const fetchQuery = `SELECT id, name, email, super_coins, plus_tier FROM users WHERE id = ?`;
    const [user] = await sequelize.query(fetchQuery, { replacements: [userId] });

    const token = generateToken(user[0]);

    res.status(201).json({
      message: 'Guest login successful!',
      token,
      user: {
        id: user[0].id,
        name: user[0].name,
        email: user[0].email,
        super_coins: user[0].super_coins,
        plus_tier: user[0].plus_tier,
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
    const query = `SELECT id, name, email, phone, address, gender, super_coins, plus_tier, total_orders, is_guest, auth_provider, avatar_url, created_at, updated_at FROM users WHERE id = ?`;
    const [user] = await sequelize.query(query, { replacements: [req.user.id] });

    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ user: user[0] });
  } catch (error) {
    next(error);
  }
};

// Update profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, gender } = req.body;

    // Check if user exists
    const checkQuery = `SELECT id FROM users WHERE id = ?`;
    const [userCheck] = await sequelize.query(checkQuery, { replacements: [req.user.id] });
    
    if (userCheck.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Build dynamic UPDATE query
    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (phone !== undefined) {
      updateFields.push('phone = ?');
      updateValues.push(phone);
    }
    if (address !== undefined) {
      updateFields.push('address = ?');
      updateValues.push(address);
    }
    if (gender !== undefined) {
      updateFields.push('gender = ?');
      updateValues.push(gender);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update.' });
    }

    updateFields.push('updated_at = NOW()');
    updateValues.push(req.user.id);

    const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    await sequelize.query(updateQuery, { replacements: updateValues });

    // Fetch updated user
    const fetchQuery = `SELECT id, name, email, phone, address, gender, super_coins, plus_tier, total_orders, avatar_url FROM users WHERE id = ?`;
    const [updatedUser] = await sequelize.query(fetchQuery, { replacements: [req.user.id] });

    res.json({
      message: 'Profile updated successfully.',
      user: updatedUser[0],
    });
  } catch (error) {
    next(error);
  }
};
