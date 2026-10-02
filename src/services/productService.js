
const prisma = require('../lib/prisma');

async function getAllProducts() {
  return prisma.product.findMany();
}

async function getProductById(pid) {
  return prisma.product.findUnique({
    where: { pid }
  });
}

async function createProduct({ pname, price, quantity }) {
  return prisma.product.create({
    data: {
      pname: pname.trim(),
      price: Number(price),
      quantity
    }
  });
}

async function updateProduct(pid, { pname, price, quantity }) {
  return prisma.product.update({
    where: { pid },
    data: {
      pname: pname.trim(),
      price: Number(price),
      quantity
    }
  });
}

async function deleteProduct(pid) {
  await prisma.product.delete({
    where: { pid }
  });
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};