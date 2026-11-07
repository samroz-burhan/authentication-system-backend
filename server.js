import "dotenv/config";
import app from "./src/app.js";

const PORT = process.env.PORT_NO || 3000

app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
})