import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import sessionModel from "../models/session.model.js";
import { verifyAccessToken } from "../utils/tokens.js";

export const authenticate = asyncHandler(async (req, res, next) => {
  const authorization = req.get("authorization");
  const match = authorization?.match(/^Bearer\s+(\S+)$/i);

  if (!match) {
    throw new ApiError(401, "A bearer access token is required");
  }

  const { userId, sessionId } = verifyAccessToken(match[1]);
  const session = await sessionModel.findOne({
    _id: sessionId,
    user: userId,
    revoked: false,
    expiresAt: { $gt: new Date() },
  });

  if (!session) {
    throw new ApiError(401, "Session is invalid, expired, or revoked");
  }

  req.auth = {
    userId,
    sessionId,
  };

  next();
});