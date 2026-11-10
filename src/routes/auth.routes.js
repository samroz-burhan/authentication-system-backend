import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";

const authRouter = Router();

//1. Register API => POST /api/auth/register
authRouter.post("/register", authController.registerUser);

//2. Fetch user details API => GET /api/auth/get-me
authRouter.get("/get-me", authController.getMe);

//3. login API => POST /api/auth/login
authRouter.post("/login", authController.login);

//4. Refresh Token API => POST /api/auth/refresh-token
authRouter.post("/refresh-token", authController.refreshToken);

//5. Logout (with session) API => GET /api/auth/logout
authRouter.get("/logout", authController.logout);

//6. Logout from all devices (with session) API => GET /api/auth/logoutAll
authRouter.get("/logoutAll", authController.logoutAll)

//7. Verify Email API => POST /api/auth/verifyEmail
authRouter.post("/verify-email", authController.verifyEmail);



export default authRouter