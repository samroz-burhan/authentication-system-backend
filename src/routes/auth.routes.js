import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";

const authRouter = Router();

//Register API => POST /api/auth/register
authRouter.post("/register", authController.registerUser);

export default authRouter