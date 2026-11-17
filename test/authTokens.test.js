import assert from "node:assert/strict";
import test from "node:test";

process.env.MONGO_URI ??= "mongodb://127.0.0.1/auth-test";
process.env.JWT_SECRET ??= "unit-test-secret-that-is-at-least-32-bytes-long";
process.env.GOOGLE_CLIENT_ID ??= "test-client-id";
process.env.GOOGLE_CLIENT_SECRET ??= "test-client-secret";
process.env.GOOGLE_REFRESH_TOKEN ??= "test-refresh-token";
process.env.GOOGLE_USER ??= "test@example.com";

const {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} = await import("../src/utils/tokens.js");
const { generateOTP, hashOTP } = await import("../src/utils/utils.js");

test("access and refresh tokens carry different purposes", () => {
  const accessToken = createAccessToken("user-id", "session-id");
  const refreshToken = createRefreshToken("user-id", "session-id");

  assert.deepEqual(verifyAccessToken(accessToken), {
    userId: "user-id",
    sessionId: "session-id",
  });
  assert.deepEqual(verifyRefreshToken(refreshToken), {
    userId: "user-id",
    sessionId: "session-id",
  });
  assert.throws(() => verifyRefreshToken(accessToken));
  assert.throws(() => verifyAccessToken(refreshToken));
});

test("verification codes are six digits and stored as a one-way keyed digest", () => {
  const otp = generateOTP();

  assert.match(otp, /^\d{6}$/);
  assert.equal(hashOTP(otp), hashOTP(otp));
  assert.notEqual(hashOTP(otp), otp);
});
