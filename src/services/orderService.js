
const prisma = require('../lib/prisma');

class OrderError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = 'OrderError';
    this.statusCode = statusCode;
  }
}

async function createOrder(uid, items) {
  // 1. Kiểm tra danh sách sản phẩm
  if (!Array.isArray(items) || items.length === 0) {
    throw new OrderError('Đơn hàng phải có ít nhất một sản phẩm');
  }

  // 2. Kiểm tra dữ liệu từng sản phẩm
  for (const item of items) {
    if (
      !Number.isInteger(item.pid) ||
      item.pid <= 0 ||
      !Number.isInteger(item.qty) ||
      item.qty <= 0
    ) {
      throw new OrderError(
        'Mỗi sản phẩm phải có pid hợp lệ và qty là số nguyên dương'
      );
    }
  }

  // Tránh trùng sản phẩm vì OrderDetail dùng khóa chính oid + pid
  const productIds = items.map(item => item.pid);

  if (new Set(productIds).size !== productIds.length) {
    throw new OrderError(
      'Danh sách đơn hàng không được chứa sản phẩm trùng lặp'
    );
  }

  // 3. Thực hiện toàn bộ thao tác trong một transaction
  return prisma.$transaction(async tx => {
    // Kiểm tra người dùng tồn tại
    const user = await tx.user.findUnique({
      where: { uid },
      select: { uid: true }
    });

    if (!user) {
      throw new OrderError('Tài khoản không tồn tại', 404);
    }

    // Lấy thông tin sản phẩm và giá hiện tại từ database
    const products = await tx.product.findMany({
      where: {
        pid: { in: productIds }
      }
    });

    if (products.length !== items.length) {
      throw new OrderError('Có sản phẩm không tồn tại', 404);
    }

    const productMap = new Map(
      products.map(product => [product.pid, product])
    );

    // Kiểm tra tồn kho trước khi tạo đơn
    for (const item of items) {
      const product = productMap.get(item.pid);

      if (product.quantity < item.qty) {
        throw new OrderError(
          `Sản phẩm "${product.pname}" không đủ tồn kho. Còn: ${product.quantity}`
        );
      }
    }

    // Tạo đơn hàng
    const order = await tx.order.create({
      data: {
        uid
      }
    });

    // Trừ tồn kho có điều kiện để tránh bán vượt số lượng còn lại
    for (const item of items) {
      const result = await tx.product.updateMany({
        where: {
          pid: item.pid,
          quantity: { gte: item.qty }
        },
        data: {
          quantity: { decrement: item.qty }
        }
      });

      // Nếu tồn kho thay đổi bởi giao dịch khác, rollback toàn bộ
      if (result.count !== 1) {
        throw new OrderError(
          `Sản phẩm ID ${item.pid} không còn đủ tồn kho`
        );
      }
    }

    // Tạo chi tiết đơn hàng với giá lấy từ database
    await tx.orderDetail.createMany({
      data: items.map(item => {
        const product = productMap.get(item.pid);

        return {
          oid: order.oid,
          pid: item.pid,
          qty: item.qty,
          unit_price: product.price
        };
      })
    });

    // Tạo trạng thái giao hàng ban đầu
    await tx.shipment.create({
      data: {
        oid: order.oid,
        status: 'Pending'
      }
    });

    // Trả về đơn hàng cùng chi tiết và shipment
    return tx.order.findUnique({
      where: { oid: order.oid },
      include: {
        details: {
          include: {
            product: true
          }
        },
        shipments: true
      }
    });
  });
}


async function getOrderById(orderId, uid) {
  return prisma.order.findFirst({
    where: {
      oid: orderId,
      uid: uid
    },
    include: {
      details: {
        include: {
          product: true
        }
      },
      shipments: true
    }
  });
}

module.exports = {
  createOrder,
  OrderError,
  getOrderById
};