import { expect, test } from "vitest";
import originMiddleware from "../src/middlewares/origin.middleware.js";

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

  expect(nextCalled).toBe(true);
  expect(headers["Access-Control-Allow-Origin"]).toBe("https://frontend.example.test");
  expect(headers["Access-Control-Allow-Credentials"]).toBe("true");
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

  expect(nextError?.statusCode).toBe(403);
});
