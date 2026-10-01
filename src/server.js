
require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

async function shutdown() {
  server.close(async () => {
    const prisma = require('./lib/prisma');

    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);