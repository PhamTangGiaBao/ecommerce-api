require('dotenv').config();

const express = require('express');
const prisma = require('./lib/prisma');
const productRoutes = require('./routes/productRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Cho phép đọc dữ liệu JSON từ request
app.use(express.json());
app.use('/products', productRoutes);

// API kiểm tra server
app.get('/', (req, res) => {
  res.json({
    message: 'E-commerce API is running!'
  });
});

//API health check
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: 'OK',
      server: 'running',
      database: 'connected'
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    res.status(503).json({
      status: 'ERROR',
      server: 'running',
      database: 'disconnected',
      error: error.message
    });
  }
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});