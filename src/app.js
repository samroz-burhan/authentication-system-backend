import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import errorMiddleware from "./middlewares/error.middleware.js";

//All Routes
import authRouter from "./routes/auth.routes.js";

const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

app.use("/api/auth", authRouter);

//404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not Found"
    });
})

//GLOBAL ERROR HANDLER
app.use(errorMiddleware);

export default app