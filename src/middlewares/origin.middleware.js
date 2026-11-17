import config from "../config/config.js";
import ApiError from "../utils/apiError.js";

function isAllowedOrigin(origin, req) {
  if (config.CLIENT_ORIGIN) {
    return origin === config.CLIENT_ORIGIN;
  }

  return origin === `${req.protocol}://${req.get("host")}`;
}

export default function originMiddleware(req, res, next) {
  const origin = req.get("origin");

  if (origin && !isAllowedOrigin(origin, req)) {
    return next(new ApiError(403, "Request origin is not allowed"));
  }

  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Vary", "Origin");
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
}
