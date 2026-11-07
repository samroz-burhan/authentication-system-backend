import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";

const authRouter = Router();

//Register API => POST /api/auth/register
authRouter.post("/register", authController.registerUser);

//Fetch user details API => POST /api/auth/get-me
authRouter.get("/get-me", authController.getMe);

export default authRouter