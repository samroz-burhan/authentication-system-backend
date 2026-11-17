import { mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import { afterAll, beforeAll, beforeEach, expect, test, vi } from "vitest";

const { sentEmails, mockSendEmail } = vi.hoisted(() => {
  const sentEmails = [];
  const mockSendEmail = vi.fn(async (...message) => {
    sentEmails.push(message);
  });

  return { sentEmails, mockSendEmail };
});

vi.mock("../src/services/email.service.js", () => ({
  default: mockSendEmail,
}));

import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import app from "../src/app.js";
import otpModel from "../src/models/otp.model.js";
import sessionModel from "../src/models/session.model.js";
import userModel from "../src/models/user.model.js";

let mongoServer;
let databasePath;

async function createVerifiedAccount(email = "person@example.com") {
  const registration = await request(app)
    .post("/api/auth/register")
    .send({
      username: `user-${email.split("@")[0]}`,
      email,
      password: "a-secure-passphrase",
    });

  expect(registration.status).toBe(201);
  const [, , emailText] = sentEmails.at(-1);
  const code = emailText.match(/\b\d{6}\b/)?.[0];
  expect(code).toBeDefined();

  const verification = await request(app)
    .post("/api/auth/verify-email")
    .send({ email, otp: code });
  expect(verification.status).toBe(200);

  return { email, password: "a-secure-passphrase" };
}

async function loginWithAgent(account) {
  const agent = request.agent(app);
  const response = await agent.post("/api/auth/login").send(account);

  expect(response.status).toBe(200);
  expect(response.body.accessToken).toBeTypeOf("string");

  return { agent, response, accessToken: response.body.accessToken };
}

function refreshCookieFrom(response) {
  const cookie = response.headers["set-cookie"]?.find((value) =>
    value.startsWith("refreshToken=")
  );
  expect(cookie).toBeDefined();
  return cookie.split(";")[0];
}

beforeAll(async () => {
  databasePath = await mkdtemp(
    path.join(
      process.cwd(),
      "node_modules",
      ".cache",
      "mongodb-memory-server",
      "integration-"
    )
  );
  mongoServer = await MongoMemoryServer.create({
    instance: { dbPath: databasePath },
  });
  await mongoose.connect(mongoServer.getUri());
  await Promise.all([
    userModel.init(),
    otpModel.init(),
    sessionModel.init(),
  ]);
});

beforeEach(async () => {
  await Promise.all([
    userModel.deleteMany({}),
    otpModel.deleteMany({}),
    sessionModel.deleteMany({}),
  ]);
  sentEmails.length = 0;
  mockSendEmail.mockClear();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer?.stop();
  if (databasePath) {
    await rm(databasePath, { recursive: true, force: true });
  }
});

test("registration, wrong and correct code verification, and duplicate handling work through HTTP", async () => {
  const email = "registration@example.com";
  const registration = await request(app)
    .post("/api/auth/register")
    .send({
      username: "registration-user",
      email: " REGISTRATION@example.com ",
      password: "a-secure-passphrase",
    });

  expect(registration.status).toBe(201);
  expect(registration.body.user.verified).toBe(false);
  expect(registration.body.user).not.toHaveProperty("password");
  expect(mockSendEmail).toHaveBeenCalledOnce();

  const storedUser = await userModel.findOne({ email }).select("+password");
  expect(storedUser.password).not.toBe("a-secure-passphrase");
  await expect(storedUser.comparePassword("a-secure-passphrase")).resolves.toBe(true);

  const otp = await otpModel.findOne({ email });
  expect(otp).not.toBeNull();
  const [, , emailText] = sentEmails[0];
  const code = emailText.match(/\b\d{6}\b/)?.[0];
  expect(code).toBeDefined();
  expect(otp.otpHash).not.toBe(code);
  expect(otp.expiresAt.getTime()).toBeGreaterThan(Date.now());

  const wrongCode = await request(app)
    .post("/api/auth/verify-email")
    .send({ email, otp: "000000" });
  expect(wrongCode.status).toBe(400);

  const verification = await request(app)
    .post("/api/auth/verify-email")
    .send({ email, otp: code });
  expect(verification.status).toBe(200);
  expect(await otpModel.findOne({ email })).toBeNull();
  expect((await userModel.findOne({ email })).verified).toBe(true);

  const duplicate = await request(app)
    .post("/api/auth/register")
    .send({
      username: "another-user",
      email,
      password: "a-secure-passphrase",
    });
  expect(duplicate.status).toBe(409);
});

test("login, protected profile, and logout work through HTTP and MongoDB", async () => {
  const account = await createVerifiedAccount("profile@example.com");
  const { agent, accessToken } = await loginWithAgent(account);

  const user = await userModel.findOne({ email: account.email });
  const session = await sessionModel.findOne({ user: user._id });
  expect(session).not.toBeNull();
  expect(session.refreshTokenHash).not.toContain("eyJ");

  const profile = await request(app)
    .get("/api/auth/get-me")
    .set("Authorization", `Bearer ${accessToken}`);
  expect(profile.status).toBe(200);
  expect(profile.body.user).toEqual({
    username: "user-profile",
    email: account.email,
  });

  const logout = await agent.post("/api/auth/logout");
  expect(logout.status).toBe(200);
  expect((await sessionModel.findById(session._id)).revoked).toBe(true);

  const rejectedProfile = await request(app)
    .get("/api/auth/get-me")
    .set("Authorization", `Bearer ${accessToken}`);
  expect(rejectedProfile.status).toBe(401);
});

test("refresh rotates its cookie and reuse of the old refresh token revokes the session", async () => {
  const account = await createVerifiedAccount("refresh@example.com");
  const { agent, response: loginResponse } = await loginWithAgent(account);
  const oldCookie = refreshCookieFrom(loginResponse);

  const refreshResponse = await agent.post("/api/auth/refresh-token");
  expect(refreshResponse.status).toBe(200);
  expect(refreshCookieFrom(refreshResponse)).not.toBe(oldCookie);

  const oldRefreshReuse = await request(app)
    .post("/api/auth/refresh-token")
    .set("Cookie", oldCookie);
  expect(oldRefreshReuse.status).toBe(401);

  const user = await userModel.findOne({ email: account.email });
  const session = await sessionModel.findOne({ user: user._id });
  expect(session.revoked).toBe(true);
});

test("logout-all revokes sessions created by separate logins", async () => {
  const account = await createVerifiedAccount("devices@example.com");
  const firstLogin = await loginWithAgent(account);
  const secondLogin = await loginWithAgent(account);

  const user = await userModel.findOne({ email: account.email });
  expect(await sessionModel.countDocuments({ user: user._id })).toBe(2);

  const logoutAll = await firstLogin.agent.post("/api/auth/logout-all");
  expect(logoutAll.status).toBe(200);
  expect(await sessionModel.countDocuments({ revoked: false })).toBe(0);

  const firstProfile = await request(app)
    .get("/api/auth/get-me")
    .set("Authorization", `Bearer ${firstLogin.accessToken}`);
  const secondProfile = await request(app)
    .get("/api/auth/get-me")
    .set("Authorization", `Bearer ${secondLogin.accessToken}`);
  expect(firstProfile.status).toBe(401);
  expect(secondProfile.status).toBe(401);
});
