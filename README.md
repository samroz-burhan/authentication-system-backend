# Authentication: how Register, Token and /get-me Work

This section explains how a user signs up, gets a JWT, and proves who they are later.
Diagrams are Mermaid, so GitHub renders them directly.

---

## 1. The big picture

```mermaid
flowchart LR
    C["Client<br/>(Postman, browser, app)"]
    subgraph Server["Express server"]
        R["POST /register<br/>registerUser()"]
        M["GET /get-me<br/>getMe()"]
    end
    DB[("MongoDB<br/>users collection")]
    H["Helpers<br/>crypto sha256<br/>jwt.sign / jwt.verify<br/>JWT_SECRET from .env"]

    C -->|"username, email, password"| R
    R -->|"findOne / create"| DB
    R -->|"hash + sign"| H
    R -->|"201: token + user"| C
    C -->|"Authorization: Bearer token"| M
    M -->|"findById"| DB
    M -->|"jwt.verify"| H
    M -->|"200: username, email"| C
```

Two routes, one database, one secret. Register creates the token. `/get-me` checks it.

---

## 2. Register: step by step

```mermaid
sequenceDiagram
    autonumber
    participant C as Client
    participant R as registerUser()
    participant DB as MongoDB
    participant J as jwt / crypto

    C->>R: POST /register {username, email, password}
    R->>DB: findOne({ $or: [username, email] })
    alt Username or email already exists
        DB-->>R: found a user
        R-->>C: 409 "Username or Email already exists."
    else New user
        DB-->>R: null
        R->>J: sha256(password) → hex hash
        R->>DB: create({ username, email, hashed password })
        DB-->>R: user with _id
        R->>J: jwt.sign({ id: _id }, JWT_SECRET, 1d)
        J-->>R: token
        R-->>C: 201 { message: { message, user: {username, email}, token } }
    end
```

Note: the password is never returned. Only the hash is stored.

---

## 3. Sign: how the token is built

The token has three parts joined by dots: `header.payload.signature`.

```mermaid
flowchart TD
    A["Header<br/>{ alg: HS256, typ: JWT }"] --> AE["base64url encode"]
    B["Payload<br/>{ id, iat, exp }"] --> BE["base64url encode"]
    AE --> J["signing input =<br/>header + '.' + payload"]
    BE --> J
    J --> S["HMAC-SHA256(signing input, JWT_SECRET)"]
    S --> SE["base64url encode"]
    AE --> T["token = header . payload . signature"]
    BE --> T
    SE --> T
```

What `jwt.sign` adds for you:

| Field | Value |
|-------|-------|
| `id` | the user's `_id` (you pass this) |
| `iat` | issued-at time, Unix seconds (added automatically) |
| `exp` | `iat` + 86400 seconds, i.e. 1 day (from `expiresIn: "1d"`) |

---

## 4. Verify: how /get-me checks the token

```mermaid
flowchart TD
    START["GET /get-me<br/>Authorization: Bearer token"] --> HDR{"Header present?"}
    HDR -- "No" --> E401["401 Token Not Found"]
    HDR -- "Yes" --> SPLIT["token = split(' ')[1]"]
    SPLIT --> PARTS{"Exactly 3 parts<br/>separated by dots?"}
    PARTS -- "No" --> E500A["500: jwt malformed"]
    PARTS -- "Yes" --> ALG{"Algorithm allowed?"}
    ALG -- "No" --> E500D["500: bad algorithm"]
    ALG -- "Yes" --> RECOMP["Recompute HMAC over<br/>part1 + '.' + part2<br/>using JWT_SECRET"]
    RECOMP --> SIG{"Matches part3?"}
    SIG -- "No" --> E500B["500: invalid signature"]
    SIG -- "Yes" --> EXP{"now less than exp?"}
    EXP -- "No" --> E500C["500: TokenExpiredError"]
    EXP -- "Yes" --> PAY["Return decoded payload<br/>{ id, iat, exp }"]
    PAY --> FIND["findById(decoded.id)"]
    FIND --> OK["200 { username, email }"]
```

Key rule: the payload is not trusted until the signature matches.

> **Current limitation:** this code has no try/catch around `jwt.verify`, so a bad or expired
> token returns a server error (500) instead of a clean 401. A null check after `findById` is
> also missing.

---

## 5. Tampering fails

```mermaid
flowchart LR
    O["Original token<br/>payload id = 665f..."] --> OK["Signature = S1<br/>valid"]
    X["Attacker edits payload<br/>id = 000000..."] --> RC["Server recomputes HMAC<br/>over the new payload"]
    RC --> NEW["Signature = S2"]
    NEW --> CMP{"S2 equals<br/>token signature S1?"}
    CMP -- "No" --> REJ["Rejected: invalid signature"]
```

Changing the payload changes the signing input, so the old signature no longer fits.
Forging a matching signature needs `JWT_SECRET`, which only the server has.

---

## 6. Full request life cycle

```mermaid
sequenceDiagram
    autonumber
    participant C as Client
    participant S as Server
    participant DB as MongoDB

    rect rgb(245, 240, 230)
    Note over C,DB: Step A: register once
    C->>S: POST /register
    S->>DB: check duplicate, then create user
    S->>S: sign token (1 day)
    S-->>C: 201 + token
    end

    rect rgb(230, 240, 235)
    Note over C,DB: Step B: call /get-me with the token
    C->>S: GET /get-me, Authorization: Bearer token
    S->>S: verify signature and expiry
    S->>DB: findById(decoded.id)
    DB-->>S: user
    S-->>C: 200 { username, email }
    end
```

---

## 7. Test data

Run these in order in Postman or any HTTP client.

**Test 1: register**

```http
POST /register
Content-Type: application/json

{
  "username": "sam",
  "email": "sam@example.com",
  "password": "secret123"
}
```

Expect `201` with a `token`. Copy the token for the next tests.

**Test 2: check the token**

```http
GET /get-me
Authorization: Bearer <token from test 1>
```

Expect `200` with `username` and `email`.

| # | Request | Expected | Why |
|---|---------|----------|-----|
| 1 | POST /register (sam, sam@example.com, secret123) | 201 + token | Happy path |
| 2 | POST /register (sam, other@example.com, x) | 409 | Same username |
| 3 | POST /register (sam2, sam@example.com, x) | 409 | Same email |
| 4 | GET /get-me with token from test 1 | 200 | Valid signature and not expired |
| 5 | GET /get-me with no Authorization header | 401 "Token Not Found" | Stops before verify |
| 6 | GET /get-me with `Bearer abc.def.ghi` | 500 | Malformed or bad signature |
| 7 | GET /get-me with a token edited by one character | 500 | Signature does not match |
| 8 | GET /get-me with a token older than 1 day | 500 | TokenExpiredError |

**Database after test 1**

```json
{
  "_id": "665f1a2b3c4d5e6f7a8b9c0d",
  "username": "sam",
  "email": "sam@example.com",
  "password": "9f86d0...(sha256 of secret123, 64 hex chars)"
}
```

---

## 8. Facts to remember

- The JWT payload is **encoded, not encrypted**. Anyone holding the token can read it. Never put secrets in it.
- `/get-me` is **stateless** for the token: no database lookup is needed to check the signature. Only `findById` touches the database.
- A deleted user's token still passes the signature check. The `findById` lookup is what catches it.
- Changing `JWT_SECRET` invalidates every token already issued.
- Passwords are hashed with **unsalted sha256**. For production, use bcrypt or argon2.
