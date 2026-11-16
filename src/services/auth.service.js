import userModel from "../models/user.model.js";
import otpModel from "../models/otp.model.js";
import sendEmail from "./email.service.js";
import { generateOTP, getOTPHtml } from "../utils/utils.js";
import crypto from "crypto";
import ApiError from "../utils/apiError.js";
import comparePassword from "../models/user.model.js";
import config from "../config/config.js";


export async function registerUserService({ username, email, password }) {
    
  //1. Check if user already exists
  const existingUser = await userModel.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, "Username or Email already exists");
  }

  //2. Create user
  const user = await userModel.create({
    username,
    email,
    password,
  });

  //3. Generate OTP
  const otp = generateOTP();

  //4. Prepare email HTML
  const html = getOTPHtml(otp);

  //5. Hash OTP
  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

  //6. Save OTP
  await otpModel.create({
    email,
    user: user._id,
    otpHash,
  });

  //7. Send email
  await sendEmail(email, "OTP VERIFICATION", `Your OTP is: ${otp}`, html);

  //8. Return created user
  return user;
}

export async function loginUserService({ email, password, req }) {
  const user = await userModel.findOne({email}).select("+password");

  if(!user) {
    throw new ApiError(401, "Invalid email or password");
  }
  
  if(!user.verified){
    throw new ApiError(403, "Email not verified");
  }

  const isPasswordvalid = await user.comparePassword(password);

  if(!isPasswordvalid) {
    throw new ApiError(401, "Invalid Email or Password");
  }

  //Generate RefreshToken
  const refreshToken = jwt.sign({
    id: user._id
  }, config.JWT_SECRET, {
    expiresIn: '7d'
  });

   // Hash refresh token
  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  //Create session
  const session = await sessionModel.create({
    user: user._id,
    refreshTokenHash,
    ip: req.ip,
    userAgent: req.headers['user-agent'] || 'unknown'
  });

  // Generate access token
  const accessToken = jwt.sign(
    {
      id: user._id,
      sessionId: session._id,
    },
    config.JWT_SECRET,
    { expiresIn: "15m" }
  );


  return {
    user, 
    session,
    refreshToken,
    accessToken
  }

}
