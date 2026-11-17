import rateLimit from "express-rate-limit";

function createLimiter(windowMs, limit, message) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message,
    },
  });
}

export const registerLimiter = createLimiter(
  60 * 60 * 1000,
  5,
  "Too many registration attempts. Please try again later."
);

export const loginLimiter = createLimiter(
  15 * 60 * 1000,
  10,
  "Too many login attempts. Please try again later."
);

export const verificationLimiter = createLimiter(
  15 * 60 * 1000,
  10,
  "Too many verification attempts. Please try again later."
);

export const resendVerificationLimiter = createLimiter(
  60 * 60 * 1000,
  3,
  "Too many verification emails requested. Please try again later."
);

export const refreshLimiter = createLimiter(
  15 * 60 * 1000,
  30,
  "Too many token refresh attempts. Please try again later."
);
