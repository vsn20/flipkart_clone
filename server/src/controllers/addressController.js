const sequelize = require('../config/database');

// Get all addresses for user
exports.getAddresses = async (req, res, next) => {
  try {
    const query = `SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC`;
    const [addresses] = await sequelize.query(query, { replacements: [req.user.id] });
    res.json({ addresses });
  } catch (error) {
    next(error);
  }
};

// Add new address
exports.addAddress = async (req, res, next) => {
  try {
    const { name, phone, pincode, locality, address, city, state, landmark, address_type } = req.body;

    if (!name || !phone || !pincode || !address || !city || !state) {
      return res.status(400).json({ message: 'Name, phone, pincode, address, city, and state are required.' });
    }

    // Check if this is the first address for user
    const countQuery = `SELECT COUNT(*) as count FROM addresses WHERE user_id = ?`;
    const [countResult] = await sequelize.query(countQuery, { replacements: [req.user.id] });
    const isFirstAddress = countResult[0].count === 0;

    // Insert new address
    const insertQuery = `INSERT INTO addresses (user_id, name, phone, pincode, locality, address, city, state, landmark, address_type, is_default, created_at, updated_at) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
    const [result] = await sequelize.query(insertQuery, {
      replacements: [req.user.id, name, phone, pincode, locality || null, address, city, state, landmark || null, address_type || 'home', isFirstAddress]
    });

    // Fetch the newly created address
    const fetchQuery = `SELECT * FROM addresses WHERE id = ?`;
    const [newAddress] = await sequelize.query(fetchQuery, { replacements: [result] });

    res.status(201).json({ message: 'Address added successfully.', address: newAddress[0] });
  } catch (error) {
    next(error);
  }
};

// Update address
exports.updateAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if address exists and belongs to user
    const checkQuery = `SELECT * FROM addresses WHERE id = ? AND user_id = ?`;
    const [existingAddr] = await sequelize.query(checkQuery, { replacements: [id, req.user.id] });

    if (existingAddr.length === 0) {
      return res.status(404).json({ message: 'Address not found.' });
    }

    const { name, phone, pincode, locality, address, city, state, landmark, address_type } = req.body;
    
    // Build dynamic UPDATE query
    const updates = [];
    const values = [];
    
    if (name) { updates.push('name = ?'); values.push(name); }
    if (phone) { updates.push('phone = ?'); values.push(phone); }
    if (pincode) { updates.push('pincode = ?'); values.push(pincode); }
    if (locality !== undefined) { updates.push('locality = ?'); values.push(locality || null); }
    if (address) { updates.push('address = ?'); values.push(address); }
    if (city) { updates.push('city = ?'); values.push(city); }
    if (state) { updates.push('state = ?'); values.push(state); }
    if (landmark !== undefined) { updates.push('landmark = ?'); values.push(landmark || null); }
    if (address_type) { updates.push('address_type = ?'); values.push(address_type); }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update.' });
    }

    updates.push('updated_at = NOW()');
    values.push(id, req.user.id);

    const updateQuery = `UPDATE addresses SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`;
    await sequelize.query(updateQuery, { replacements: values });

    // Fetch updated address
    const fetchQuery = `SELECT * FROM addresses WHERE id = ?`;
    const [updatedAddr] = await sequelize.query(fetchQuery, { replacements: [id] });

    res.json({ message: 'Address updated successfully.', address: updatedAddr[0] });
  } catch (error) {
    next(error);
  }
};

// Delete address
exports.deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Get address to check if it's default
    const checkQuery = `SELECT is_default FROM addresses WHERE id = ? AND user_id = ?`;
    const [addrResult] = await sequelize.query(checkQuery, { replacements: [id, req.user.id] });

    if (addrResult.length === 0) {
      return res.status(404).json({ message: 'Address not found.' });
    }

    const wasDefault = addrResult[0].is_default;

    // Delete the address
    const deleteQuery = `DELETE FROM addresses WHERE id = ? AND user_id = ?`;
    await sequelize.query(deleteQuery, { replacements: [id, req.user.id] });

    // If deleted address was default, set the next one as default
    if (wasDefault) {
      const nextQuery = `SELECT id FROM addresses WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`;
      const [nextAddr] = await sequelize.query(nextQuery, { replacements: [req.user.id] });
      
      if (nextAddr.length > 0) {
        const setDefaultQuery = `UPDATE addresses SET is_default = 1 WHERE id = ?`;
        await sequelize.query(setDefaultQuery, { replacements: [nextAddr[0].id] });
      }
    }

    res.json({ message: 'Address deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// Set default address
exports.setDefault = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Clear all defaults for this user
    const clearQuery = `UPDATE addresses SET is_default = 0 WHERE user_id = ?`;
    await sequelize.query(clearQuery, { replacements: [req.user.id] });

    // Check if address exists for user
    const checkQuery = `SELECT id FROM addresses WHERE id = ? AND user_id = ?`;
    const [addrResult] = await sequelize.query(checkQuery, { replacements: [id, req.user.id] });
    
    if (addrResult.length === 0) {
      return res.status(404).json({ message: 'Address not found.' });
    }

// Set the chosen address as default
    const setDefaultQuery = `UPDATE addresses SET is_default = 1 WHERE id = ?`;
    await sequelize.query(setDefaultQuery, { replacements: [id] });

    // Fetch updated address
    const fetchQuery = `SELECT * FROM addresses WHERE id = ?`;
    const [updatedAddr] = await sequelize.query(fetchQuery, { replacements: [id] });

    res.json({ message: 'Default address updated.', address: updatedAddr[0] });
  } catch (error) {
    next(error);
  }
};
