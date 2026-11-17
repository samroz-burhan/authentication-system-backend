import { afterAll, expect, test } from "vitest";
import express from "express";
import { loginLimiter } from "../src/middlewares/authLimiters.js";

let server;

afterAll(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("login limiter rejects requests after the configured limit", async () => {
  const app = express();
  app.get("/login", loginLimiter, (req, res) => res.sendStatus(204));

  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));

  const address = server.address();
  const url = `http://127.0.0.1:${address.port}/login`;
  const statuses = [];

  for (let attempt = 0; attempt < 11; attempt += 1) {
    const response = await fetch(url);
    statuses.push(response.status);
  }

  expect(statuses.slice(0, 10)).toEqual(Array(10).fill(204));
  expect(statuses[10]).toBe(429);
});
