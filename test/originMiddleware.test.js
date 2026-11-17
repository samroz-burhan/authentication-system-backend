import assert from "node:assert/strict";
import test from "node:test";

process.env.MONGO_URI = "mongodb://127.0.0.1/auth-test";
process.env.JWT_SECRET = "unit-test-secret-that-is-at-least-32-bytes-long";
process.env.GOOGLE_CLIENT_ID = "test-client-id";
process.env.GOOGLE_CLIENT_SECRET = "test-client-secret";
process.env.GOOGLE_REFRESH_TOKEN = "test-refresh-token";
process.env.GOOGLE_USER = "test@example.com";
process.env.CLIENT_ORIGIN = "https://frontend.example.test";

const { default: originMiddleware } = await import(
  "../src/middlewares/origin.middleware.js"
);

function createRequest(origin) {
  return {
    protocol: "https",
    method: "GET",
    get(name) {
      if (name === "origin") {
        return origin;
      }

      return "api.example.test";
    },
  };
}

test("allows the configured browser origin with credentialed CORS headers", () => {
  const headers = {};
  const response = {
    setHeader(name, value) {
      headers[name] = value;
    },
  };
  let nextCalled = false;

  originMiddleware(
    createRequest("https://frontend.example.test"),
    response,
    () => {
      nextCalled = true;
    }
  );

  assert.equal(nextCalled, true);
  assert.equal(headers["Access-Control-Allow-Origin"], "https://frontend.example.test");
  assert.equal(headers["Access-Control-Allow-Credentials"], "true");
});

test("rejects a browser origin that is not configured", () => {
  let nextError;

  originMiddleware(
    createRequest("https://attacker.example.test"),
    { setHeader() {} },
    (error) => {
      nextError = error;
    }
  );

  assert.equal(nextError?.statusCode, 403);
});
