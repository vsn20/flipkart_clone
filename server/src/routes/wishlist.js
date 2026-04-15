const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const authMiddleware = require('../middleware/auth');

// All wishlist routes require authentication
router.use(authMiddleware);

router.get('/', wishlistController.getWishlist);
router.post('/add', wishlistController.addToWishlist);
router.get('/check/:productId', wishlistController.checkWishlist);
router.delete('/remove/:productId', wishlistController.removeFromWishlist);

module.exports = router;
