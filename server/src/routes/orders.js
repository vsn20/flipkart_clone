const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');

// All order routes require authentication
router.use(authMiddleware);

router.post('/', orderController.placeOrder);
router.post('/direct', orderController.placeDirectOrder);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);

module.exports = router;
