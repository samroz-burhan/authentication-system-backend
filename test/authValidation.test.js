import assert from "node:assert/strict";
import test from "node:test";
import ApiError from "../src/utils/apiError.js";
import {
  normalizeEmail,
  validateLoginInput,
  validateRegistrationInput,
  validateVerificationInput,
} from "../src/utils/authValidation.js";

test("normalizes email casing and surrounding spaces", () => {
  assert.equal(normalizeEmail("  User@Example.com "), "user@example.com");
});

test("rejects malformed or non-string email addresses", () => {
  assert.throws(() => normalizeEmail("not-an-email"), ApiError);
  assert.throws(() => normalizeEmail(undefined), ApiError);
});

test("rejects missing request objects with a client error", () => {
  assert.throws(() => validateRegistrationInput(null), ApiError);
  assert.throws(() => validateLoginInput(null), ApiError);
  assert.throws(() => validateVerificationInput(null), ApiError);
});

test("registration validation trims username and enforces password bounds", () => {
  assert.deepEqual(
    validateRegistrationInput({
      username: " sample-user ",
      email: "USER@example.com",
      password: "a-secure-passphrase",
    }),
    {
      username: "sample-user",
      email: "user@example.com",
      password: "a-secure-passphrase",
    }
  );

  assert.throws(
    () =>
      validateRegistrationInput({
        username: "ok",
        email: "user@example.com",
        password: "short",
      }),
    ApiError
  );
  assert.throws(
    () =>
      validateRegistrationInput({
        username: "sample-user",
        email: "user@example.com",
        password: "x".repeat(73),
      }),
    ApiError
  );
});

test("login rejects oversized passwords and normalizes email", () => {
  assert.deepEqual(
    validateLoginInput({
      email: "USER@example.com",
      password: "a-secure-passphrase",
    }),
    {
      email: "user@example.com",
      password: "a-secure-passphrase",
    }
  );
  assert.throws(
    () =>
      validateLoginInput({
        email: "user@example.com",
        password: "x".repeat(73),
      }),
    ApiError
  );
});

test("verification accepts only a six-digit code", () => {
  assert.deepEqual(
    validateVerificationInput({
      email: "USER@example.com",
      otp: "123456",
    }),
    {
      email: "user@example.com",
      otp: "123456",
    }
  );
  assert.throws(
    () =>
      validateVerificationInput({
        email: "user@example.com",
        otp: "12a456",
      }),
    ApiError
  );
});
