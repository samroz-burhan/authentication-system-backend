import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: [true, "Username is required"],
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        select: false
    },
    verified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

//User password should be hashed whenever new password is saved
userSchema.pre("save", async function () {
    if(!this.isModified('password')) { return }
    this.password = await bcrypt.hash(this.password, 12)
})

//This instance method `comparePassword` belong to an individual user document
userSchema.methods.comparePassword =  function (plainPassword) {
    return bcrypt.compare(plainPassword, this.password);
}

//This method defines which information is safe to expose
userSchema.methods.toPublicJSON = function () {
    return {
        id: this._id,
        username: this.username,
        email: this.email,
        verified: this.verified
    }
}

const userModel = mongoose.model("Users", userSchema);

export default userModel;