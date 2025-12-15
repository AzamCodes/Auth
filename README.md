# Professional MERN Stack Authentication System

A robust, **production-grade** authentication system built with MongoDB, Express.js, React, and Node.js. Designed for scalability, security, and ease of integration.

This system solves common production pitfalls like **OAuth 502 Bad Gateway errors**, **CORS cross-origin cookie issues**, and **SPA routing**, making it a battle-tested solution for your next project.

## 🚀 Key Features

### 🛡️ Backend (Node.js/Express)
- **Advanced OAuth 2.0 Flow**: Implements a "Step-Stone" redirect pattern to prevent Header Overflow (502 errors) and handle secure token handoff.
- **Production-Ready Security**:
  - **Helmet.js** with custom CSP for secure scripts.
  - **Rate Limiting** optimized for proxy environments (Render/Railway).
  - **CORS** configured for multiple origins (localhost + production).
  - **Cookie Security**: HTTP-only, Secure, SameSite=None support for cross-domain auth.
- **Authentication Strategies**:
  - JWT Access (15m) & Refresh Tokens (7d).
  - Google & GitHub OAuth 2.0 ("One Click" Login).
  - Email/Password with bcrypt hashing.
  - Two-Factor Authentication (2FA) via Authenticator Apps.
- **Robust Architecture**:
  - Modular Service-Controller pattern.
  - Centralized Error Handling & Logging (Winston).
  - Graceful Shutdowns & Database Disconnects.

### 💻 Frontend (React/Redux)
- **Framework**: Vite + React 18 for blazing fast performance.
- **State Management**: Redux Toolkit for centralized auth state.
- **Routing**: React Router v6 with `vercel.json` SPA configuration (no 404s).
- **UI/UX**:
  - Modern, responsive design (Tailwind/MUI).
  - "Step-Stone" Loading Page for smooth OAuth transitions.
  - Toast Notifications & Error Boundaries.
  - Dark/Light Mode.

## 📦 Project Structure

```
mern-auth-system/
├── backend/              # Express API
│   ├── src/
│   │   ├── config/       # Passport, DB, Logger
│   │   ├── controllers/  # Auth, User Logic
│   │   ├── middleware/   # Auth, RateLimit, CORS
│   │   ├── models/       # Mongoose Schemas
│   │   ├── routes/       # API Endpoints
│   │   └── server.js     # App Entry Point
├── frontend/             # React App
│   ├── src/
│   │   ├── pages/        # OAuthCallback, Dashboard
│   │   ├── redux/        # Auth Slices
│   │   └── services/     # API Calls
│   └── vercel.json       # SPA Routing Config
```

## 🛠️ Quick Start

### 1. Clone & Install
```bash
git clone <repository-url>
cd mern-auth-system

# Install Backend
cd backend && npm install

# Install Frontend
cd ../frontend && npm install
```

### 2. Environment Setup (.env)
Create a `.env` file in `backend/` based on `.env.example`:

```env
# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173,https://your-production-app.vercel.app

# Database
MONGODB_URI=mongodb+srv://...

# JWT Secrets (Generate strong random strings)
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...

# OAuth (Google Cloud Console / GitHub Settings)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback
```

### 3. Run Locally
```bash
# Terminal 1 (Backend)
cd backend && npm run dev

# Terminal 2 (Frontend)
cd frontend && npm run dev
```

## 🚀 Deployment Guide (Production)

### Backend (Render / Railway)
1.  **Build Command**: `npm install`
2.  **Start Command**: `npm start`
3.  **Environment Variables**:
    - Set `NODE_ENV` to `production`.
    - Set `CLIENT_URL` to your Vercel frontend URL (remove trailing slash).
    - ensure `GOOGLE_CALLBACK_URL` matches your production domain (e.g., `https://api.myapp.com/api/auth/google/callback`).
    - **Note:** The server is configured with `app.set('trust proxy', 1)` to handle HTTPS correctly behind proxies.

### Frontend (Vercel)
1.  **Build Command**: `vite build`
2.  **Output Directory**: `dist`
3.  **Environment Variables**:
    - `VITE_API_URL`: Your production backend URL (e.g., `https://api.myapp.com/api`).
4.  **Important**: Ensure `vercel.json` exists in the root to handle client-side routing.

## 🔄 How to Reuse This System

This project is built to be a **Template**. To reuse it for your own SaaS or App:

### Option 1: The "Clone & Own" (Recommended)
1.  **Copy the `backend` folder**: This becomes your API server. It already has User models, standardized Error handling, and Security best practices.
2.  **Rename**: Change `name` in `package.json`.
3.  **Extend**: Add your business logic (e.g., `ProductController`, `OrderRoutes`) alongside the existing `auth` modules. The Auth system is self-contained.

### Option 2: The "Microservice" Approach
Run this backend *as is* on a separate subdomain (e.g., `auth.myapp.com`).
- Your main app communicates with it strictly via API calls.
- Use the JWT Access Token validation middleware in your other services to verify users.

## 🧪 Integration API

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Create new user |
| `POST` | `/api/auth/login` | Login & Get JWT |
| `GET` | `/api/auth/google` | Start Google OAuth |
| `GET` | `/api/users/profile` | Get logged-in user info (Requires Bearer Token) |

## 🤝 Contributing
Contributions are welcome! Please fork, fix, and submit a PR.

## 📝 License
MIT License - Free for personal and commercial use.

