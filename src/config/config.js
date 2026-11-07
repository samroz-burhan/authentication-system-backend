import dotenv from "dotenv";

dotenv.config();

if(!process.env.MONGO_URI || !process.env.PORT_NO) {
    throw new Error(".env Error. Please check for the variables");
}

const config = {
    PORT_NO: process.env.PORT_NO,
    MONGO_URI: process.env.MONGO_URI
}

export default config;