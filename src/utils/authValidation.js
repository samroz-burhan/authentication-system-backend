import ApiError from "./apiError.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_BCRYPT_BYTES = 72;

export function normalizeEmail(email) {
  if (typeof email !== "string") {
    throw new ApiError(400, "A valid email address is required");
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (
    normalizedEmail.length > 254 ||
    !EMAIL_PATTERN.test(normalizedEmail)
  ) {
    throw new ApiError(400, "A valid email address is required");
  }

  return normalizedEmail;
}

function validatePassword(password, { enforceMinimum }) {
  if (
    typeof password !== "string" ||
    Buffer.byteLength(password, "utf8") > MAX_BCRYPT_BYTES ||
    (enforceMinimum && password.length < 12)
  ) {
    throw new ApiError(
      400,
      enforceMinimum
        ? "Password must be at least 12 characters and no more than 72 bytes"
        : "Password must be a string of no more than 72 bytes"
    );
  }
}

export function validateRegistrationInput(input = {}) {
  const { username, email, password } = input ?? {};
  if (typeof username !== "string") {
    throw new ApiError(400, "A username is required");
  }

  const normalizedUsername = username.trim();
  if (normalizedUsername.length < 3 || normalizedUsername.length > 32) {
    throw new ApiError(400, "Username must be between 3 and 32 characters");
  }

  validatePassword(password, { enforceMinimum: true });

  return {
    username: normalizedUsername,
    email: normalizeEmail(email),
    password,
  };
}

export function validateLoginInput(input = {}) {
  const { email, password } = input ?? {};
  if (typeof password !== "string" || Buffer.byteLength(password, "utf8") > MAX_BCRYPT_BYTES) {
    throw new ApiError(400, "A valid password is required");
  }

  return {
    email: normalizeEmail(email),
    password,
  };
}

export function validateVerificationInput(input = {}) {
  const { email, otp } = input ?? {};
  if (typeof otp !== "string" || !/^\d{6}$/.test(otp)) {
    throw new ApiError(400, "A six-digit verification code is required");
  }

  return {
    email: normalizeEmail(email),
    otp,
  };
}
