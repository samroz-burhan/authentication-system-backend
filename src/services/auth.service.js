import userModel from "../models/user.model.js";
import otpModel from "../models/otp.model.js";
import sendEmail from "./email.service.js";
import {
    generateOTP,
    getOTPHtml
} from "../utils/utils.js";
import crypto from "crypto";

//Creating registration service
export async function registerUserService({username, email, password}) {

    //1. Create user
    const user = await userModel.create({
        username, 
        email, 
        password
    })

    //2. Generate OTP
    const otp = generateOTP();

    console.log("OTP is", otp);

    //3. Prepare email HTML
    const html = getOTPHtml(otp);

    //4. Hash OTP
    const otpHash = crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");
    
    //5. Save OTP
    await otpModel.create({
        email,
        user: user._id,
        otpHash
    })

    //6. Send email
    await sendEmail(email, "OTP VERIFICATION", `Your OTP is: ${otp}`, html);

    //Return created user
    return user
}