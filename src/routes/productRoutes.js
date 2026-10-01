const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');


function validateProduct({ pname, price, quantity }) {
  if (
    typeof pname !== 'string' ||
    pname.trim().length < 1 ||
    pname.trim().length > 100
  ) {
    return 'Tên sản phẩm phải từ 1 đến 100 ký tự';
  }

  const validPrice =
    (typeof price === 'number' ||
      (typeof price === 'string' && price.trim() !== '')) &&
    Number.isFinite(Number(price)) &&
    Number(price) > 0 &&
    Number(price) < 100000000;

  if (!validPrice) {
    return 'Giá phải là số lớn hơn 0 và nhỏ hơn 100000000';
  }

  if (
    typeof quantity !== 'number' ||
    !Number.isInteger(quantity) ||
    quantity < 0 ||
    quantity > 2147483647
  ) {
    return 'Số lượng phải là số nguyên không âm hợp lệ';
  }

  return null;
}

function handlePrismaError(res, error, fallbackMessage) {
  console.error(error);

  if (error.code === 'P2003') {
    return res.status(409).json({
      message: 'Không thể thực hiện thao tác vì dữ liệu đang được tham chiếu'
    });
  }

  if (error.code === 'P2025') {
    return res.status(404).json({
      message: 'Không tìm thấy dữ liệu cần thao tác'
    });
  }

  return res.status(500).json({
    message: fallbackMessage
  });
}

// GET /products: Lấy danh sách sản phẩm
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany();

    res.status(200).json(products);
  } catch (error) { 
    return handlePrismaError(res, error, 'Lỗi khi lấy danh sách sản phẩm');
  }
});

// GET /products/:id: Lấy chi tiết sản phẩm
router.get('/:id', async (req, res) => {
  try {
    const pid = Number(req.params.id);

    if (!Number.isInteger(pid) || pid <= 0) {
      return res.status(400).json({ message: 'ID sản phẩm không hợp lệ' });
    }

    const product = await prisma.product.findUnique({
      where: { pid }
    });

    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    res.status(200).json(product);
  } catch (error) { 
    return handlePrismaError(res, error, 'Lỗi khi lấy chi tiết sản phẩm');
  }
});

// POST /products: Tạo sản phẩm mới
router.post('/', async (req, res) => {
  try {
    const { pname, price, quantity } = req.body;

    const validationError = validateProduct({ pname, price, quantity });

    if (validationError) {
        return res.status(400).json({
            message: validationError
        });
    }

    const product = await prisma.product.create({
      data: {
        pname: pname.trim(),
        price: Number(price),
        quantity
      }
    });

    res.status(201).json(product);
  } catch (error) { 
    return handlePrismaError(res, error, 'Lỗi khi tạo sản phẩm');
  }
});

// PUT /products/:id: Cập nhật sản phẩm
router.put('/:id', async (req, res) => {
  try {
    const pid = Number(req.params.id);
    const { pname, price, quantity } = req.body;

    if (!Number.isInteger(pid) || pid <= 0) {
      return res.status(400).json({ message: 'ID sản phẩm không hợp lệ' });
    }

    const validationError = validateProduct({ pname, price, quantity });

    if (validationError) {
        return res.status(400).json({
            message: validationError
        });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { pid }
    });

    if (!existingProduct) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    const product = await prisma.product.update({
      where: { pid },
      data: {
        pname: pname.trim(),
        price: Number(price),
        quantity
      }
    });

    res.status(200).json(product);
  } catch (error) { 
    return handlePrismaError(res, error, 'Lỗi khi cập nhật sản phẩm');
  }
});

// DELETE /products/:id: Xóa sản phẩm
router.delete('/:id', async (req, res) => {
  try {
    const pid = Number(req.params.id);

    if (!Number.isInteger(pid) || pid <= 0) {
      return res.status(400).json({ message: 'ID sản phẩm không hợp lệ' });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { pid }
    });

    if (!existingProduct) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    await prisma.product.delete({
      where: { pid }
    });

    res.status(200).json({ message: 'Xóa sản phẩm thành công' });
  } catch (error) { 
    return handlePrismaError(res, error, 'Lỗi khi xóa sản phẩm');
  }
});

module.exports = router;