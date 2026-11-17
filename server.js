import app from "./src/app.js";
import connectDB from "./src/config/database.js";
import config from "./src/config/config.js";

async function startServer() {
  await connectDB();

  app.listen(config.PORT_NO, () => {
    console.log(`Server is running on PORT: ${config.PORT_NO}`);
  });
}

startServer().catch((error) => {
  console.error("Server startup failed:", error.message);
  process.exitCode = 1;
});