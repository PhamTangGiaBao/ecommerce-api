
const express = require('express');

const orderController = require('../controllers/orderController');

const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, orderController.createOrder);
router.get('/:id', authMiddleware, orderController.getOrderById);

// Xem chi tiết đơn hàng
router.get('/:id', authMiddleware, orderController.getOrderById);

module.exports = router;