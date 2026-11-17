import crypto from "crypto";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import userModel from "../models/user.model.js";
import otpModel from "../models/otp.model.js";
import sessionModel from "../models/session.model.js";
import sendEmail from "./email.service.js";
import { generateOTP, getOTPHtml, hashOTP } from "../utils/utils.js";
import ApiError from "../utils/apiError.js";
import {
  createAccessToken,
  createRefreshToken,
  REFRESH_TOKEN_TTL_SECONDS,
} from "../utils/tokens.js";
import {
  normalizeEmail,
  validateLoginInput,
  validateRegistrationInput,
} from "../utils/authValidation.js";

const dummyPasswordHashPromise = bcrypt.hash(
  crypto.randomBytes(32).toString("hex"),
  12
);

async function sendVerificationCode(user) {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await otpModel.findOneAndUpdate(
    { user: user._id },
    {
      $set: {
        email: user.email,
        otpHash: hashOTP(otp),
        attempts: 0,
        expiresAt,
      },
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  await sendEmail(
    user.email,
    "Verify your email",
    `Your verification code is: ${otp}. It expires in 5 minutes.`,
    getOTPHtml(otp)
  );
}

export async function registerUserService(input) {
  const { username, email, password } = validateRegistrationInput(input);

  const existingUser = await userModel.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, "Username or email already exists");
  }

  const user = await userModel.create({
    username,
    email,
    password,
  });

  await sendVerificationCode(user);
  return user;
}

export async function resendVerificationService(input) {
  const email = normalizeEmail(input?.email);
  const user = await userModel.findOne({ email });

  if (user && !user.verified) {
    await sendVerificationCode(user);
  }
}

export async function loginUserService(input) {
  const { email, password } = validateLoginInput(input);
  const user = await userModel.findOne({ email }).select("+password");
  const passwordHash = user?.password ?? (await dummyPasswordHashPromise);
  const passwordMatches = await bcrypt.compare(password, passwordHash);

  if (!user || !passwordMatches || !user.verified) {
    throw new ApiError(401, "Invalid email or password");
  }

  const sessionId = new mongoose.Types.ObjectId();
  const refreshToken = createRefreshToken(user._id, sessionId);
  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000);

  const session = await sessionModel.create({
    _id: sessionId,
    user: user._id,
    refreshTokenHash,
    ip: input.req.ip,
    userAgent: input.req.headers["user-agent"] || "unknown",
    expiresAt,
  });

  const accessToken = createAccessToken(user._id, session._id);

  return {
    user,
    session,
    refreshToken,
    accessToken,
  };
}
