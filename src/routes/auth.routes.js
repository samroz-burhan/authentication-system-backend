import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  loginLimiter,
  registerLimiter,
  refreshLimiter,
  resendVerificationLimiter,
  verificationLimiter,
} from "../middlewares/authLimiters.js";

const authRouter = Router();

//1. Register API => POST /api/auth/register
authRouter.post("/register", registerLimiter, authController.registerUser);

//2. Fetch user details API => GET /api/auth/get-me
authRouter.get("/get-me", authenticate, authController.getMe);

//3. login API => POST /api/auth/login
authRouter.post("/login", loginLimiter, authController.login);

//4. Refresh Token API => POST /api/auth/refresh-token
authRouter.post("/refresh-token", refreshLimiter, authController.refreshToken);

//5. Request a replacement verification code
authRouter.post(
  "/resend-verification",
  resendVerificationLimiter,
  authController.resendVerification
);

//6. Logout APIs change session state, so they use POST
authRouter.post("/logout", authController.logout);
authRouter.post("/logout-all", authController.logoutAll);

//7. Verify Email API
authRouter.post(
  "/verify-email",
  verificationLimiter,
  authController.verifyEmail
);


export default authRouter