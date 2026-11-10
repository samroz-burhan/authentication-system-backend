import userModel from "../models/user.model.js";
import sessionModel from "../models/session.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import { sendEmail } from "../services/email.service.js";
import { generateOTP, getOTPHtml } from "../utils/utils.js";
import otpModel from "../models/otp.model.js";

export async function registerUser(req, res) {
    const { username, email, password } = req.body;

    const isAlreadyRegistered =  await userModel.findOne({
        $or: [
            { username },
            { email }
        ]
    });

    if(isAlreadyRegistered) {
        return res.status(409).json({ 
            message: "Username or Email already exists."
        })
    }

    const hashedPassword = crypto
        .createHash('sha256')
        .update(password)
        .digest("hex")

    const user = await userModel.create({
        username,
        email,
        password: hashedPassword
    })

    const otp = generateOTP();
    const html = getOTPHtml(otp);

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    await otpModel.create({ 
        email, 
        user: user._id, 
        otpHash 
    });

    await sendEmail(email, "OTP Verification", `Your OTP code is ${otp}`, html)

    res.status(201).json({
        message: {
            message: "User registered successfully",
            user: {
                username: user.username,
                email: user.email,
                verified: user.verified
            }
        }
    })
}

export async function getMe(req, res) {
    const token = req.headers.authorization?.split(" ")[1];

    if(!token) {
        return res.status(401).json({ message: "Token Not Found" })
    }

    const decoded = jwt.verify(token, config.JWT_SECRET); 
    const user = await userModel.findById(decoded.id);

    res.status(200).json({
        message: "User fetched successfully",
        user: {
            username: user.username,
            email: user.email
        }
    })

}

export async function login(req, res) {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email })

    if(!user) {
        return res.status(401).json({ 
            message: "Invalid Credientials"
        });
    }

    if(!user.verified) {
        return res.status(401).json({
            message: "Email not verified"
        })
    }

    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

    const isPwValid = hashedPassword === user.password;

    if(!isPwValid) {
        return res.status(401).json({ 
            message: "Invalid email or password"
        });
    }

    const refreshToken = jwt.sign({
        id: user._id,
    }, config.JWT_SECRET, {
        expiresIn: "7d"
    })

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    const session = await sessionModel.create({
        user: user._id,
        refreshTokenHash,
        ip: req.ip,
        userAgent: req.headers["user-agent"]
    })

    const accessToken = jwt.sign({
        id: user._id,
        sessionId: session._id
    }, config.JWT_SECRET, {
        expiresIn: "15m"
    }) 

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })
    

    res.status(200).json({ 
        message: "User loggedin successfully!",
        user: {
            username: user.username,
            email: user.email
        },
        accessToken
    });


}

export async function refreshToken(req, res) {
    const { refreshToken } = req.cookies;
    
    if(!refreshToken) {
        return res.status(401).json({ message: "Token not found!" });
    }

    const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    
    const session = await sessionModel.findOne({
        refreshTokenHash,
        revoked: false
    })

    if(!session) {
        return res.status(401).json({
            message: "Invalid refresh token"
        })
    }

    //New access token is generated
    const accessToken = jwt.sign({
        id: decoded.id
    }, config.JWT_SECRET, {
        expiresIn: "15m"
    });

    //New refresh token is generated
    const newRefreshToken = jwt.sign({
        id: decoded.id
    }, config.JWT_SECRET, {
        expiresIn: "7d"
    });

    const newRefreshTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");
    session.refreshTokenHash = newRefreshTokenHash
    await session.save();


    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7*24*60*60*1000
    })

    res.status(200).json({
        message: "Access token refreshed successfully",
        accessToken
    })
}

export async function logout(req, res) {
    const { refreshToken } = req.cookies;

    if(!refreshToken) {
        return res.status(400).json({
            message: "Refresh token not found"
        });
    }

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    const session = await sessionModel.findOne({
        refreshTokenHash,
        revoked: false
    })

    if(!session) {
        return res.status(400).json({
            message: "Session Not Found"
        })
    }

    session.revoked = true;
    await session.save();

    res.clearCookie("refreshToken");

    res.status(200).json({
        message: "Logged out successfully"
    })
}

export async function logoutAll(req, res) {
    const { refreshToken } = req.cookies;

    if(!refreshToken) {
        return res.status(400).json({
            message: "Refresh Token not found!"
        });
    }

    const decoded = jwt.verify(refreshToken, config.JWT_SECRET)

    await sessionModel.updateMany({
        user: decoded.id,
        revoked: false
    }, {
        revoked: true
    })

    res.clearCookie("refreshToken");
    res.status(200).json({
        message: "Logged out from all devices successfully!"
    })
}

export async function verifyEmail(req, res) {
    const { otp, email } = req.body;

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    const otpRecord = await otpModel.findOne({
        email,
        otpHash
    })

    if(!otpRecord) {
        return res.status(400).json({
            message: "Invalid OTP"
        })
    }

    const user = await userModel.findByIdAndUpdate(otpRecord.user, {
        verified: true
    })

    await otpModel.deleteMany({
        user: otpRecord.user
    })

    return res.status(200).json({
        message: "Email Verified successfully"
    })

}

