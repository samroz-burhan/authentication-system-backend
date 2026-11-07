import mongoose, { connect } from "mongoose";
import config from "./config.js";

async function connectDB() {
    try {

        await mongoose.connect(config.MONGO_URI);
        console.log("MONGODB Connected Successfully");

    } catch (error) {
        
        console.log("MONGODB Connection Failed!", error.message);
    }
}

export default connectDB