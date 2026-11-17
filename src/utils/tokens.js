import jwt from "jsonwebtoken";
import config from "../config/config.js";
import ApiError from "./apiError.js";

const TOKEN_ISSUER = "authentication-system-backend";
const TOKEN_AUDIENCE = "authentication-system-client";

export const ACCESS_TOKEN_TTL = "15m";
export const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

function signToken(payload, subject, expiresIn) {
  return jwt.sign(payload, config.JWT_SECRET, {
    algorithm: "HS256",
    audience: TOKEN_AUDIENCE,
    expiresIn,
    issuer: TOKEN_ISSUER,
    subject,
  });
}

export function createAccessToken(userId, sessionId) {
  return signToken(
    { sessionId: String(sessionId), tokenUse: "access" },
    String(userId),
    ACCESS_TOKEN_TTL
  );
}

export function createRefreshToken(userId, sessionId) {
  return signToken(
    { sessionId: String(sessionId), tokenUse: "refresh" },
    String(userId),
    REFRESH_TOKEN_TTL_SECONDS
  );
}

function verifyToken(token, expectedUse) {
  const decoded = jwt.verify(token, config.JWT_SECRET, {
    algorithms: ["HS256"],
    audience: TOKEN_AUDIENCE,
    issuer: TOKEN_ISSUER,
  });

  if (
    decoded === null ||
    typeof decoded !== "object" ||
    decoded.tokenUse !== expectedUse ||
    typeof decoded.sub !== "string" ||
    typeof decoded.sessionId !== "string"
  ) {
    throw new ApiError(401, "Invalid or expired token");
  }

  return {
    userId: decoded.sub,
    sessionId: decoded.sessionId,
  };
}

export function verifyAccessToken(token) {
  return verifyToken(token, "access");
}

export function verifyRefreshToken(token) {
  return verifyToken(token, "refresh");
}
