# ShopKart Customer Authentication — Final Submission Report

This document outlines the finished, submission-ready **ShopKart Customer Authentication** project adhering strictly to the assignment rubric, MVC backend structure, security best practices, and clean responsive UI design.

---

## 1. What Was Changed & Fixed

1. **Strict MVC Architecture Setup**:
   - Organized the backend into standard MERN MVC folders:
     - `backend/models/customer.model.js` (Mongoose Schema with `fullName`, `email`, `password`, `phone`, `createdAt`)
     - `backend/controllers/customer.controller.js` (`register`, `login`, `getProfile`, `logout`, `changePassword`)
     - `backend/routes/customer.routes.js` (Clean Express Router mapping to `/customers`)
     - `backend/middlewares/auth.middleware.js` (Cookie extraction, JWT verification, MongoDB lookup, attaching `req.user`)
     - `backend/utils/generateToken.js` (Token signing & HttpOnly cookie configuration)
     - `backend/index.js` (Express configuration, MongoDB connection, CORS with credentials, cookie-parser, route mounting)
     - `backend/.env` & `backend/.env.example` (Configurable `PORT`, `MONGO_URI`, `JWT_SECRET`)

2. **Customer Model & Schema Compliance**:
   - Model fields aligned: `fullName` (String, required), `email` (String, required, unique), `password` (String, required), `phone` (String, required), `createdAt` (Date, automatic).
   - Passwords always hashed with `bcryptjs` with salt factor 10.
   - Passwords never returned in any response (excluded via `.select('-password')` and explicit object filtering).

3. **Assignment-Compliant Error & Status Handling**:
   - `400 Bad Request` on missing fields, passwords under 6 characters, or unmatched passwords.
   - `409 Conflict` on duplicate email registration attempts.
   - `401 Unauthorized` with generic message (`"Invalid email or password"`) for invalid credentials to avoid username enumeration.
   - `401 Unauthorized` for missing, expired, or invalid session cookies on protected endpoints.
   - `201 Created` on registration, `200 OK` on login, profile, logout, and change password.

4. **UI/UX Refinement & Removal of Fake Claims**:
   - Replaced all placeholder e-commerce claims with genuine, assignment-accurate features (HttpOnly Cookie Authentication, Protected Customer Profile, Secure Bcrypt Hashing).
   - Implemented an elegant **Navy + White + Orange** brand visual identity.
   - Ensured smooth desktop split-screen layout and mobile-optimized single-column layout.
   - Clean inline validation, loading states, and toast notifications (no `alert()` popups).

5. **Bonus Feature (Change Password)**:
   - Built `PATCH /customers/change-password` endpoint.
   - Requires active authentication, verifies current password via bcrypt, enforces min 6-character new password, and saves the new hash.

---

## 2. Rubric Audit Checklist (100 Marks)

| Item | Requirement | Status |
| :--- | :--- | :--- |
| **Register API (15 marks)** | Mandatory fields, unique email (409), min 6 char password (400), bcrypt hashing, password never returned | ✅ Pass |
| **Login API (15 marks)** | Find by email, bcrypt compare, generic 401 error, cookie generation, password excluded | ✅ Pass |
| **JWT + Cookie Auth (20 marks)** | `jsonwebtoken` signing with `.env` secret, stored in HttpOnly cookie, compatible options | ✅ Pass |
| **Protected Profile Route (20 marks)** | `GET /customers/me` protected by middleware, reads cookie, verifies token, sets `req.user`, returns profile without password | ✅ Pass |
| **MVC Code Structure (10 marks)** | Clear separation of `controllers`, `models`, `routes`, `middlewares`, `utils`, `index.js`, `.env` | ✅ Pass |
| **Error Handling (10 marks)** | Meaningful HTTP status codes (201, 200, 400, 401, 409, 500), graceful server handling | ✅ Pass |
| **Viva Readiness (10 marks)** | Simple, beginner-friendly JavaScript, no over-engineering, easy to explain from top to bottom | ✅ Pass |
| **Bonus (Change Password)** | `PATCH /customers/change-password` with old password verification & new password hashing | ✅ Pass |

---

## 3. How to Run the Project

### Prerequisites
- Node.js installed
- MongoDB running locally (default: `mongodb://127.0.0.1:27017/shopkart`) or MongoDB Atlas URI in `.env`

### Start Backend
```powershell
cd "c:\Users\Navitha Chekuri\OneDrive\Desktop\lab1\backend"
node index.js
```
*Backend runs on `http://localhost:5000`.*

### Start Frontend
```powershell
cd "c:\Users\Navitha Chekuri\OneDrive\Desktop\lab1\frontend"
npm run dev
```
*Frontend runs on `http://localhost:5174` (or `http://localhost:5173`).*

---

## 4. Required `.env` Variables

Create `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/shopkart
JWT_SECRET=shopkart_super_secret_jwt_key_2026
```

---

## 5. Postman Test Suite Guide

Make sure Postman has **"Automatically manage cookies"** enabled (default in Postman).

1. **Register**:
   - `POST http://localhost:5000/customers/register`
   - Body (raw JSON):
     ```json
     {
       "fullName": "John Doe",
       "email": "john@gmail.com",
       "password": "john123",
       "phone": "9876543210"
     }
     ```
   - Expect: `201 Created` and `Set-Cookie: token=...; HttpOnly`

2. **Register with Missing Field**:
   - Body without `phone` -> Expect `400 Bad Request`

3. **Register with Short Password**:
   - Password `"12345"` -> Expect `400 Bad Request`

4. **Register Duplicate Email**:
   - Re-send John Doe's email -> Expect `409 Conflict`

5. **Login**:
   - `POST http://localhost:5000/customers/login`
   - Body:
     ```json
     {
       "email": "john@gmail.com",
       "password": "john123"
     }
     ```
   - Expect: `200 OK` and `Set-Cookie: token=...; HttpOnly`

6. **Login with Invalid Credentials**:
   - Password `"wrongpass"` -> Expect `401 Unauthorized` (`"Invalid email or password"`)

7. **Get Customer Profile**:
   - `GET http://localhost:5000/customers/me`
   - Expect: `200 OK` returning `{ "_id": "...", "fullName": "...", "email": "...", "phone": "..." }`

8. **Change Password (Bonus)**:
   - `PATCH http://localhost:5000/customers/change-password`
   - Body:
     ```json
     {
       "currentPassword": "john123",
       "newPassword": "newpassword123"
     }
     ```
   - Expect: `200 OK`

9. **Logout**:
   - `POST http://localhost:5000/customers/logout`
   - Expect: `200 OK` and cookie cleared

10. **Profile After Logout**:
    - `GET http://localhost:5000/customers/me`
    - Expect: `401 Unauthorized`
