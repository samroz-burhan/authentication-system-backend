import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: [true, "User is required"]
    },
    refreshTokenHash: {
        type: String,
        required: [true, "Refresh token is required"]
    },
    ip: {
        type: String,
        required: [true, "Ip is required"]
    },
    userAgent: {
        type: String,
        required: [true, "User Agent is required"]
    },
    revoked: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
})

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const sessionModel = mongoose.model("sessions", sessionSchema);

export default sessionModel