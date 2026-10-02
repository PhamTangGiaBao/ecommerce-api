
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

async function getOrderById(req, res) {
  try {
    const uid = req.user.uid;
    const orderId = Number(req.params.id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        message: 'Mã đơn hàng không hợp lệ'
      });
    }

    const order = await orderService.getOrderById(orderId, uid);

    if (!order) {
      return res.status(404).json({
        message: 'Không tìm thấy đơn hàng'
      });
    }

    return res.status(200).json({ order });
  } catch (error) {
    console.error('Get order error:', error);

    return res.status(500).json({
      message: 'Lỗi khi lấy thông tin đơn hàng'
    });
  }
}

module.exports = {
  createOrder,
  getOrderById
};