const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// GET /products: Lấy danh sách sản phẩm
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany();

    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách sản phẩm' });
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
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi lấy chi tiết sản phẩm' });
  }
});

// POST /products: Tạo sản phẩm mới
router.post('/', async (req, res) => {
  try {
    const { pname, price, quantity } = req.body;

    if (
      typeof pname !== 'string' ||
      pname.trim() === '' ||
      price === undefined ||
      !Number.isFinite(Number(price)) ||
      Number(price) <= 0 ||
      !Number.isInteger(quantity) ||
      quantity < 0
    ) {
      return res.status(400).json({
        message: 'Dữ liệu không hợp lệ: cần pname, price > 0 và quantity >= 0'
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
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi tạo sản phẩm' });
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

    if (
      typeof pname !== 'string' ||
      pname.trim() === '' ||
      price === undefined ||
      !Number.isFinite(Number(price)) ||
      Number(price) <= 0 ||
      !Number.isInteger(quantity) ||
      quantity < 0
    ) {
      return res.status(400).json({
        message: 'Dữ liệu không hợp lệ: cần pname, price > 0 và quantity >= 0'
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
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi cập nhật sản phẩm' });
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
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi xóa sản phẩm' });
  }
});

module.exports = router;