import assert from "node:assert/strict";
import test from "node:test";
import express from "express";
import { loginLimiter } from "../src/middlewares/authLimiters.js";

test("login limiter rejects requests after the configured limit", async (t) => {
  const app = express();
  app.get("/login", loginLimiter, (req, res) => res.sendStatus(204));

  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const address = server.address();
  const url = `http://127.0.0.1:${address.port}/login`;
  const statuses = [];

  for (let attempt = 0; attempt < 11; attempt += 1) {
    const response = await fetch(url);
    statuses.push(response.status);
  }

  assert.deepEqual(statuses.slice(0, 10), Array(10).fill(204));
  assert.equal(statuses[10], 429);
});
