
const orderService = require('../services/orderService');

async function createOrder(req, res) {
  try {
    // uid được lấy từ JWT middleware, không lấy từ request body
    const uid = req.user.uid;
    const { items } = req.body || {};

    const order = await orderService.createOrder(uid, items);

    return res.status(201).json({
      message: 'Tạo đơn hàng thành công',
      order
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message
      });
    }

    console.error('Create order error:', error);

    return res.status(500).json({
      message: 'Lỗi khi tạo đơn hàng'
    });
  }
}

module.exports = {
  createOrder
};