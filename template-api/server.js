require('dotenv').config();

const app = require('./app');
const { checkDatabaseConnection } = require('./config/db');

const PORT = Number(process.env.PORT || 8080);

async function startServer() {
  try {
    await checkDatabaseConnection();

    app.listen(PORT, () => {
      console.log(`Template API running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();