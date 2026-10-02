
const express = require('express');
const prisma = require('./lib/prisma');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

app.use(express.json());

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
      database: 'disconnected'
    });
  }
});

app.use('/products', productRoutes);
app.use('/auth', authRoutes);
app.use('/orders', orderRoutes);

module.exports = app;