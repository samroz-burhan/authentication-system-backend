import { expect, test } from "vitest";
import ApiError from "../src/utils/apiError.js";
import {
  normalizeEmail,
  validateLoginInput,
  validateRegistrationInput,
  validateVerificationInput,
} from "../src/utils/authValidation.js";

test("normalizes email casing and surrounding spaces", () => {
  expect(normalizeEmail("  User@Example.com ")).toBe("user@example.com");
});

test("rejects malformed or non-string email addresses", () => {
  expect(() => normalizeEmail("not-an-email")).toThrow(ApiError);
  expect(() => normalizeEmail(undefined)).toThrow(ApiError);
});

test("rejects missing request objects with a client error", () => {
  expect(() => validateRegistrationInput(null)).toThrow(ApiError);
  expect(() => validateLoginInput(null)).toThrow(ApiError);
  expect(() => validateVerificationInput(null)).toThrow(ApiError);
});

test("registration validation trims username and enforces password bounds", () => {
  expect(
    validateRegistrationInput({
      username: " sample-user ",
      email: "USER@example.com",
      password: "a-secure-passphrase",
    }),
  ).toEqual({
      username: "sample-user",
      email: "user@example.com",
      password: "a-secure-passphrase",
  });

  expect(
    () =>
      validateRegistrationInput({
        username: "ok",
        email: "user@example.com",
        password: "short",
      }),
  ).toThrow(ApiError);
  expect(
    () =>
      validateRegistrationInput({
        username: "sample-user",
        email: "user@example.com",
        password: "x".repeat(73),
      }),
  ).toThrow(ApiError);
});

test("login rejects oversized passwords and normalizes email", () => {
  expect(
    validateLoginInput({
      email: "USER@example.com",
      password: "a-secure-passphrase",
    }),
  ).toEqual({
      email: "user@example.com",
      password: "a-secure-passphrase",
  });
  expect(
    () =>
      validateLoginInput({
        email: "user@example.com",
        password: "x".repeat(73),
      }),
  ).toThrow(ApiError);
});

test("verification accepts only a six-digit code", () => {
  expect(
    validateVerificationInput({
      email: "USER@example.com",
      otp: "123456",
    }),
  ).toEqual({
      email: "user@example.com",
      otp: "123456",
  });
  expect(
    () =>
      validateVerificationInput({
        email: "user@example.com",
        otp: "12a456",
      }),
  ).toThrow(ApiError);
});
