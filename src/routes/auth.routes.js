import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";

const authRouter = Router();

//Register API => POST /api/auth/register
authRouter.post("/register", authController.registerUser);

//Fetch user details API => POST /api/auth/get-me
authRouter.get("/get-me", authController.getMe);

//Refresh Token API => POST /api/auth/refresh-token
authRouter.post("/refresh-token", authController.refreshToken);

export default authRouter