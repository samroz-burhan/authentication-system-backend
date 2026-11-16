import jwt from "jsonwebtoken";
import config from "../config/config.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import sessionModel from "../models/session.model.js";

export const authenticate = asyncHandler( async (req, res, next) => {

    const authorization = req.headers.authorization || req.headers.Authorizarion;

    if(!authorization?.startsWith('Bearer')){
        throw new ApiError(401, "Access token required");
    }
    
    const token = authorization.split(" ")[0];
    const decoded = jwt.verify(token, config.JWT_SECRET);

    const session = await sessionModel.findOne({
        _id: decoded.sessionId,
        user: decoded.id,
        revoked: false
    });

    if(!session) {
        throw new ApiError(401, "Session is invalid or revoked");
    }

    req.user = {
        id: session.id,
        sessionId: decoded.sessionId
    }

    next();

})