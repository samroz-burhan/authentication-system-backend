import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is required"],
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: [true, "User is required"]
    },
    otpHash: {
        type: String,
        required: [true, "OTP hash is required"]
    },
    attempts: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
})

otpSchema.index({ user: 1 }, { unique: true });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const otpModel = mongoose.model("otps", otpSchema);

export default otpModel