# Authentication API: Production-Readiness Review

This document reviews the current Node.js, Express, MongoDB, and JWT authentication project and describes work to consider before using it with real users. It is an assessment and implementation guide; it does not change application code.

## Executive summary

The project is a useful learning-stage foundation, but it is **not ready for production authentication**. The highest-priority issues are:

1. Passwords are hashed with fast SHA-256 rather than a password-hashing algorithm.
2. There is no request validation or rate limiting around login, registration, and OTP verification.
3. OTPs have no enforced expiry or attempt limit, despite the email saying they expire in five minutes.
4. Protected-route authentication does not check the login session or its revocation state.
5. Authentication lifecycle operations can leave inconsistent state, and email delivery errors are hidden from callers.
6. There are no meaningful tests, centralized error handling, or production-ready startup and shutdown checks.

Treat the sections below as a roadmap. Do not deploy until the critical authentication and operational controls are implemented and tested.

## Review scope and current application

Reviewed the project-level README, package metadata, server and Express setup, configuration, database connection, auth controller and routes, user/session/OTP models, email service, and utility functions. `node_modules` was excluded.

The current routes under `/api/auth` are:

| Route | Current behavior |
|---|---|
| `POST /register` | Creates an unverified user, stores an OTP hash, and attempts to send an email. |
| `POST /verify-email` | Looks up an OTP hash and marks its user verified. |
| `POST /login` | Checks email/password and verification status; creates a session and returns an access token while setting a refresh-token cookie. |
| `GET /get-me` | Verifies a JWT from the Authorization header and returns user details. |
| `POST /refresh-token` | Rotates a refresh token using the cookie and returns a new access token. |
| `GET /logout` | Revokes the session identified by the refresh-token hash and clears the cookie. |
| `GET /logoutAll` | Uses the refresh token's user ID to revoke that user's sessions and clears the cookie. |

### Documentation mismatch

The existing README describes a registration flow that creates a session and issues tokens, and a protected-route flow that checks the session. The current controller instead requires email verification before login, does not create a session during registration, and does not check the session in `getMe`. Update the README when implementation changes so its diagrams and endpoint behavior remain accurate.

## Prioritized roadmap

### P0 — Required before production

#### 1. Use a password-hashing algorithm

`registerUser` hashes passwords with SHA-256, and `login` compares the resulting SHA-256 digest. SHA-256 is intentionally fast and makes stolen password hashes much easier to crack offline. `bcrypt` is already listed in `package.json` but is not used by the controller.

- Use bcrypt with an appropriate work factor or Argon2id, and use the library's password verification function.
- Never store or log plaintext passwords.
- Decide how existing SHA-256 records will be migrated. A safe staged migration can verify the legacy hash at successful login, then immediately re-hash with the new algorithm; alternatively, require password resets. Do not silently interpret legacy hashes as bcrypt hashes.
- Set and enforce password length limits, including a reasonable maximum to prevent excessive hashing work. Consider breached-password screening and a documented password policy.

#### 2. Validate every request at the API boundary

Controllers destructure request bodies without validating their shape, types, lengths, or formats. Invalid or missing values can lead to exceptions, malformed records, and inconsistent responses.

- Add a shared validation layer for all endpoints. Validate email format and normalization, username rules, password bounds, OTP shape, and expected content types.
- Reject unknown fields and malformed JSON consistently. Limit JSON body size.
- Normalize email consistently (for example, trim and lowercase) before storage and lookup; decide whether usernames are case-sensitive.
- Do not pass client-supplied objects directly into MongoDB query filters or updates.
- Return consistent client-safe validation errors without exposing stack traces or database details.

#### 3. Add abuse controls to authentication endpoints

There is no rate limiting, lockout/backoff, or OTP attempt limit. Login, registration, and OTP endpoints are attractive targets for brute force, enumeration, and resource exhaustion.

- Apply configurable rate limits by IP and by account/email where appropriate to registration, login, OTP send/resend, verification, and refresh endpoints.
- Bound OTP verification attempts and invalidate the code after successful use or too many failed attempts.
- Use generic login and recovery responses where appropriate to reduce account enumeration.
- Add monitoring and alerting for repeated failures, suspicious refresh activity, and unusual registration volume.
- If rate limits must work across multiple application instances, use a shared store rather than process-local memory.

#### 4. Correct OTP generation, expiry, and lifecycle

`generateOTP` uses `Math.random()`, which is not intended for security-sensitive randomness. The OTP model has timestamps but no expiry field or TTL index. The email says the code expires after five minutes, but verification does not check an expiration time. A six-digit OTP also has low entropy and needs strict online attempt limits.

- Generate codes using a cryptographically secure random-number API.
- Store an explicit expiration time and reject expired codes in the verification query/logic. A MongoDB TTL index can clean up old records, but TTL deletion is asynchronous and must not be the only expiry check.
- Enforce one active code per user or email, invalidate previous codes when issuing a replacement, and delete or mark a code consumed atomically after successful verification.
- Limit sending and verification attempts, and avoid returning different responses that reveal whether an email is registered.
- Consider a keyed hash (HMAC with a server-side secret) for low-entropy OTPs; an unkeyed SHA-256 hash can be brute-forced quickly if the OTP collection is exposed.
- Ensure database state is consistent when user creation, OTP creation, and email sending fail partway through. Consider a transaction where supported and/or an outbox/retry design for email.

#### 5. Bind protected access to a valid session

`getMe` verifies a JWT and finds a user, but does not check that the token has a valid `sessionId`, that the session belongs to that user, or that the session has not been revoked. Consequently, revoking a session does not immediately prevent its already-issued access token from being accepted by this endpoint.

- Create shared authentication middleware that validates the access token and attaches a verified principal to the request.
- Require and validate the session identifier, then check that the session is active and belongs to the token's user.
- Apply this middleware to every protected endpoint; do not duplicate partial token parsing in individual controllers.
- Decide the desired revocation behavior. A database session check provides prompt revocation but adds a database read; short-lived access tokens alone reduce but do not eliminate the revocation window.
- Handle a missing user or session as an authentication failure rather than dereferencing a missing result.

#### 6. Harden JWTs and refresh-token rotation

The same `JWT_SECRET` signs access and refresh tokens. Token verification does not visibly constrain the accepted algorithm or validate issuer, audience, and token purpose. Refresh tokens do not carry a distinct token-purpose claim; the newly issued access token in `refreshToken` omits `sessionId`; and refresh lookup does not confirm that the matched session's user is the same user as the verified token. Rotation also needs protection against simultaneous refresh requests.

- Use distinct, high-entropy signing keys (or a managed asymmetric-key setup) for access and refresh tokens, and support deliberate key rotation.
- Set and validate explicit algorithm, issuer, audience, expiry, and token-purpose claims. Reject a refresh token anywhere an access token is required and vice versa.
- Ensure the refresh-token identity, database session, and session owner all match. Include the session ID in newly issued access tokens.
- Make rotation atomic (compare-and-swap or equivalent) so reuse of the previous token is detected rather than accidentally allowing concurrent rotations.
- Define refresh-token reuse handling, session expiry, and cleanup. Store only a one-way digest of refresh tokens, as the current session model intends.
- Ensure revoked or expired sessions cannot be refreshed, including through `logoutAll`.

#### 7. Make errors explicit and startup fail safely

`connectDB` catches connection errors and only logs them; `server.js` does not await it before listening. The server can therefore appear available while MongoDB is unavailable. The email sender catches and logs delivery errors but returns normally, so registration can respond with success even when the verification email was not sent. There is no application-level error-handling middleware.

- Await database connection before opening the listening socket. Fail the process with a non-zero exit if required startup dependencies cannot initialize.
- Add centralized Express error handling with safe client responses and structured server-side logging. Handle validation, duplicate-key, authentication, and unexpected errors deliberately.
- Do not swallow email errors. Decide whether registration fails, reports a recoverable pending state, or queues a retry; reflect that decision accurately in the response.
- Add readiness and liveness endpoints. Readiness should reflect database and other required dependencies.
- Add graceful shutdown for `SIGTERM`/`SIGINT`: stop accepting requests, finish in-flight work, close MongoDB and other resources, and exit within a timeout.

### P1 — Important production hardening

#### 8. Secure cookies, CSRF, and browser behavior

Refresh tokens are put in an `HttpOnly`, `Secure`, `SameSite: "strict"` cookie, which is a good starting point. However, the cookie is set and cleared without a shared explicit options definition, and cookie-based state-changing endpoints require deliberate CSRF protection. `logout` and `logoutAll` currently use GET despite changing server state.

- Use POST for logout operations; GET should not perform state changes.
- Set a narrow cookie path, an intentional domain policy, and consistent attributes for setting and clearing the cookie. Use a `__Host-` cookie name where deployment constraints permit.
- Preserve `HttpOnly` and `Secure` in production. Choose `SameSite` based on the actual frontend/API deployment; if cross-site cookies are required, add CSRF defenses and configure CORS narrowly.
- Add Origin/Referer validation and/or an appropriate CSRF token strategy for cookie-authenticated state-changing requests.
- Document access-token storage for the frontend; avoid persistent browser storage for sensitive tokens where the client architecture allows safer alternatives.

#### 9. Add HTTP and application security controls

`app.js` currently configures JSON parsing, Morgan's `dev` format, and cookie parsing, but no security headers, CORS policy, request-size limit, or production logging policy.

- Add maintained security headers (for example, Helmet) and configure only the policies the application needs.
- Define an explicit allowlist for CORS origins, methods, and headers; do not combine credentials with a wildcard origin.
- Configure a conservative request-body size limit and appropriate request timeouts.
- Use structured production logging with request IDs and redaction. Avoid logging tokens, cookies, passwords, OTPs, authorization headers, or unnecessary personal data. Replace development-oriented request logging in production.
- Configure `trust proxy` only when deployed behind a known, correctly configured proxy; otherwise client IP-based security controls may be spoofed or inaccurate.

#### 10. Improve persistence model constraints

The user schema has unique username/email declarations, but application-level pre-checks alone are race-prone. The OTP and session models have no expiration policy, and session `ip` and `userAgent` are required even though request headers or addresses may not always be present.

- Ensure unique MongoDB indexes are created and deployed before relying on them; handle duplicate-key errors as a normal conflict response. Normalize before indexing.
- Add schema validation, sensible string length limits, and timestamps where useful. Exclude password hashes from normal query projections and API serialization.
- Add TTL or scheduled cleanup policies for expired OTP and session records, while still checking expiry in application logic.
- Make optional request metadata genuinely optional or populate it safely; account for trusted proxy deployment when recording IPs.
- Review index choices with production query patterns and database capacity in mind.

#### 11. Strengthen configuration and secrets management

Configuration checks only whether several environment variables are truthy. It does not validate the port's format/range or enforce strong key material. Google OAuth credentials are required at import time even if email functionality is not configured for a local/test environment.

- Validate configuration once at startup with a schema, clear variable-specific errors, and explicit production requirements.
- Use a secret manager or platform-managed secrets in production. Do not commit `.env` files, production credentials, or real secrets in examples or logs. `.gitignore` currently excludes `.env` and `.env.*` while allowing `.env.example`.
- Use separate credentials and signing keys per environment, rotate them, and plan for JWT key rollover.
- Limit database and email credentials to the permissions required by the service; enforce TLS for external connections.
- Make optional integrations explicit for development/test without allowing a production deployment to start in an unsafe or incomplete mode.

#### 12. Define account and session lifecycle behavior

The current implementation covers registration, email verification, login, refresh, and logout, but not recovery or broader account lifecycle controls. `logoutAll` trusts a validly signed refresh token's user ID without confirming that it is the active session token stored in the database.

- Validate the current refresh token against an active session before allowing account-wide logout, or require authenticated access with an explicit reauthentication policy.
- Add password reset/change flows with one-time, expiring, rate-limited tokens; invalidate relevant sessions after credential changes.
- Define behavior for email changes, account deletion, unverified-account cleanup, and compromised accounts.
- Consider multi-factor authentication for higher-risk use cases and provide recovery codes or another secure recovery mechanism.
- Set product-appropriate maximum session lifetimes and provide a way to view and revoke individual sessions.

### P2 — Reliability, testing, and maintainability

#### 13. Build a meaningful test suite

The `test` script currently exits with “no test specified”; there are no project tests in the reviewed source tree.

- Add unit tests for validators, password handling, token claims, and email behavior.
- Add API integration tests for registration, duplicate users, verification success/failure/expiry/reuse, login success/failure, refresh rotation/reuse/concurrency, session revocation, and logout-all.
- Include missing and malformed inputs, database errors, and email-provider failures.
- Use an isolated test database or controlled database fixtures; never point tests at production data.
- Add tests for authorization boundaries and verify that revoked sessions cannot call protected routes.

#### 14. Add CI, dependency, and release hygiene

- Replace the placeholder test script; add explicit `start`, `dev`, and test scripts that match how the service is run.
- Add linting and formatting checks, a supported Node.js version declaration, and CI steps for install, tests, and build/start validation.
- Keep the lockfile committed and use reproducible installs in CI/deployment. Review dependency updates and security advisories regularly.
- Add deployment documentation for environment variables, migrations/index creation, health checks, rollback, and secret rotation.

#### 15. Plan operations and resilience

- Use MongoDB with authentication, network restrictions, TLS, backups, restore drills, and monitoring. Define retention and data-deletion policies.
- Track authentication success/failure rates, email delivery failures, database latency, refresh reuse, and service health without recording credentials or tokens.
- Define log retention, alert thresholds, incident response, and credential-rotation procedures.
- Use a process manager or orchestrator with resource limits and restart policy. Keep the service stateless across instances; use shared stores for distributed rate limiting and coordination as needed.
- Review privacy, data-protection, and applicable compliance requirements for stored account, IP, and user-agent data.

## Suggested implementation order

1. Add request validation and meaningful tests for current behavior.
2. Replace SHA-256 password storage with bcrypt/Argon2id and design legacy-hash migration.
3. Make OTPs cryptographically random, expiring, one-time, and rate-limited.
4. Add authentication middleware and enforce session ownership/revocation on protected routes.
5. Separate and constrain JWT types/keys; make refresh rotation atomic and session-bound.
6. Correct startup failure behavior, email error handling, and centralized production-safe error handling.
7. Harden cookies, CSRF, rate limits, headers, CORS, logging, and proxy configuration.
8. Add operational checks, deployment configuration validation, CI, backup/restore, and lifecycle features.

## Release gate checklist

- [ ] Passwords use an adaptive password hash; migration from old hashes is addressed.
- [ ] Every public endpoint validates inputs and has appropriate rate/abuse limits.
- [ ] OTP expiry is enforced in code, use is one-time, and attempts are bounded.
- [ ] Access tokens are accepted only for active, matching sessions on protected routes.
- [ ] Access and refresh tokens have distinct validation rules; rotation and reuse behavior are tested.
- [ ] Cookie, CSRF, CORS, TLS, and proxy settings match the deployed browser architecture.
- [ ] Startup fails when required dependencies cannot initialize; health/readiness and graceful shutdown work.
- [ ] Email failures are observable and do not produce misleading success responses.
- [ ] Secrets are managed outside source control and production logs redact sensitive values.
- [ ] Automated integration tests cover critical success, failure, expiry, revocation, and abuse cases.
- [ ] MongoDB indexes, backups, restore procedures, alerts, and deployment rollback are verified.

This review is based on the source as it exists in the working tree at the time of writing. Security and operational decisions should be rechecked against the actual deployment architecture before launch.
