import { expect, test } from "vitest";

import {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../src/utils/tokens.js";
import { generateOTP, hashOTP } from "../src/utils/utils.js";

test("access and refresh tokens carry different purposes", () => {
  const accessToken = createAccessToken("user-id", "session-id");
  const refreshToken = createRefreshToken("user-id", "session-id");

  expect(verifyAccessToken(accessToken)).toEqual({
    userId: "user-id",
    sessionId: "session-id",
  });
  expect(verifyRefreshToken(refreshToken)).toEqual({
    userId: "user-id",
    sessionId: "session-id",
  });
  expect(() => verifyRefreshToken(accessToken)).toThrow();
  expect(() => verifyAccessToken(refreshToken)).toThrow();
  expect(createRefreshToken("user-id", "session-id")).not.toBe(
    createRefreshToken("user-id", "session-id")
  );
});

test("verification codes are six digits and stored as a one-way keyed digest", () => {
  const otp = generateOTP();

  expect(otp).toMatch(/^\d{6}$/);
  expect(hashOTP(otp)).toBe(hashOTP(otp));
  expect(hashOTP(otp)).not.toBe(otp);
});
