import dotenv from "dotenv";

dotenv.config();

if(!process.env.MONGO_URI || !process.env.PORT_NO || !process.env.JWT_SECRET) {
    throw new Error(".env Error. Please check for the variables");
}

const config = {
    PORT_NO: process.env.PORT_NO,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET
}

export default config;