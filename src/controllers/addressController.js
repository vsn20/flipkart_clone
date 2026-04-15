const { Address } = require('../models');

// Get all addresses for user
exports.getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.findAll({
      where: { user_id: req.user.id },
      order: [['is_default', 'DESC'], ['createdAt', 'DESC']],
    });
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

    // If this is the first address, make it default
    const existingCount = await Address.count({ where: { user_id: req.user.id } });

    const newAddress = await Address.create({
      user_id: req.user.id,
      name,
      phone,
      pincode,
      locality: locality || null,
      address,
      city,
      state,
      landmark: landmark || null,
      address_type: address_type || 'home',
      is_default: existingCount === 0,
    });

    res.status(201).json({ message: 'Address added successfully.', address: newAddress });
  } catch (error) {
    next(error);
  }
};

// Update address
exports.updateAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const addr = await Address.findOne({ where: { id, user_id: req.user.id } });

    if (!addr) {
      return res.status(404).json({ message: 'Address not found.' });
    }

    const { name, phone, pincode, locality, address, city, state, landmark, address_type } = req.body;

    if (name) addr.name = name;
    if (phone) addr.phone = phone;
    if (pincode) addr.pincode = pincode;
    if (locality !== undefined) addr.locality = locality;
    if (address) addr.address = address;
    if (city) addr.city = city;
    if (state) addr.state = state;
    if (landmark !== undefined) addr.landmark = landmark;
    if (address_type) addr.address_type = address_type;

    await addr.save();

    res.json({ message: 'Address updated successfully.', address: addr });
  } catch (error) {
    next(error);
  }
};

// Delete address
exports.deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const addr = await Address.findOne({ where: { id, user_id: req.user.id } });

    if (!addr) {
      return res.status(404).json({ message: 'Address not found.' });
    }

    const wasDefault = addr.is_default;
    await addr.destroy();

    // If deleted address was default, set the next one as default
    if (wasDefault) {
      const nextAddr = await Address.findOne({
        where: { user_id: req.user.id },
        order: [['createdAt', 'DESC']],
      });
      if (nextAddr) {
        nextAddr.is_default = true;
        await nextAddr.save();
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
    await Address.update({ is_default: false }, { where: { user_id: req.user.id } });

    // Set the chosen address as default
    const addr = await Address.findOne({ where: { id, user_id: req.user.id } });
    if (!addr) {
      return res.status(404).json({ message: 'Address not found.' });
    }

    addr.is_default = true;
    await addr.save();

    res.json({ message: 'Default address updated.', address: addr });
  } catch (error) {
    next(error);
  }
};
