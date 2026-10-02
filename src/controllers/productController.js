
const productService = require('../services/productService');

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

function validateId(id) {
  const pid = Number(id);
  return Number.isInteger(pid) && pid > 0 ? pid : null;
}

async function getAll(req, res) {
  try {
    const products = await productService.getAllProducts();
    return res.status(200).json(products);
  } catch (error) {
    return handlePrismaError(
      res, error, 'Lỗi khi lấy danh sách sản phẩm'
    );
  }
}

async function getById(req, res) {
  try {
    const pid = validateId(req.params.id);

    if (pid === null) {
      return res.status(400).json({
        message: 'ID sản phẩm không hợp lệ'
      });
    }

    const product = await productService.getProductById(pid);

    if (!product) {
      return res.status(404).json({
        message: 'Không tìm thấy sản phẩm'
      });
    }

    return res.status(200).json(product);
  } catch (error) {
    return handlePrismaError(
      res, error, 'Lỗi khi lấy chi tiết sản phẩm'
    );
  }
}

async function create(req, res) {
  try {
    const { pname, price, quantity } = req.body;
    const validationError = validateProduct({ pname, price, quantity });

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const product = await productService.createProduct({
      pname, price, quantity
    });

    return res.status(201).json(product);
  } catch (error) {
    return handlePrismaError(
      res, error, 'Lỗi khi tạo sản phẩm'
    );
  }
}

async function update(req, res) {
  try {
    const pid = validateId(req.params.id);

    if (pid === null) {
      return res.status(400).json({
        message: 'ID sản phẩm không hợp lệ'
      });
    }

    const { pname, price, quantity } = req.body;
    const validationError = validateProduct({ pname, price, quantity });

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const existingProduct = await productService.getProductById(pid);

    if (!existingProduct) {
      return res.status(404).json({
        message: 'Không tìm thấy sản phẩm'
      });
    }

    const product = await productService.updateProduct(pid, {
      pname, price, quantity
    });

    return res.status(200).json(product);
  } catch (error) {
    return handlePrismaError(
      res, error, 'Lỗi khi cập nhật sản phẩm'
    );
  }
}

async function remove(req, res) {
  try {
    const pid = validateId(req.params.id);

    if (pid === null) {
      return res.status(400).json({
        message: 'ID sản phẩm không hợp lệ'
      });
    }

    const existingProduct = await productService.getProductById(pid);

    if (!existingProduct) {
      return res.status(404).json({
        message: 'Không tìm thấy sản phẩm'
      });
    }

    await productService.deleteProduct(pid);

    return res.status(200).json({
      message: 'Xóa sản phẩm thành công'
    });
  } catch (error) {
    return handlePrismaError(
      res, error, 'Lỗi khi xóa sản phẩm'
    );
  }
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};