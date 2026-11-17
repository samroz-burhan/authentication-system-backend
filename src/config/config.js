import dotenv from "dotenv";

dotenv.config();

const requiredVariables = [
  "MONGO_URI",
  "JWT_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_REFRESH_TOKEN",
  "GOOGLE_USER",
];

const missingVariables = requiredVariables.filter((name) => !process.env[name]);

if (missingVariables.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVariables.join(", ")}`);
}

if (Buffer.byteLength(process.env.JWT_SECRET, "utf8") < 32) {
  throw new Error("JWT_SECRET must be at least 32 bytes long");
}

const port = Number(process.env.PORT_NO || 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT_NO must be a whole number between 1 and 65535");
}

const clientOrigin = process.env.CLIENT_ORIGIN?.trim();
if (clientOrigin) {
  let parsedOrigin;
  try {
    parsedOrigin = new URL(clientOrigin);
  } catch {
    throw new Error("CLIENT_ORIGIN must be a valid origin URL");
  }

  if (parsedOrigin.origin !== clientOrigin) {
    throw new Error("CLIENT_ORIGIN must contain only the origin, without a path");
  }
}

const config = {
  PORT_NO: port,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  CLIENT_ORIGIN: clientOrigin,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
  GOOGLE_USER: process.env.GOOGLE_USER,
};

export default config;
