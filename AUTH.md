# TrustFlow Authentication & Security Hardening (Phase 4)

This document details the production-grade authentication architecture, database schema, HttpOnly cookie strategy, role-based access control (RBAC), security headers, rate limiting, and environment configurations for the TrustFlow platform.

---

## 1. Architecture Overview

- **Authentication Strategy**: JSON Web Token (JWT) persisted in a secure, JavaScript-inaccessible **HttpOnly Cookie** (`trustflow_token`).
- **Legacy Header Fallback**: For backward compatibility and CLI testing, `Authorization: Bearer <token>` and `x-access-token` headers remain supported on the backend.
- **Password Security**: Passwords are hashed using `bcryptjs` (salt factor 10). Passwords must be at least 8 characters long.
- **Roles**:
  - `MSME`: Job-work units creating orders, delivering goods, requesting verification, scoring receivables, and submitting to TReDS.
  - `FINANCIER`: Institutional lenders evaluating TReDS factoring opportunities, bidding, disbursing 90% advances, and settling term payments.

---

## 2. Database Schema

The authentication system uses SQLite (`trustflow.db`) with a dedicated `users` table:

```sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('MSME', 'FINANCIER')),
  unit_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

---

## 3. Demo Accounts (Development & Testing)

| Role | Name | Email | Password | Linked Unit ID |
|---|---|---|---|---|
| **MSME** | Kumar Knitwear Works (Demo MSME) | `msme@trustflow.demo` | `TrustFlow@123` | `U001` |
| **FINANCIER** | Alchemy Finance Partners (Demo Financier) | `financier@trustflow.demo` | `TrustFlow@123` | `null` |

---

## 4. HttpOnly Cookie & Security Configuration

### Cookie Specification:
- **Name**: `trustflow_token`
- **HttpOnly**: `true` (Prevents client-side XSS access via `document.cookie` or `window.localStorage`)
- **Secure**: `false` in development (over HTTP), `true` in production (requires HTTPS)
- **SameSite**: `'lax'` (Provides baseline CSRF protection for cross-site requests)
- **Path**: `'/'`
- **Max-Age**: 7 days (604,800 seconds), matching JWT lifetime.

### CORS & Credentials:
- **Allowed Origins**: `['http://localhost:3000', 'http://localhost:3001']` (or `CLIENT_URL` / `FINANCIER_URL` in `.env`)
- **Credentials**: `credentials: true` (Enabled to allow browsers to exchange cookies across origins)

### Security Headers & Rate Limiting:
- **Security Headers**: Powered by `helmet` (`nosniff`, `X-Frame-Options: SAMEORIGIN`, `X-XSS-Protection`, etc.).
- **Login Rate Limiter**: 5 failed login attempts per 15 minutes per IP (`express-rate-limit`).

---

## 5. Environment Variables (`backend/.env.example`)

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=trustflow_jwt_secret_key_2026_secure_demo
JWT_EXPIRES_IN=7d
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
CLIENT_URL=http://localhost:3000
FINANCIER_URL=http://localhost:3001
```

---

## 6. API Endpoints Specification (`/api/auth`)

### 6.1 Register New User Account
- **Endpoint**: `POST /api/auth/register`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "name": "Vellore Textiles Ltd",
    "email": "contact@velloretextiles.demo",
    "password": "Password123",
    "role": "MSME",
    "unitId": "U001"
  }
  ```
- **Validations**:
  - `name`, `email`, `password`, `role` required.
  - `password` length must be ≥ 8 characters.
  - Rejects duplicate emails with `409 Conflict`.
- **Response** (`201 Created`):
  - Sets HttpOnly `trustflow_token` cookie.
  - Returns sanitized user object (no JWT in JSON body).

---

### 6.2 User Login
- **Endpoint**: `POST /api/auth/login`
- **Access**: Public (Rate-limited)
- **Request Body**:
  ```json
  {
    "email": "msme@trustflow.demo",
    "password": "TrustFlow@123"
  }
  ```
- **Response** (`200 OK`):
  - Sets HttpOnly `trustflow_token` cookie.
  - Returns sanitized user object.
- **Error Response** (`401 Unauthorized` / `429 Too Many Requests`):
  - Generic message: `"Invalid email or password"`.

---

### 6.3 User Logout
- **Endpoint**: `POST /api/auth/logout`
- **Access**: Public / Authenticated
- **Response** (`200 OK`):
  - Clears `trustflow_token` cookie (`Max-Age=0`).
  - Returns `{ "success": true, "message": "Logout successful" }`.

---

### 6.4 Get Current User Profile
- **Endpoint**: `GET /api/auth/me`
- **Access**: Protected (Reads `trustflow_token` HttpOnly cookie)
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "user": {
      "id": "USR001",
      "name": "Kumar Knitwear Works (Demo MSME)",
      "email": "msme@trustflow.demo",
      "role": "MSME",
      "unitId": "U001"
    }
  }
  ```
- **Error Response** (`401 Unauthorized`):
  - Returns `401` if cookie is missing or invalid.

---

## 7. CSRF Consideration & Production Hardening

1. **SameSite Cookie**: `SameSite=Lax` ensures cookies are not attached to cross-site forged POST/PUT requests initiated by third-party sites.
2. **Production Deployment Recommendations**:
   - Set `NODE_ENV=production` and `COOKIE_SECURE=true`.
   - Use TLS/HTTPS for all origins.
   - For additional CSRF protection, implement a double-submit cookie token or custom CSRF header (`X-Requested-With`) if cross-site top-level navigation forms are added.

---

## 8. Testing Procedure

To run the updated 26-point authentication & security test suite:

```bash
node test-auth.js
```
