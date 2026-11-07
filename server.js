import app from "./src/app.js";
import connectDB from "./src/config/database.js";
import config from "./src/config/config.js";

const PORT = config.PORT_NO || 3000

connectDB();

app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
})