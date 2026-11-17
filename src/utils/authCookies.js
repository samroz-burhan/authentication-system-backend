const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/api/auth",
};

export function setRefreshCookie(res, token) {
  res.cookie("refreshToken", token, {
    ...refreshCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearRefreshCookie(res) {
  res.clearCookie("refreshToken", refreshCookieOptions);
}
