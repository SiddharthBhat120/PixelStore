const connectDB = require("./config/db");
const app = require("./app");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`\nPixelStore Server running on port ${PORT}`);
    console.log(`Health: http://localhost:${PORT}/api/health`);
    if (process.env.ALLOW_DEMO_SEED === "true") {
      console.log(`Seed admin: POST http://localhost:${PORT}/api/auth/seed-admin`);
    }
    console.log(`Seed products: POST http://localhost:${PORT}/api/products/seed\n`);
  });
};

startServer();
