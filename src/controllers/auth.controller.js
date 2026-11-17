import userModel from "../models/user.model.js";
import sessionModel from "../models/session.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import otpModel from "../models/otp.model.js";
import { loginUserService, registerUserService } from "../services/auth.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";


export const registerUser = asyncHandler(async (req, res) => {

  const { username, email, password } = req.body;
  const user = await registerUserService({ username, email, password });

  return res.status(201).json({
    success: true,
    message: "User registered successfully",
    user: user.toPublicJSON()
  });

});

export const getMe = asyncHandler(async (req, res) => {
  
  const user = await userModel.findById(req.user.id);
  
  res.status(200).json({
    message: "User fetched successfully",
    user: {
      username: user.username,
      email: user.email,
    },
  });
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { user, refreshToken, accessToken } = await loginUserService({ email, password, req });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    message: "User loggedin successfully!",
    user: {
      username: user.username,
      email: user.email,
    },
    accessToken,
  });
})

export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw new ApiError(401, "Refresh token not found");
  }

  // Verify refresh JWT
  const decoded = jwt.verify(
    refreshToken,
    config.JWT_SECRET
  );

  // Hash incoming refresh token
  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  // Find valid session
  const session = await sessionModel.findOne({
    refreshTokenHash,
    user: decoded.id,
    revoked: false,
  });

  if (!session) {
    throw new ApiError(401, "Invalid refresh token");
  }

  // Generate new access token
  const accessToken = jwt.sign(
    {
      id: decoded.id,
      sessionId: session._id,
    },
    config.JWT_SECRET,
    { expiresIn: "15m" }
  );

  // Generate new refresh token
  const newRefreshToken = jwt.sign(
    {
      id: decoded.id,
    },
    config.JWT_SECRET,
    { expiresIn: "7d" }
  );

  // Hash new refresh token
  const newRefreshTokenHash = crypto
    .createHash("sha256")
    .update(newRefreshToken)
    .digest("hex");

  // Rotate refresh token
  session.refreshTokenHash = newRefreshTokenHash;

  await session.save();

  // Update cookie
  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/auth",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    success: true,
    message: "Access token refreshed successfully",
    accessToken,
  });
});

export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw new ApiError(400, "Refresh token not found");
  }

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const session = await sessionModel.findOne({
    refreshTokenHash,
    revoked: false,
  });

  if (!session) {
    throw new ApiError(400, "Session not found");
  }

  session.revoked = true;
  await session.save();

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/auth",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { otp, email } = req.body;

  const otpHash = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");

  const otpRecord = await otpModel.findOne({
    email,
    otpHash,
  });

  if (!otpRecord) {
    throw new ApiError(400, "Invalid OTP");
  }

  const user = await userModel.findByIdAndUpdate(
    otpRecord.user,
    { verified: true },
    { new: true }
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  await otpModel.deleteMany({
    user: otpRecord.user,
  });

  return res.status(200).json({
    success: true,
    message: "Email verified successfully",
  });
});

export const logoutAll = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw new ApiError(400, "Refresh token not found");
  }

  const decoded = jwt.verify(
    refreshToken,
    config.JWT_SECRET
  );

  await sessionModel.updateMany(
    {
      user: decoded.id,
      revoked: false,
    },
    {
      $set: {
        revoked: true,
      },
    }
  );

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/auth",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out from all devices successfully",
  });
});


