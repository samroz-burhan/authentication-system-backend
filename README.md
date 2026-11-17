<p align="center">
  <img src="banner.png" alt="Auth Project banner by Samroz Burhan" width="100%"/>
</p>

<h1 align="center">🔐 Auth Project</h1>

<p align="center">
  <b>A secure authentication back end for modern apps</b><br/>
  Verify emails, sign users in, manage device sessions, and protect every request.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-active-brightgreen?style=flat-square" alt="Status"/>
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT License"/>
  <img src="https://img.shields.io/badge/made%20by-Samroz%20Burhan-blueviolet?style=flat-square" alt="Made by Samroz Burhan"/>
</p>

<p align="center">
  <a href="#-overview">Overview</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-how-it-works">How It Works</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-sequence-diagrams">Sequence Diagrams</a> •
  <a href="#-api-reference">API</a> •
  <a href="#️-setup">Setup</a> •
  <a href="#-author">Author</a>
</p>

---

## 📖 Overview

**Auth Project** is the back end for a simple but secure account system. Think of it as the front desk for your app:

| Step | What happens |
|:---:|---|
| 📝 | A person **registers** with a username, email, and password |
| 📧 | A **six-digit code** is emailed to confirm the address |
| 🔑 | The person **signs in** and gets a short-lived access token |
| 🍪 | A **refresh cookie** keeps them signed in safely |
| 🛡️ | Every protected request is checked against an **active session** |
| 🚪 | **Sign-out** revokes one device, or all of them |

---

## 🧰 Tech Stack

<p align="center">
  <b>🟢 Runtime and language</b><br/><br/>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript"/>
  <img src="https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white" alt="npm"/>
</p>

<p align="center">
  <b>⚡ Backend and database</b><br/><br/>
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express"/>
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logoColor=white" alt="Mongoose"/>
</p>

<p align="center">
  <b>🔐 Authentication and security</b><br/><br/>
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT"/>
  <img src="https://img.shields.io/badge/bcrypt-003A70?style=for-the-badge&logoColor=white" alt="bcrypt"/>
  <img src="https://img.shields.io/badge/Rate%20Limiting-express--rate--limit-FF6F00?style=for-the-badge&logoColor=white" alt="express-rate-limit"/>
  <img src="https://img.shields.io/badge/Cookies-cookie--parser-5C4EE5?style=for-the-badge&logoColor=white" alt="cookie-parser"/>
</p>

<p align="center">
  <b>📧 Email delivery</b><br/><br/>
  <img src="https://img.shields.io/badge/Gmail-EA4335?style=for-the-badge&logo=gmail&logoColor=white" alt="Gmail"/>
  <img src="https://img.shields.io/badge/Google%20OAuth2-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Google OAuth2"/>
  <img src="https://img.shields.io/badge/Nodemailer-0A66C2?style=for-the-badge&logoColor=white" alt="Nodemailer"/>
</p>

<p align="center">
  <b>🛠️ Configuration, logging, and development</b><br/><br/>
  <img src="https://img.shields.io/badge/dotenv-ECD53F?style=for-the-badge&logoColor=black" alt="dotenv"/>
  <img src="https://img.shields.io/badge/Morgan-logger-5A5A5A?style=for-the-badge&logoColor=white" alt="Morgan"/>
  <img src="https://img.shields.io/badge/nodemon-76D04B?style=for-the-badge&logo=nodemon&logoColor=white" alt="nodemon"/>
</p>

<br/>

### 📚 What each tool does

| | Tool | Role in this project |
|:---:|---|---|
| <img src="https://cdn.simpleicons.org/nodedotjs/339933" width="24"/> | **Node.js** | Runs the server |
| <img src="https://cdn.simpleicons.org/express/000000" width="24"/> | **Express** | Routes HTTP requests and runs middleware |
| <img src="https://cdn.simpleicons.org/mongodb/47A248" width="24"/> | **MongoDB** | Stores users, email codes, and sessions |
| 🗄️ | **Mongoose** | Defines schemas and models for MongoDB |
| <img src="https://cdn.simpleicons.org/jsonwebtokens/000000" width="24"/> | **jsonwebtoken** | Creates and verifies access and refresh tokens |
| 🔒 | **bcrypt** | Hashes passwords and compares login attempts safely |
| 🚦 | **express-rate-limit** | Limits repeated requests per IP address |
| 🍪 | **cookie-parser** | Reads the HTTP-only refresh cookie |
| <img src="https://cdn.simpleicons.org/gmail/EA4335" width="24"/> | **Gmail OAuth2** | Authorizes the account used to send email |
| <img src="https://cdn.simpleicons.org/google/4285F4" width="24"/> | **Google OAuth2** | Provides the OAuth2 credentials for Gmail |
| 📨 | **Nodemailer** | Builds and sends verification emails |
| ⚙️ | **dotenv** | Loads settings from the `.env` file |
| 📜 | **Morgan** | Logs HTTP requests in development |
| <img src="https://cdn.simpleicons.org/npm/CB3837" width="24"/> | **npm** | Installs packages and runs scripts |
| <img src="https://cdn.simpleicons.org/nodemon/76D04B" width="24"/> | **nodemon** | Restarts the server on file changes (`npm run dev`) |
| 🧪 | **Vitest** | Runs unit tests once or in watch mode |

---

## 📖 How It Works

The system uses **two tokens**, each with one job:

| | 🎫 Access token | 🍪 Refresh token |
|---|---|---|
| **Lifetime** | 15 minutes | 7 days |
| **Stored in** | Frontend memory | `HttpOnly` cookie |
| **Sent as** | `Authorization: Bearer <token>` | Automatically by the browser |
| **Purpose** | Proves identity on protected routes | Gets a fresh access token |

Each login creates a **session** for that browser or device. The access token is useless once its session is revoked.

> [!IMPORTANT]
> An access token alone is **not enough**. The server also checks that its session is still active, unexpired, and not revoked.

---

## ✨ Highlights

- 🔐 **Passwords** hashed with bcrypt; hashes are never returned by normal queries
- 📧 **Email verification** with cryptographic codes, expiry, and attempt limits
- 🧾 **Device sessions** tracked in MongoDB, each with its own revocation
- 🔄 **Refresh-token rotation** with reuse detection
- 🍪 **Secure cookies** that are `HttpOnly`, `SameSite=Strict`, and `Secure` in production
- 🌐 **Origin checks** that allow only your configured frontend
- 🚦 **Rate limits** on login, registration, verification, and refresh
- 🧪 **Unit tests** for validation, tokens, limits, and origins

---

## 🏗️ Architecture

How a request moves through the codebase:

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'background': '#000000', 'primaryColor': '#111111', 'primaryTextColor': '#ffffff', 'primaryBorderColor': '#ff8c00', 'lineColor': '#ff8c00', 'secondaryColor': '#181818', 'tertiaryColor': '#222222', 'textColor': '#f5f5f5', 'mainBkg': '#111111', 'nodeBorder': '#ff8c00', 'clusterBkg': '#080808', 'clusterBorder': '#666666', 'titleColor': '#ffffff', 'edgeLabelBackground': '#111111', 'actorBkg': '#111111', 'actorBorder': '#ff8c00', 'actorTextColor': '#ffffff', 'actorLineColor': '#ff8c00', 'signalColor': '#f5f5f5', 'signalTextColor': '#ffffff', 'labelBoxBkgColor': '#111111', 'labelBoxBorderColor': '#ff8c00', 'labelTextColor': '#ffffff', 'loopTextColor': '#ffffff', 'noteBkgColor': '#111111', 'noteBorderColor': '#ff8c00', 'noteTextColor': '#ffffff', 'activationBkgColor': '#222222', 'activationBorderColor': '#ff8c00', 'sequenceNumberColor': '#000000', 'stateBkg': '#111111', 'stateBorder': '#ff8c00', 'stateLabelColor': '#ffffff', 'transitionColor': '#ff8c00', 'fontFamily': 'Segoe UI, Helvetica, Arial'}}}%%
flowchart TD
    Browser(["🌐 Browser or Frontend"])

    subgraph APP["⚙️ Express App  (src/app.js)"]
        direction TB
        J["JSON parser · 16 KB limit"]
        L["Morgan request logger"]
        CP["Cookie parser"]
        O{"Origin check<br/>origin.middleware.js"}
        R["Routes<br/>auth.routes.js"]
        RL["Rate limiters<br/>authLimiters.js"]
        AM["Access token check<br/>auth.middleware.js"]
        C["Controllers<br/>auth.controller.js"]
        E["Error handler<br/>error.middleware.js"]
        NF["404 handler"]
    end

    subgraph LOGIC["🧩 Business Logic"]
        S["auth.service.js"]
        V["authValidation.js"]
        T["tokens.js"]
        U["utils.js · codes and hashes"]
    end

    subgraph DATA["🗄️ MongoDB"]
        UM[("users")]
        OM[("otps")]
        SM[("sessions")]
    end

    MAIL["📧 email.service.js<br/>Gmail OAuth2"]
    X1(["🚫 403 Forbidden"])

    Browser --> J --> L --> CP --> O
    O -- allowed --> R
    O -- rejected --> X1
    R --> RL --> C
    R -. GET /get-me .-> AM --> C
    C --> S
    S --> V
    S --> T
    S --> U
    S --> UM
    S --> OM
    AM --> SM
    S --> SM
    S --> MAIL
    C -. errors .-> E
    R -. unknown path .-> NF

    classDef store fill:#101810,stroke:#57c785,color:#f5fff7
    classDef external fill:#1b1308,stroke:#ff8c00,color:#fff1dc
    classDef bad fill:#1d0d0d,stroke:#ff6b6b,color:#ffe5e5
    class UM,OM,SM store
    class MAIL external
    class X1 bad
```

> **Startup:** `server.js` loads and checks configuration, connects to MongoDB, and only then starts listening. A failed first connection stops the process.

---

## 🔄 Sequence Diagrams

Each endpoint has its own diagram. The journey below shows how they connect.

### 🗺️ End-to-end journey

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'background': '#000000', 'primaryColor': '#111111', 'primaryTextColor': '#ffffff', 'primaryBorderColor': '#ff8c00', 'lineColor': '#ff8c00', 'secondaryColor': '#181818', 'tertiaryColor': '#222222', 'textColor': '#f5f5f5', 'mainBkg': '#111111', 'nodeBorder': '#ff8c00', 'clusterBkg': '#080808', 'clusterBorder': '#666666', 'titleColor': '#ffffff', 'edgeLabelBackground': '#111111', 'actorBkg': '#111111', 'actorBorder': '#ff8c00', 'actorTextColor': '#ffffff', 'actorLineColor': '#ff8c00', 'signalColor': '#f5f5f5', 'signalTextColor': '#ffffff', 'labelBoxBkgColor': '#111111', 'labelBoxBorderColor': '#ff8c00', 'labelTextColor': '#ffffff', 'loopTextColor': '#ffffff', 'noteBkgColor': '#111111', 'noteBorderColor': '#ff8c00', 'noteTextColor': '#ffffff', 'activationBkgColor': '#222222', 'activationBorderColor': '#ff8c00', 'sequenceNumberColor': '#000000', 'stateBkg': '#111111', 'stateBorder': '#ff8c00', 'stateLabelColor': '#ffffff', 'transitionColor': '#ff8c00', 'fontFamily': 'Segoe UI, Helvetica, Arial'}}}%%
sequenceDiagram
    autonumber
    actor P as 👤 Person
    participant B as 🌐 Browser
    participant API as ⚙️ Express API
    participant DB as 🗄️ MongoDB
    participant M as 📧 Gmail OAuth2

    rect rgb(12, 12, 12)
    Note over P,M: 1 · Registration and verification
    P->>B: Submit username, email, password
    B->>API: POST /register
    API->>DB: Save user (verified = false) and OTP hash
    API->>M: Send six-digit code
    API-->>B: 201 Created
    P->>B: Enter code from email
    B->>API: POST /verify-email
    API->>DB: Consume OTP, set verified = true
    API-->>B: 200 OK
    end

    rect rgb(16, 16, 16)
    Note over P,DB: 2 · Sign in
    P->>B: Submit email and password
    B->>API: POST /login
    API->>DB: Create session
    API-->>B: accessToken (JSON) + refresh cookie
    end

    rect rgb(20, 20, 20)
    Note over B,DB: 3 · Protected request and refresh
    B->>API: GET /get-me (Bearer access token)
    API->>DB: Confirm session is active
    API-->>B: username and email
    B->>API: POST /refresh-token (refresh cookie)
    API->>DB: Rotate refresh-token hash
    API-->>B: New accessToken + new refresh cookie
    end

    rect rgb(24, 24, 24)
    Note over B,DB: 4 · Sign out
    B->>API: POST /logout (refresh cookie)
    API->>DB: Revoke session
    API-->>B: 200 OK, cookie cleared
    end
```

---

### 1️⃣ Register · `POST /register`

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'background': '#000000', 'primaryColor': '#111111', 'primaryTextColor': '#ffffff', 'primaryBorderColor': '#ff8c00', 'lineColor': '#ff8c00', 'secondaryColor': '#181818', 'tertiaryColor': '#222222', 'textColor': '#f5f5f5', 'mainBkg': '#111111', 'nodeBorder': '#ff8c00', 'clusterBkg': '#080808', 'clusterBorder': '#666666', 'titleColor': '#ffffff', 'edgeLabelBackground': '#111111', 'actorBkg': '#111111', 'actorBorder': '#ff8c00', 'actorTextColor': '#ffffff', 'actorLineColor': '#ff8c00', 'signalColor': '#f5f5f5', 'signalTextColor': '#ffffff', 'labelBoxBkgColor': '#111111', 'labelBoxBorderColor': '#ff8c00', 'labelTextColor': '#ffffff', 'loopTextColor': '#ffffff', 'noteBkgColor': '#111111', 'noteBorderColor': '#ff8c00', 'noteTextColor': '#ffffff', 'activationBkgColor': '#222222', 'activationBorderColor': '#ff8c00', 'sequenceNumberColor': '#000000', 'stateBkg': '#111111', 'stateBorder': '#ff8c00', 'stateLabelColor': '#ffffff', 'transitionColor': '#ff8c00', 'fontFamily': 'Segoe UI, Helvetica, Arial'}}}%%
sequenceDiagram
    autonumber
    actor P as 👤 Person
    participant C as 🌐 Client
    participant API as ⚙️ Express API
    participant DB as 🗄️ MongoDB
    participant M as 📧 Gmail OAuth2

    P->>C: Fill in username, email, password
    C->>API: POST /api/auth/register
    API->>API: Trim, normalize, and validate input
    API->>DB: Look for duplicate username or email
    alt Duplicate found
        DB-->>API: Existing account
        API-->>C: 409 Conflict
    else Available
        API->>API: bcrypt hash the password
        API->>DB: Save user with verified = false
        API->>API: Generate 6-digit code, HMAC it
        API->>DB: Save OTP hash, attempts = 0, expiry = now + 5 min
        API->>M: Send verification email
        alt Email accepted
            M-->>API: Sent
            API-->>C: 201 Created with public user
            C-->>P: Account created, check your email
        else Email failed
            M-->>API: Error
            API-->>C: 502 Bad Gateway
            Note over API,DB: Account stays unverified and can request a new code
        end
    end
```

📨 **Request:** `username`, `email`, `password` &nbsp;·&nbsp; ✅ **Success:** `201 Created`

---

### 2️⃣ Verify email · `POST /verify-email`

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'background': '#000000', 'primaryColor': '#111111', 'primaryTextColor': '#ffffff', 'primaryBorderColor': '#ff8c00', 'lineColor': '#ff8c00', 'secondaryColor': '#181818', 'tertiaryColor': '#222222', 'textColor': '#f5f5f5', 'mainBkg': '#111111', 'nodeBorder': '#ff8c00', 'clusterBkg': '#080808', 'clusterBorder': '#666666', 'titleColor': '#ffffff', 'edgeLabelBackground': '#111111', 'actorBkg': '#111111', 'actorBorder': '#ff8c00', 'actorTextColor': '#ffffff', 'actorLineColor': '#ff8c00', 'signalColor': '#f5f5f5', 'signalTextColor': '#ffffff', 'labelBoxBkgColor': '#111111', 'labelBoxBorderColor': '#ff8c00', 'labelTextColor': '#ffffff', 'loopTextColor': '#ffffff', 'noteBkgColor': '#111111', 'noteBorderColor': '#ff8c00', 'noteTextColor': '#ffffff', 'activationBkgColor': '#222222', 'activationBorderColor': '#ff8c00', 'sequenceNumberColor': '#000000', 'stateBkg': '#111111', 'stateBorder': '#ff8c00', 'stateLabelColor': '#ffffff', 'transitionColor': '#ff8c00', 'fontFamily': 'Segoe UI, Helvetica, Arial'}}}%%
sequenceDiagram
    autonumber
    actor P as 👤 Person
    participant C as 🌐 Client
    participant API as ⚙️ Express API
    participant DB as 🗄️ MongoDB

    P->>C: Enter email and six-digit code
    C->>API: POST /api/auth/verify-email
    API->>API: Validate email and code format
    API->>DB: Find user by email
    alt Unknown account
        DB-->>API: Nothing found
        API-->>C: 404 Not Found
    else Account found
        API->>DB: Load current OTP record
        alt Missing, expired, or five guesses used
            DB-->>API: No usable code
            API-->>C: Error with safe message
        else Usable code
            API->>API: HMAC the submitted code
            alt Hash does not match
                API->>DB: Increment attempts
                API-->>C: Error, code incorrect
            else Hash matches
                API->>DB: Consume OTP record
                API->>DB: Set verified = true
                API-->>C: 200 OK, email verified
            end
        end
    end
```

📨 **Request:** `email`, `otp` &nbsp;·&nbsp; ✅ **Success:** `200 OK`

---

### 3️⃣ Resend verification · `POST /resend-verification`

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'background': '#000000', 'primaryColor': '#111111', 'primaryTextColor': '#ffffff', 'primaryBorderColor': '#ff8c00', 'lineColor': '#ff8c00', 'secondaryColor': '#181818', 'tertiaryColor': '#222222', 'textColor': '#f5f5f5', 'mainBkg': '#111111', 'nodeBorder': '#ff8c00', 'clusterBkg': '#080808', 'clusterBorder': '#666666', 'titleColor': '#ffffff', 'edgeLabelBackground': '#111111', 'actorBkg': '#111111', 'actorBorder': '#ff8c00', 'actorTextColor': '#ffffff', 'actorLineColor': '#ff8c00', 'signalColor': '#f5f5f5', 'signalTextColor': '#ffffff', 'labelBoxBkgColor': '#111111', 'labelBoxBorderColor': '#ff8c00', 'labelTextColor': '#ffffff', 'loopTextColor': '#ffffff', 'noteBkgColor': '#111111', 'noteBorderColor': '#ff8c00', 'noteTextColor': '#ffffff', 'activationBkgColor': '#222222', 'activationBorderColor': '#ff8c00', 'sequenceNumberColor': '#000000', 'stateBkg': '#111111', 'stateBorder': '#ff8c00', 'stateLabelColor': '#ffffff', 'transitionColor': '#ff8c00', 'fontFamily': 'Segoe UI, Helvetica, Arial'}}}%%
sequenceDiagram
    autonumber
    actor P as 👤 Person
    participant C as 🌐 Client
    participant API as ⚙️ Express API
    participant DB as 🗄️ MongoDB
    participant M as 📧 Gmail OAuth2

    P->>C: Request a new code
    C->>API: POST /api/auth/resend-verification
    API->>API: Validate email
    API->>DB: Find user by email
    alt No account, or already verified
        API-->>C: 200 OK, same generic message
        Note over API,C: Response does not reveal which emails exist
    else Unverified account
        API->>API: Generate new code, HMAC it
        API->>DB: Replace previous OTP record
        API->>M: Send new code
        alt Email accepted
            API-->>C: 200 OK, same generic message
        else Email failed
            API-->>C: 502 Bad Gateway
        end
    end
```

📨 **Request:** `email` only &nbsp;·&nbsp; ✅ **Success:** `200 OK`

---

### 4️⃣ Login · `POST /login`

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'background': '#000000', 'primaryColor': '#111111', 'primaryTextColor': '#ffffff', 'primaryBorderColor': '#ff8c00', 'lineColor': '#ff8c00', 'secondaryColor': '#181818', 'tertiaryColor': '#222222', 'textColor': '#f5f5f5', 'mainBkg': '#111111', 'nodeBorder': '#ff8c00', 'clusterBkg': '#080808', 'clusterBorder': '#666666', 'titleColor': '#ffffff', 'edgeLabelBackground': '#111111', 'actorBkg': '#111111', 'actorBorder': '#ff8c00', 'actorTextColor': '#ffffff', 'actorLineColor': '#ff8c00', 'signalColor': '#f5f5f5', 'signalTextColor': '#ffffff', 'labelBoxBkgColor': '#111111', 'labelBoxBorderColor': '#ff8c00', 'labelTextColor': '#ffffff', 'loopTextColor': '#ffffff', 'noteBkgColor': '#111111', 'noteBorderColor': '#ff8c00', 'noteTextColor': '#ffffff', 'activationBkgColor': '#222222', 'activationBorderColor': '#ff8c00', 'sequenceNumberColor': '#000000', 'stateBkg': '#111111', 'stateBorder': '#ff8c00', 'stateLabelColor': '#ffffff', 'transitionColor': '#ff8c00', 'fontFamily': 'Segoe UI, Helvetica, Arial'}}}%%
sequenceDiagram
    autonumber
    actor P as 👤 Person
    participant C as 🌐 Client
    participant API as ⚙️ Express API
    participant DB as 🗄️ MongoDB

    P->>C: Enter email and password
    C->>API: POST /api/auth/login (credentials included)
    API->>API: Validate input
    API->>DB: Find user and select password hash
    alt Unknown account, wrong password, or not verified
        API-->>C: 401 Same public login error
    else Credentials valid and email verified
        API->>DB: Create session (user, IP, user agent, expiry)
        API->>API: Sign access token (15 min, tokenUse = access)
        API->>API: Sign refresh token (7 days, tokenUse = refresh)
        API->>DB: Store SHA-256 hash of refresh token on session
        API-->>C: 200 OK with accessToken in JSON
        API-->>C: Set-Cookie refresh token (HttpOnly, SameSite=Strict)
        C-->>P: Signed in
    end
```

📨 **Request:** `email`, `password` &nbsp;·&nbsp; ✅ **Success:** `200 OK` + refresh cookie

---

### 5️⃣ Get current user · `GET /get-me`

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'background': '#000000', 'primaryColor': '#111111', 'primaryTextColor': '#ffffff', 'primaryBorderColor': '#ff8c00', 'lineColor': '#ff8c00', 'secondaryColor': '#181818', 'tertiaryColor': '#222222', 'textColor': '#f5f5f5', 'mainBkg': '#111111', 'nodeBorder': '#ff8c00', 'clusterBkg': '#080808', 'clusterBorder': '#666666', 'titleColor': '#ffffff', 'edgeLabelBackground': '#111111', 'actorBkg': '#111111', 'actorBorder': '#ff8c00', 'actorTextColor': '#ffffff', 'actorLineColor': '#ff8c00', 'signalColor': '#f5f5f5', 'signalTextColor': '#ffffff', 'labelBoxBkgColor': '#111111', 'labelBoxBorderColor': '#ff8c00', 'labelTextColor': '#ffffff', 'loopTextColor': '#ffffff', 'noteBkgColor': '#111111', 'noteBorderColor': '#ff8c00', 'noteTextColor': '#ffffff', 'activationBkgColor': '#222222', 'activationBorderColor': '#ff8c00', 'sequenceNumberColor': '#000000', 'stateBkg': '#111111', 'stateBorder': '#ff8c00', 'stateLabelColor': '#ffffff', 'transitionColor': '#ff8c00', 'fontFamily': 'Segoe UI, Helvetica, Arial'}}}%%
sequenceDiagram
    autonumber
    participant C as 🌐 Client
    participant MW as 🛡️ Auth Middleware
    participant DB as 🗄️ MongoDB
    participant CTRL as 🎛️ Controller

    C->>MW: GET /api/auth/get-me with Bearer access token
    alt Header missing or not in Bearer form
        MW-->>C: 401 A bearer access token is required
    else Header well formed
        MW->>MW: Verify signature, expiry, issuer, audience, tokenUse
        alt Token invalid or expired
            MW-->>C: 401 Invalid or expired token
        else Token valid
            MW->>DB: Find session by id, user, revoked = false, expiresAt > now
            alt No active session
                DB-->>MW: Nothing found
                MW-->>C: 401 Unauthorized
            else Active session
                DB-->>MW: Session record
                MW->>CTRL: Pass userId and sessionId
                CTRL-->>C: 200 OK with username and email
            end
        end
    end
```

📨 **Needs:** `Authorization: Bearer <accessToken>` &nbsp;·&nbsp; ✅ **Success:** `200 OK`

---

### 6️⃣ Refresh token · `POST /refresh-token`

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'background': '#000000', 'primaryColor': '#111111', 'primaryTextColor': '#ffffff', 'primaryBorderColor': '#ff8c00', 'lineColor': '#ff8c00', 'secondaryColor': '#181818', 'tertiaryColor': '#222222', 'textColor': '#f5f5f5', 'mainBkg': '#111111', 'nodeBorder': '#ff8c00', 'clusterBkg': '#080808', 'clusterBorder': '#666666', 'titleColor': '#ffffff', 'edgeLabelBackground': '#111111', 'actorBkg': '#111111', 'actorBorder': '#ff8c00', 'actorTextColor': '#ffffff', 'actorLineColor': '#ff8c00', 'signalColor': '#f5f5f5', 'signalTextColor': '#ffffff', 'labelBoxBkgColor': '#111111', 'labelBoxBorderColor': '#ff8c00', 'labelTextColor': '#ffffff', 'loopTextColor': '#ffffff', 'noteBkgColor': '#111111', 'noteBorderColor': '#ff8c00', 'noteTextColor': '#ffffff', 'activationBkgColor': '#222222', 'activationBorderColor': '#ff8c00', 'sequenceNumberColor': '#000000', 'stateBkg': '#111111', 'stateBorder': '#ff8c00', 'stateLabelColor': '#ffffff', 'transitionColor': '#ff8c00', 'fontFamily': 'Segoe UI, Helvetica, Arial'}}}%%
sequenceDiagram
    autonumber
    participant B as 🌐 Browser
    participant API as ⚙️ Express API
    participant DB as 🗄️ MongoDB

    B->>API: POST /api/auth/refresh-token (cookie sent automatically)
    API->>API: Verify signature, expiry, tokenUse = refresh
    alt Token invalid or expired
        API-->>B: 401 Invalid or expired token
    else Token valid
        API->>API: SHA-256 hash the presented token (old hash)
        API->>API: Sign new access token and new refresh token
        API->>API: SHA-256 hash the new refresh token (new hash)
        API->>DB: Atomic update where session active and hash = old hash
        alt Update matched (rotation succeeded)
            DB-->>API: Session now stores new hash
            API-->>B: 200 OK with new accessToken
            API-->>B: Set-Cookie with new refresh token
        else Old hash no longer current (reuse)
            API->>DB: Revoke session
            API-->>B: 401 Unauthorized
            Note over API,DB: Reuse of a rotated token signals a stolen token
        end
    end
```

📨 **Needs:** refresh cookie &nbsp;·&nbsp; ✅ **Success:** `200 OK` + new refresh cookie

> [!WARNING]
> Do not send refresh requests from several tabs at the same time. If two requests use the same old token, the second is treated as reuse and the session is revoked. Coordinate refreshes in the frontend, for example with one shared promise.

---

### 7️⃣ Logout · `POST /logout`

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'background': '#000000', 'primaryColor': '#111111', 'primaryTextColor': '#ffffff', 'primaryBorderColor': '#ff8c00', 'lineColor': '#ff8c00', 'secondaryColor': '#181818', 'tertiaryColor': '#222222', 'textColor': '#f5f5f5', 'mainBkg': '#111111', 'nodeBorder': '#ff8c00', 'clusterBkg': '#080808', 'clusterBorder': '#666666', 'titleColor': '#ffffff', 'edgeLabelBackground': '#111111', 'actorBkg': '#111111', 'actorBorder': '#ff8c00', 'actorTextColor': '#ffffff', 'actorLineColor': '#ff8c00', 'signalColor': '#f5f5f5', 'signalTextColor': '#ffffff', 'labelBoxBkgColor': '#111111', 'labelBoxBorderColor': '#ff8c00', 'labelTextColor': '#ffffff', 'loopTextColor': '#ffffff', 'noteBkgColor': '#111111', 'noteBorderColor': '#ff8c00', 'noteTextColor': '#ffffff', 'activationBkgColor': '#222222', 'activationBorderColor': '#ff8c00', 'sequenceNumberColor': '#000000', 'stateBkg': '#111111', 'stateBorder': '#ff8c00', 'stateLabelColor': '#ffffff', 'transitionColor': '#ff8c00', 'fontFamily': 'Segoe UI, Helvetica, Arial'}}}%%
sequenceDiagram
    autonumber
    participant B as 🌐 Browser
    participant API as ⚙️ Express API
    participant DB as 🗄️ MongoDB

    B->>API: POST /api/auth/logout (refresh cookie, if present)
    alt No refresh cookie
        API-->>B: 200 OK, cookie cleared anyway
        Note over B,API: Safe to call when already signed out
    else Cookie present
        API->>API: Verify refresh token and hash it
        API->>DB: Set revoked = true on the matching session
        API-->>B: 200 OK, refresh cookie cleared
    end
```

📨 **Needs:** refresh cookie, if present &nbsp;·&nbsp; ✅ **Success:** `200 OK` (idempotent)

---

### 8️⃣ Logout all · `POST /logout-all`

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'background': '#000000', 'primaryColor': '#111111', 'primaryTextColor': '#ffffff', 'primaryBorderColor': '#ff8c00', 'lineColor': '#ff8c00', 'secondaryColor': '#181818', 'tertiaryColor': '#222222', 'textColor': '#f5f5f5', 'mainBkg': '#111111', 'nodeBorder': '#ff8c00', 'clusterBkg': '#080808', 'clusterBorder': '#666666', 'titleColor': '#ffffff', 'edgeLabelBackground': '#111111', 'actorBkg': '#111111', 'actorBorder': '#ff8c00', 'actorTextColor': '#ffffff', 'actorLineColor': '#ff8c00', 'signalColor': '#f5f5f5', 'signalTextColor': '#ffffff', 'labelBoxBkgColor': '#111111', 'labelBoxBorderColor': '#ff8c00', 'labelTextColor': '#ffffff', 'loopTextColor': '#ffffff', 'noteBkgColor': '#111111', 'noteBorderColor': '#ff8c00', 'noteTextColor': '#ffffff', 'activationBkgColor': '#222222', 'activationBorderColor': '#ff8c00', 'sequenceNumberColor': '#000000', 'stateBkg': '#111111', 'stateBorder': '#ff8c00', 'stateLabelColor': '#ffffff', 'transitionColor': '#ff8c00', 'fontFamily': 'Segoe UI, Helvetica, Arial'}}}%%
sequenceDiagram
    autonumber
    participant B as 🌐 Browser
    participant API as ⚙️ Express API
    participant DB as 🗄️ MongoDB

    B->>API: POST /api/auth/logout-all (refresh cookie)
    API->>API: Verify refresh token and hash it
    API->>DB: Find active session matching the hash
    alt No active session
        API-->>B: 401 Unauthorized
    else Active session found
        API->>DB: Set revoked = true on every active session for this user
        API-->>B: 200 OK, refresh cookie cleared
        Note over API,DB: Every device loses access on its next protected request
    end
```

📨 **Needs:** refresh cookie &nbsp;·&nbsp; ✅ **Success:** `200 OK`

---

## 🔁 Lifecycle States

### 🧾 Session

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'background': '#000000', 'primaryColor': '#111111', 'primaryTextColor': '#ffffff', 'primaryBorderColor': '#ff8c00', 'lineColor': '#ff8c00', 'secondaryColor': '#181818', 'tertiaryColor': '#222222', 'textColor': '#f5f5f5', 'mainBkg': '#111111', 'nodeBorder': '#ff8c00', 'clusterBkg': '#080808', 'clusterBorder': '#666666', 'titleColor': '#ffffff', 'edgeLabelBackground': '#111111', 'stateBkg': '#111111', 'stateBorder': '#ff8c00', 'stateLabelColor': '#ffffff', 'transitionColor': '#ff8c00'}}}%%
stateDiagram-v2
    [*] --> Active: Login succeeds
    Active --> Active: Refresh rotates token
    Active --> Revoked: Logout or logout-all
    Active --> Revoked: Reused refresh token detected
    Active --> Expired: expiresAt passes
    Revoked --> [*]
    Expired --> [*]
```

### 🔢 Email verification code

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'background': '#000000', 'primaryColor': '#111111', 'primaryTextColor': '#ffffff', 'primaryBorderColor': '#ff8c00', 'lineColor': '#ff8c00', 'secondaryColor': '#181818', 'tertiaryColor': '#222222', 'textColor': '#f5f5f5', 'mainBkg': '#111111', 'nodeBorder': '#ff8c00', 'clusterBkg': '#080808', 'clusterBorder': '#666666', 'titleColor': '#ffffff', 'edgeLabelBackground': '#111111', 'stateBkg': '#111111', 'stateBorder': '#ff8c00', 'stateLabelColor': '#ffffff', 'transitionColor': '#ff8c00'}}}%%
stateDiagram-v2
    [*] --> Issued: Register or resend
    Issued --> Issued: Resend replaces code
    Issued --> Consumed: Correct code entered
    Issued --> Locked: Five wrong guesses
    Issued --> Expired: Five minutes pass
    Consumed --> [*]
    Locked --> [*]
    Expired --> [*]
```

---

## 🗄️ Data Model

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'background': '#000000', 'primaryColor': '#111111', 'primaryTextColor': '#ffffff', 'primaryBorderColor': '#ff8c00', 'lineColor': '#ff8c00', 'secondaryColor': '#181818', 'tertiaryColor': '#222222', 'textColor': '#f5f5f5', 'mainBkg': '#111111', 'nodeBorder': '#ff8c00', 'clusterBkg': '#080808', 'clusterBorder': '#666666', 'titleColor': '#ffffff', 'edgeLabelBackground': '#111111', 'entityBkgColor': '#111111', 'entityBorderColor': '#ff8c00', 'entityTextColor': '#ffffff', 'attributeBackgroundColor': '#111111', 'attributeFontColor': '#f5f5f5', 'relationshipLabelBackground': '#111111', 'relationshipLabelColor': '#ffffff'}}}%%
erDiagram
    USERS ||--o{ SESSIONS : "has many"
    USERS ||--o| OTPS : "has one current"

    USERS {
        ObjectId _id PK
        string username "unique, trimmed, 3-32 chars"
        string email "unique, trimmed, lowercase"
        string password "bcrypt hash, hidden by default"
        boolean verified "false until email confirmed"
        Date createdAt
        Date updatedAt
    }

    OTPS {
        ObjectId _id PK
        string email
        ObjectId user FK "unique, one code per account"
        string otpHash "HMAC-SHA256, never the raw code"
        number attempts "0 to 5"
        Date expiresAt "TTL index, 5 minutes"
        Date createdAt
        Date updatedAt
    }

    SESSIONS {
        ObjectId _id PK
        ObjectId user FK
        string refreshTokenHash "SHA-256, never the raw token"
        string ip
        string userAgent
        boolean revoked
        Date expiresAt "TTL index, 7 days"
        Date createdAt
        Date updatedAt
    }
```

> [!NOTE]
> MongoDB's TTL cleanup runs in the background and may be slow to remove old records. The API checks `expiresAt` itself, so an expired record that is still in the database is treated as expired.

---

## 📁 Folder Structure

<details>
<summary><b>📂 Click to expand the full tree</b></summary>

```text
Auth Project/
├── .env                          # local settings (keep private)
├── .gitignore
├── README.md
├── banner.png
├── package.json
├── package-lock.json
├── LICENSE                       # MIT License
├── vitest.config.js             # Vitest settings
├── server.js                     # connects to DB, then starts HTTP server
├── src/
│   ├── app.js                    # Express app and middleware pipeline
│   ├── config/
│   │   ├── config.js             # loads and validates environment
│   │   └── database.js           # Mongoose connection
│   ├── controllers/
│   │   └── auth.controller.js    # reads requests, sets cookies, builds responses
│   ├── middlewares/
│   │   ├── auth.middleware.js    # access token and session check
│   │   ├── authLimiters.js       # per-IP rate limits
│   │   ├── error.middleware.js   # errors to JSON responses
│   │   └── origin.middleware.js  # CORS and origin allow list
│   ├── models/
│   │   ├── otp.model.js          # one-time email codes
│   │   ├── session.model.js      # per-device sessions
│   │   └── user.model.js         # accounts and password hashing
│   ├── routes/
│   │   └── auth.routes.js        # URL + method to controller
│   ├── services/
│   │   ├── auth.service.js       # registration, codes, login steps
│   │   └── email.service.js      # Gmail OAuth2 and Nodemailer
│   └── utils/
│       ├── apiError.js           # expected error with status code
│       ├── asyncHandler.js       # forwards async errors to Express
│       ├── authCookies.js        # one cookie config for set, rotate, clear
│       ├── authValidation.js     # input normalization and validation
│       ├── tokens.js             # access and refresh JWTs
│       └── utils.js              # code generation, hashing, email HTML
└── test/
    ├── authIntegration.test.js   # HTTP + in-memory MongoDB flow tests
    ├── authLimiters.test.js
    ├── authTokens.test.js
    ├── authValidation.test.js
    ├── originMiddleware.test.js
    └── setup.js                  # safe test-only environment values
```

</details>

### 🧭 What each part does

| File or folder | Responsibility |
|---|---|
| `server.js` | Connects to MongoDB first, then starts the HTTP server |
| `src/app.js` | Installs parsing, logging, cookies, origin checks, routes, 404, and errors |
| `src/config/config.js` | Loads `.env`, checks required values, requires a 32+ byte JWT secret, validates the port and `CLIENT_ORIGIN` |
| `src/routes/auth.routes.js` | Maps URL and method to a controller and applies rate limits |
| `src/controllers/auth.controller.js` | Reads requests, calls services and models, sets cookies, builds responses |
| `src/services/auth.service.js` | Registration, code delivery, resend, and login work |
| `src/services/email.service.js` | Gmail OAuth2 setup and verification email sending |
| `src/middlewares/auth.middleware.js` | Verifies access tokens and checks that their sessions are active |
| `src/middlewares/origin.middleware.js` | Allows the configured origin, handles preflight, rejects other browser origins |
| `src/middlewares/error.middleware.js` | Converts app, database, JSON-body, and token errors to JSON |
| `src/models/*.model.js` | Schemas for users, one-time codes, and sessions |
| `src/utils/tokens.js` | Creates and verifies access and refresh JWTs with separate purposes |
| `src/utils/authCookies.js` | Keeps refresh-cookie options identical when setting, rotating, and clearing |
| `test/` | Unit tests for validation, token purposes, rate limits, and origins |
| `test/authIntegration.test.js` | Exercises real HTTP routes with an isolated MongoDB and a mocked email sender |
| `vitest.config.js` | Configures Vitest to run the project tests in Node.js |
| `test/setup.js` | Supplies fake environment settings so tests never use production credentials |

---

## 🧩 Key Code Snippets

### ✅ Validate and normalize before touching the database

```js
// src/services/auth.service.js
const { username, email, password } = validateRegistrationInput(input);

const existingUser = await userModel.findOne({
  $or: [{ username }, { email }],
});
```

> Malformed values are rejected early, and email casing stays consistent.

---

### 🔢 Generate a code and store only a keyed hash

```js
// src/utils/utils.js
export function generateOTP() {
  return crypto.randomInt(100000, 1000000).toString();
}

export function hashOTP(otp) {
  return crypto
    .createHmac("sha256", config.JWT_SECRET)
    .update(otp)
    .digest("hex");
}
```

> `crypto.randomInt` is cryptographically secure. The database holds only the HMAC, so a leaked record does not reveal a usable code.

---

### 🎫 Separate token purposes

```js
// src/utils/tokens.js
{ sessionId: String(sessionId), tokenUse: "access"  } // lifetime: 15 minutes
{ sessionId: String(sessionId), tokenUse: "refresh" } // lifetime: 7 days
```

> Both tokens use HS256 with an issuer and audience. Checking `tokenUse` stops a refresh token from being accepted as an access token, and the reverse.

---

### 🛡️ Check the bearer token and the session

```js
// src/middlewares/auth.middleware.js
const match = authorization?.match(/^Bearer\s+(\S+)$/i);
if (!match) {
  throw new ApiError(401, "A bearer access token is required");
}

const { userId, sessionId } = verifyAccessToken(match[1]);

const session = await sessionModel.findOne({
  _id: sessionId,
  user: userId,
  revoked: false,
  expiresAt: { $gt: new Date() },
});
```

> A valid signature alone is not enough. The session must exist, belong to the user, and be neither revoked nor expired.

---

### 🔄 Rotate refresh tokens atomically

```js
// Conceptual pattern used during POST /refresh-token
const updated = await sessionModel.updateOne(
  {
    _id: sessionId,
    revoked: false,
    refreshTokenHash: oldHash,   // only matches if the old token is still current
  },
  { $set: { refreshTokenHash: newHash } },
);

if (updated.matchedCount === 0) {
  await sessionModel.updateOne({ _id: sessionId }, { $set: { revoked: true } });
  throw new ApiError(401, "Refresh token has already been used");
}
```

> The conditional update is the reuse check. If two requests race with the same old token, only one can match.

---

## 📚 API Reference

Base URL when running locally: **`http://localhost:3000/api/auth`**

| Method | Path | Purpose | Needs | Success |
|---|---|---|---|---|
| `POST` | `/register` | Create account and email a code | JSON body | `201` |
| `POST` | `/verify-email` | Verify email and consume the code | JSON body | `200` |
| `POST` | `/resend-verification` | Send a replacement code | JSON body | `200` |
| `POST` | `/login` | Check password and create a session | JSON body | `200` |
| `GET` | `/get-me` | Return the signed-in user's details | Bearer access token | `200` |
| `POST` | `/refresh-token` | Rotate refresh token, issue new access token | Refresh cookie | `200` |
| `POST` | `/logout` | Revoke current session and clear cookie | Refresh cookie, optional | `200` |
| `POST` | `/logout-all` | Revoke all active sessions | Refresh cookie | `200` |

> [!TIP]
> `/logout` is idempotent. If no refresh cookie is present, it still clears the cookie and returns success.
>
> `/resend-verification` returns the same message whether or not a new code was needed, so it does not reveal which emails are registered.

### 📦 Request bodies

<details>
<summary><b>Register</b></summary>

```json
{
  "username": "sample-user",
  "email": "person@example.com",
  "password": "a-long-example-passphrase"
}
```

</details>

<details>
<summary><b>Verify email</b></summary>

```json
{
  "email": "person@example.com",
  "otp": "123456"
}
```

</details>

<details>
<summary><b>Resend verification</b></summary>

```json
{
  "email": "person@example.com"
}
```

</details>

<details>
<summary><b>Login</b></summary>

```json
{
  "email": "person@example.com",
  "password": "a-long-example-passphrase"
}
```

</details>

### 📬 Response shapes

<details>
<summary><b>201 Created · register</b></summary>

```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "<user-id>",
    "username": "sample-user",
    "email": "person@example.com",
    "verified": false
  }
}
```

</details>

<details>
<summary><b>200 OK · login</b></summary>

The refresh token is **not** in the body. It arrives as an `HttpOnly` cookie.

```json
{
  "success": true,
  "message": "Logged in successfully",
  "user": {
    "username": "sample-user",
    "email": "person@example.com"
  },
  "accessToken": "<short-lived-access-token>"
}
```

</details>

<details>
<summary><b>Error · every route</b></summary>

```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

</details>

### 🚦 Status codes

| Status | Meaning in this API |
|---|---|
| `400` | Invalid email, password, username, or code format |
| `401` | Missing, invalid, or expired authentication; wrong login credentials |
| `403` | Browser origin not allowed |
| `404` | Unknown route or user |
| `409` | Duplicate username or email |
| `413` | JSON body larger than 16 KB |
| `429` | Rate limit exceeded |
| `502` | Email service failed; account stays unverified and can request a new code |
| `500` | Unexpected server or database error (details are logged, not returned) |

---

## 🌍 Calling the API from a Frontend

The browser must send credentials so it can store and send the refresh cookie. For cross-origin frontends, the origin must match `CLIENT_ORIGIN`.

```js
const api = "http://localhost:3000/api/auth";

async function postJson(path, body) {
  const response = await fetch(`${api}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  return data;
}

// 1. Register
await postJson("/register", {
  username: "sample-user",
  email: "person@example.com",
  password: "a-long-example-passphrase",
});

// 2. Verify the code from the email
const codeFromEmail = window.prompt("Enter the code sent to your email");
await postJson("/verify-email", {
  email: "person@example.com",
  otp: codeFromEmail,
});

// 3. Log in
const { accessToken } = await postJson("/login", {
  email: "person@example.com",
  password: "a-long-example-passphrase",
});

// 4. Call a protected route
const profile = await fetch(`${api}/get-me`, {
  credentials: "include",
  headers: { Authorization: `Bearer ${accessToken}` },
});

console.log(await profile.json());
```

> [!TIP]
> Keep the access token in memory where practical. The refresh token is `HttpOnly`, so JavaScript cannot read it. The browser sends it automatically on refresh and logout.

### 🔁 Refresh and sign out

```js
// Get a new access token
const refreshed = await fetch(`${api}/refresh-token`, {
  method: "POST",
  credentials: "include",
});
const { accessToken: newAccessToken } = await refreshed.json();

// Sign out this device
await fetch(`${api}/logout`, {
  method: "POST",
  credentials: "include",
});
```

Use `POST /logout-all` to revoke every active session.

> [!CAUTION]
> The old `GET /logout` and `GET /logoutAll` routes have been removed. State-changing actions must use `POST`.

---

## 🚦 Request Limits

Limits are per IP address and stored in memory.

| Endpoint group | Limit |
|---|---|
| Registration | 5 requests / hour |
| Login | 10 requests / 15 minutes |
| Verify email | 10 requests / 15 minutes, plus 5 guesses per code |
| Resend verification | 3 requests / hour |
| Refresh token | 30 requests / 15 minutes |

> [!NOTE]
> With more than one server instance, add a shared rate-limit store (for example, Redis) so all instances share the same counters.

---

## ⚙️ Setup

### Requirements

- Node.js compatible with the project's Express and Mongoose versions
- A MongoDB connection string
- Gmail OAuth2 credentials for sending email

### Install and run

```powershell
npm install
npm run dev     # development, uses nodemon server.js
npm start       # production
```

### Environment variables

Create `.env` in the project root. Never commit real credentials.

```dotenv
PORT_NO=3000
MONGO_URI=<MongoDB connection string>
JWT_SECRET=<at least 32 random bytes>
GOOGLE_CLIENT_ID=<OAuth client ID>
GOOGLE_CLIENT_SECRET=<OAuth client secret>
GOOGLE_REFRESH_TOKEN=<OAuth refresh token>
GOOGLE_USER=<sender email address>
CLIENT_ORIGIN=http://localhost:5173
```

| Variable | Required | Notes |
|---|:---:|---|
| `PORT_NO` | ❌ | Defaults to `3000` |
| `MONGO_URI` | ✅ | Checked at startup |
| `JWT_SECRET` | ✅ | At least 32 bytes |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `GOOGLE_USER` | ✅ | Gmail OAuth2 for sending email |
| `CLIENT_ORIGIN` | ❌ | Exact scheme, host, and port of a separate frontend, with no path |

Generate a strong secret:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

> [!WARNING]
> In production, use HTTPS and set `NODE_ENV=production` so the refresh cookie is marked `Secure`. The cookie uses `SameSite=Strict`, so keep the frontend and API on the same site. Do not weaken this without a tested CSRF plan.

---

## 🧪 Testing

This project uses **Vitest** as its test runner. Unit tests use fake environment values. Integration tests run the Express API against an isolated in-memory MongoDB and replace Gmail with a fake email sender, so they do not need a real database or send real email.

```powershell
# Run all tests once
npm test

# Keep Vitest running and rerun tests as files change
npm run test:watch
```

| Test file | Covers |
|---|---|
| `authValidation.test.js` | Input normalization and validation |
| `authTokens.test.js` | Token purposes and separation |
| `authLimiters.test.js` | Rate-limit behavior |
| `originMiddleware.test.js` | Allowed and rejected origins |
| `authIntegration.test.js` | Registration, verification, login, protected profile, refresh rotation, logout, and logout-all |

### Latest test results

The complete suite passed: **5 test files and 15 tests** (`npm test`). This includes the HTTP integration tests using the in-memory MongoDB.

> [!NOTE]
> The in-memory MongoDB is for testing only. It starts locally for the test run and does not use or modify your configured database.

---

## 📄 License

This project is released under the **MIT License**. You may use, copy, modify, merge, publish, distribute, sublicense, and sell copies, provided you include the copyright and permission notice. The software is provided without warranty. See the [LICENSE](./LICENSE) file for the complete terms.

---

## 🧱 Known Limits and Roadmap

- ⚠️ **Rate limits are in memory.** Multiple instances need a shared store.
- ⚠️ **One frontend origin is supported.** Set `CLIENT_ORIGIN` correctly if the frontend is separate or a reverse proxy changes the visible scheme or host.
- ⚠️ **Old tokens are rejected** after the token-format update, so users must sign in again.
- ⚠️ **Sessions without `expiresAt`** no longer authorize requests.
- ⚠️ **OTP unique index:** before creating the unique index on `user` in an existing database, remove duplicate OTP documents per user.
- 🗒️ **Logging** is plain console output. Production should use structured, redacted logs with request IDs.
- 🧱 **Hardening still to do:** security headers and a shared rate-limit store.
- 🚧 **Not implemented yet:** password reset, password change, account deletion, and a device or session management page.

---

<p align="center">
  <br/><br/>
  <sub>© Auth Project by <b>Samroz Burhan</b> · Built with Node.js, Express, and MongoDB</sub>
</p>
