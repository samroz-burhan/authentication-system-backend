# JWT Authentication — Sequence Diagram & Walkthrough

This document explains the authentication flow in a Node.js, Express, and MongoDB application using:

- **User** — the account stored in MongoDB.
- **Session** — one particular login, usually associated with a browser or device.
- **Access token** — a short-lived JWT sent with protected API requests.
- **Refresh token** — a longer-lived JWT stored in an HTTP-only cookie and used to obtain new tokens.

The diagrams distinguish between what the current controller does and the checks that should be added for a safer implementation.

---

## 1. Big picture

A user can have multiple sessions. For example, logging in on a laptop and a phone creates two separate sessions for the same user.

```mermaid
flowchart TD
    U["User account"] --> S1["Session 1 — Laptop"]
    U --> S2["Session 2 — Phone"]
    U --> S3["Session 3 — Another browser"]

    S1 --> A1["Access token + Refresh token"]
    S2 --> A2["Access token + Refresh token"]
    S3 --> A3["Access token + Refresh token"]
```

**Important:** A session is not the same thing as a user. The user is the account; each session represents one login.

---

## 2. Register / first login

When a user registers, the server creates the account and then creates a session for that login.

```mermaid
sequenceDiagram
    autonumber
    actor Browser
    participant API as Express API
    participant UserDB as MongoDB — Users
    participant SessionDB as MongoDB — Sessions

    Browser->>API: POST /register (username, email, password)
    API->>UserDB: Find user with same username OR email
    UserDB-->>API: No matching user
    API->>API: Hash password
    API->>UserDB: Create user
    UserDB-->>API: Return user with _id

    API->>API: Sign refresh JWT (user id, 7-day expiry)
    API->>API: Hash refresh token
    API->>SessionDB: Create session (user id, refresh-token hash, device info)
    SessionDB-->>API: Return session with _id

    API->>API: Sign access JWT (user id + session id, 15-minute expiry)
    API-->>Browser: Set refresh-token cookie + return access token
```

### What is happening?

1. The browser sends the registration details.
2. The server checks whether the username or email is already in use.
3. The server hashes the password and saves the new user.
4. The server creates a refresh token for that user.
5. The server hashes the refresh token and stores the hash in a new session document.
6. The server creates an access token containing the user's ID and this session's ID.
7. The server sends the access token in the response and the refresh token in a cookie.

**Why save a hash of the refresh token?** If someone gets a copy of your database, they should not be able to directly use the stored refresh-token value. The server hashes the token received from the browser and compares that hash with the stored hash.

> Passwords should be hashed with a password-hashing algorithm such as Argon2 or bcrypt. A fast SHA-256 hash is not suitable for password storage.

---

## 3. Access a protected route — `GET /me`

The access token proves which user is making the request. It should also identify the session that made the request.

```mermaid
sequenceDiagram
    autonumber
    actor Browser
    participant API as Express API
    participant JWT as JWT verification
    participant UserDB as MongoDB — Users
    participant SessionDB as MongoDB — Sessions

    Browser->>API: GET /me + Authorization: Bearer accessToken
    API->>JWT: Verify access token
    JWT-->>API: Decoded user id + session id
    API->>SessionDB: Find active session belonging to this user
    SessionDB-->>API: Active session found
    API->>UserDB: Find user by decoded user id
    UserDB-->>API: User document
    API-->>Browser: 200 OK — username and email
```

### What is happening?

1. The browser sends the access token in the `Authorization` header.
2. The server verifies the JWT signature and expiry.
3. The decoded token gives the server the user ID and session ID.
4. The server checks that the session still exists, belongs to that user, and has not been revoked.
5. The server finds the user and returns the requested information.

**Important difference in your current code:** Your current `getMe` verifies the access token and finds the user, but it does not check the session ID or whether the session has been revoked. The session check shown above is a recommended addition, not something your current controller already does.

---

## 4. Refresh tokens — when the access token expires

The access token is short-lived. When it expires, the browser can use the refresh token cookie to request a new access token without asking the user to log in again.

```mermaid
sequenceDiagram
    autonumber
    actor Browser
    participant API as Express API
    participant JWT as JWT verification
    participant SessionDB as MongoDB — Sessions

    Browser->>API: POST /refresh (refresh-token cookie sent automatically)
    API->>JWT: Verify refresh token
    JWT-->>API: Decoded user id
    API->>API: Hash received refresh token
    API->>SessionDB: Find matching, active session
    SessionDB-->>API: Session found

    API->>API: Sign new access token
    API->>API: Sign new refresh token
    API->>API: Hash new refresh token
    API->>SessionDB: Replace old refresh-token hash with new hash
    SessionDB-->>API: Session updated
    API-->>Browser: Set new refresh-token cookie + return new access token
```

### What is token rotation?

Imagine the session currently stores the hash of refresh token **R1**.

- The browser sends **R1** to the refresh endpoint.
- The server verifies R1 and checks its hash against the session.
- The server creates a new refresh token, **R2**.
- The server replaces the stored hash of R1 with the hash of R2.
- The browser receives R2 in the updated cookie.

After rotation, R1 should no longer work because its hash is no longer stored in the session.

### Does refresh create a new session?

**No.** In this design, refresh updates the existing session document. The user is still logged in from the same device/browser. A new session is normally created when the user logs in from another device or browser.

**Important difference in your current code:** Your refresh controller updates the existing session's refresh-token hash, which is correct for this design. Make sure the new access token also includes the session ID, and verify that the matched session belongs to the user ID in the refresh JWT.

---

## 5. Logout

Logout revokes the current session so its refresh token can no longer be used.

```mermaid
sequenceDiagram
    autonumber
    actor Browser
    participant API as Express API
    participant SessionDB as MongoDB — Sessions

    Browser->>API: POST /logout (refresh-token cookie)
    API->>API: Hash received refresh token
    API->>SessionDB: Find matching active session
    SessionDB-->>API: Session found
    API->>SessionDB: Set revoked = true
    SessionDB-->>API: Session saved
    API-->>Browser: Clear refresh-token cookie + return success
```

### What is happening?

1. The browser sends its refresh-token cookie.
2. The server hashes the token and finds the matching active session.
3. The server marks that session as revoked.
4. The server clears the cookie in the browser.

The user can still have other active sessions. For example, logging out on a laptop does not automatically log them out on their phone.

**Access-token note:** Revoking a session does not automatically invalidate an already-issued JWT. If protected routes only verify the JWT, that access token can remain usable until it expires. Checking the session's revoked status on protected requests prevents that.

---

## 6. How the four flows fit together

```mermaid
flowchart TD
    A["Register / Login"] --> B["Create user if registering"]
    B --> C["Create a session"]
    C --> D["Issue access token + refresh token"]
    D --> E["Call protected APIs with access token"]
    E --> F{"Access token valid?"}
    F -->|Yes| G["Return protected data"]
    F -->|No / expired| H["Call refresh endpoint"]
    H --> I{"Refresh token and session valid?"}
    I -->|Yes| J["Rotate refresh token and issue new access token"]
    J --> E
    I -->|No| K["Ask user to log in again"]
    G --> L["Logout"]
    L --> M["Revoke current session"]
```

---

## 7. Quick comparison

| Item | Purpose | Typical lifetime | Where it is kept |
|---|---|---:|---|
| User | Represents the account | Until account deletion | MongoDB users collection |
| Session | Represents one login/device | Until expiry or revocation | MongoDB sessions collection |
| Access token | Access protected APIs | 15 minutes in this project | Usually held by the frontend and sent in the Authorization header |
| Refresh token | Obtain a new token pair | 7 days in this project | HTTP-only cookie; only its hash is stored in the database |

---

## 8. Important implementation checks

Before treating the authentication system as production-ready, check these points:

- [ ] Fix the cookie option typo: use `httpOnly`, not `httyOnly`.
- [ ] Hash passwords with bcrypt or Argon2, not plain SHA-256.
- [ ] Include both `userId` and `sessionId` in access tokens.
- [ ] In `GET /me` and other protected routes, check that the session exists, belongs to the user, and is not revoked.
- [ ] During refresh, verify that the matched session belongs to the user ID in the refresh token.
- [ ] When rotating refresh tokens, replace the stored hash and reject the old token.
- [ ] Clear the cookie using matching cookie options (especially path and same-site settings).
- [ ] Consider refresh-token reuse detection and appropriate handling if an old, already-rotated token is presented.

---

## 9. The simplest way to remember it

- **Register/Login:** Create a session and issue tokens.
- **Access token:** Use it to enter protected routes.
- **Refresh token:** Use it to get a fresh access token when the old one expires.
- **Refresh rotation:** Replace the old refresh token with a new one in the same session.
- **Logout:** Revoke that session.

**One user can have many sessions. Each session has its own token pair.**
