import userModel from "../models/user.model.js";
import otpModel from "../models/otp.model.js";
import sendEmail from "./email.service.js";
import { generateOTP, getOTPHtml } from "../utils/utils.js";
import crypto from "crypto";
import ApiError from "../utils/apiError.js";


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
