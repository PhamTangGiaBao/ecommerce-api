
const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/lib/prisma');

describe('Product API', () => {
  let createdProductIds = [];

  async function createTestProduct() {
    const product = await prisma.product.create({
      data: {
        pname: `Test Product ${Date.now()}-${Math.random()}`,
        price: 100000,
        quantity: 10
      }
    });

    createdProductIds.push(product.pid);
    return product;
  }

  afterEach(async () => {
    for (const pid of createdProductIds) {
      await prisma.product.deleteMany({
        where: { pid }
      });
    }

    createdProductIds = [];
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('GET /products trả về HTTP 200', async () => {
    const response = await request(app).get('/products');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('GET /products/:id trả về 400 khi ID không hợp lệ', async () => {
    const response = await request(app).get('/products/abc');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
  });

  test('GET /products/:id trả về 404 khi sản phẩm không tồn tại', async () => {
    const response = await request(app).get('/products/2147483647');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
  });

  test('POST /products tạo sản phẩm thành công', async () => {
    const payload = {
      pname: `Created Product ${Date.now()}`,
      price: 250000,
      quantity: 5
    };

    const response = await request(app)
      .post('/products')
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body.pname).toBe(payload.pname);
    expect(Number(response.body.price)).toBe(payload.price);
    expect(response.body.quantity).toBe(payload.quantity);

    createdProductIds.push(response.body.pid);
  });

  test('POST /products trả về 400 khi tên sản phẩm rỗng', async () => {
    const response = await request(app)
      .post('/products')
      .send({
        pname: '',
        price: 100000,
        quantity: 5
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
  });

  test('PUT /products/:id cập nhật sản phẩm thành công', async () => {
    const product = await createTestProduct();

    const response = await request(app)
      .put(`/products/${product.pid}`)
      .send({
        pname: 'Updated Product',
        price: 300000,
        quantity: 20
      });

    expect(response.status).toBe(200);
    expect(response.body.pname).toBe('Updated Product');
    expect(Number(response.body.price)).toBe(300000);
    expect(response.body.quantity).toBe(20);
  });

  test('PUT /products/:id trả về 404 khi sản phẩm không tồn tại', async () => {
    const response = await request(app)
      .put('/products/2147483647')
      .send({
        pname: 'Updated Product',
        price: 300000,
        quantity: 20
      });

    expect(response.status).toBe(404);
  });

  test('DELETE /products/:id xóa sản phẩm thành công', async () => {
    const product = await createTestProduct();

    const response = await request(app)
      .delete(`/products/${product.pid}`);

    expect(response.status).toBe(200);

    const deletedProduct = await prisma.product.findUnique({
      where: { pid: product.pid }
    });

    expect(deletedProduct).toBeNull();

    createdProductIds = createdProductIds.filter(
      pid => pid !== product.pid
    );
  });

  test('DELETE /products/:id trả về 404 khi sản phẩm không tồn tại', async () => {
    const response = await request(app)
      .delete('/products/2147483647');

    expect(response.status).toBe(404);
  });
});