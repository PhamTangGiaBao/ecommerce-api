
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// GET /products: Lấy danh sách sản phẩm
router.get('/', productController.getAll);

// GET /products/:id: Lấy chi tiết sản phẩm
router.get('/:id', productController.getById);

// POST /products: Tạo sản phẩm
router.post('/', productController.create);

// PUT /products/:id: Cập nhật sản phẩm
router.put('/:id', productController.update);

// DELETE /products/:id: Xóa sản phẩm
router.delete('/:id', productController.remove);

module.exports = router;