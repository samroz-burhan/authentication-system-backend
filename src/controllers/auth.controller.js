import userModel from "../models/user.model.js";
import sessionModel from "../models/session.model.js";
import crypto from "crypto";
import otpModel from "../models/otp.model.js";
import {
  loginUserService,
  registerUserService,
  resendVerificationService,
} from "../services/auth.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import { hashOTP } from "../utils/utils.js";
import { validateVerificationInput } from "../utils/authValidation.js";
import {
  createAccessToken,
  createRefreshToken,
  REFRESH_TOKEN_TTL_SECONDS,
  verifyRefreshToken,
} from "../utils/tokens.js";
import {
  clearRefreshCookie,
  setRefreshCookie,
} from "../utils/authCookies.js";


export const registerUser = asyncHandler(async (req, res) => {

  const { username, email, password } = req.body ?? {};
  const user = await registerUserService({ username, email, password });

  return res.status(201).json({
    success: true,
    message: "User registered successfully",
    user: user.toPublicJSON()
  });

});

export const getMe = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.auth.userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json({
    success: true,
    message: "User fetched successfully",
    user: {
      username: user.username,
      email: user.email,
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body ?? {};

  const { user, refreshToken, accessToken } = await loginUserService({ email, password, req });

  setRefreshCookie(res, refreshToken);

  return res.status(200).json({
    success: true,
    message: "Logged in successfully",
    user: {
      username: user.username,
      email: user.email,
    },
    accessToken,
  });
});

export const resendVerification = asyncHandler(async (req, res) => {
  await resendVerificationService(req.body);

  return res.status(200).json({
    success: true,
    message: "If the account needs verification, a new code has been sent",
  });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw new ApiError(401, "Refresh token not found");
  }

  const decoded = verifyRefreshToken(refreshToken);
  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");
  const now = new Date();
  const newRefreshToken = createRefreshToken(decoded.userId, decoded.sessionId);
  const newRefreshTokenHash = crypto
    .createHash("sha256")
    .update(newRefreshToken)
    .digest("hex");
  const session = await sessionModel.findOneAndUpdate(
    {
      _id: decoded.sessionId,
      user: decoded.userId,
      refreshTokenHash,
      revoked: false,
      expiresAt: { $gt: now },
    },
    {
      $set: {
        refreshTokenHash: newRefreshTokenHash,
        expiresAt: new Date(now.getTime() + REFRESH_TOKEN_TTL_SECONDS * 1000),
      },
    },
    { new: true, runValidators: true }
  );

  if (!session) {
    await sessionModel.updateOne(
      {
        _id: decoded.sessionId,
        user: decoded.userId,
        revoked: false,
        expiresAt: { $gt: now },
        refreshTokenHash: { $ne: refreshTokenHash },
      },
      { $set: { revoked: true } }
    );
    throw new ApiError(401, "Refresh token is invalid or has already been used");
  }

  const accessToken = createAccessToken(decoded.userId, session._id);
  setRefreshCookie(res, newRefreshToken);

  return res.status(200).json({
    success: true,
    message: "Access token refreshed successfully",
    accessToken,
  });
});

export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  clearRefreshCookie(res);

  if (!refreshToken) {
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  }

  const decoded = verifyRefreshToken(refreshToken);
  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  await sessionModel.updateOne({
    _id: decoded.sessionId,
    user: decoded.userId,
    refreshTokenHash,
    revoked: false,
  }, {
    $set: { revoked: true },
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { otp, email } = validateVerificationInput(req.body);
  const now = new Date();
  const otpRecord = await otpModel.findOne({ email });

  if (
    !otpRecord ||
    otpRecord.expiresAt <= now ||
    otpRecord.attempts >= 5
  ) {
    throw new ApiError(400, "Invalid or expired verification code");
  }

  const attempt = await otpModel.findOneAndUpdate(
    {
      _id: otpRecord._id,
      expiresAt: { $gt: now },
      attempts: { $lt: 5 },
    },
    { $inc: { attempts: 1 } },
    { new: true }
  );

  if (!attempt) {
    throw new ApiError(400, "Invalid or expired verification code");
  }

  const candidateHash = hashOTP(otp);
  const storedHashBytes = Buffer.from(attempt.otpHash, "hex");
  const candidateHashBytes = Buffer.from(candidateHash, "hex");
  const hashesMatch =
    storedHashBytes.length === candidateHashBytes.length &&
    crypto.timingSafeEqual(storedHashBytes, candidateHashBytes);

  if (!hashesMatch) {
    throw new ApiError(400, "Invalid or expired verification code");
  }

  const consumedOTP = await otpModel.findOneAndDelete({
    _id: attempt._id,
    otpHash: attempt.otpHash,
    expiresAt: { $gt: new Date() },
    attempts: { $lte: 5 },
  });

  if (!consumedOTP) {
    throw new ApiError(400, "Invalid or expired verification code");
  }

  const user = await userModel.findByIdAndUpdate(
    consumedOTP.user,
    { verified: true },
    { new: true }
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json({
    success: true,
    message: "Email verified successfully",
  });
});

export const logoutAll = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  clearRefreshCookie(res);

  if (!refreshToken) {
    throw new ApiError(401, "Refresh token not found");
  }

  const decoded = verifyRefreshToken(refreshToken);
  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");
  const now = new Date();
  const activeSession = await sessionModel.findOne({
    _id: decoded.sessionId,
    user: decoded.userId,
    refreshTokenHash,
    revoked: false,
    expiresAt: { $gt: now },
  });

  if (!activeSession) {
    throw new ApiError(401, "Refresh token is invalid or expired");
  }

  await sessionModel.updateMany(
    {
      user: decoded.userId,
      revoked: false,
      expiresAt: { $gt: now },
    },
    {
      $set: {
        revoked: true,
      },
    }
  );

  return res.status(200).json({
    success: true,
    message: "Logged out from all devices successfully",
  });
});


