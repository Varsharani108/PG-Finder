# Nestlocal — About Page (PG & Local Area Finder)

Full-stack "About Us" page: Vite + React frontend, Node.js/Express + MongoDB backend.

## Structure

```
pg-finder-about/
├── backend/     Express API (stats, FAQs, team, contact form) + MongoDB models
└── frontend/    Vite + React About page
```

## Backend setup

```bash
cd backend
npm install
cp .env.example .env      # edit MONGO_URI if not running Mongo locally
npm run seed               # populates stats, FAQs, and team placeholders
npm run dev                # starts on http://localhost:5000
```

Endpoints:
- `GET  /api/stats` / `PUT /api/stats`
- `GET  /api/faqs` / `POST /api/faqs`
- `GET  /api/team` / `POST /api/team`
- `GET  /api/contact` / `POST /api/contact`

## Frontend setup

```bash
cd frontend
npm install
cp .env.example .env      # VITE_API_BASE_URL — defaults to /api, proxied to :5000
npm run dev                 # starts on http://localhost:5173
```

The Vite dev server proxies `/api/*` to `http://localhost:5000`, so run the backend
first (or update `vite.config.js` / `.env` if your API lives elsewhere).

## What's on the page

Who We Are → Our Mission → What We Offer → How It Works → Why Choose Us →
Our Vision & Values → Meet the Team → Statistics (live from MongoDB) →
Contact Us (form posts to the API) → FAQ (accordion, click the `+` icon to expand) → CTA.

Statistics, team members, and FAQs are stored in MongoDB and fetched at runtime —
edit them via the seed script or the POST/PUT endpoints above. The contact form
writes every submission to the `contacts` collection.

## Authentication module

A full auth flow was added on top of the existing About page. **Nothing about the
landing page/About section was changed** — it still renders at `/` exactly as before.

### What was added

**Backend** (`backend/src/`):
- `models/User.js` — name, email, phone, password (bcrypt-hashed), role
  (`user` | `owner` | `admin`), `isVerified`, timestamps.
- `controllers/authController.js`, `routes/authRoutes.js`,
  `middleware/authMiddleware.js`, `utils/generateToken.js`, `utils/sendEmail.js`.
- New endpoints, mounted at `/api/auth`:
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
  - `POST /api/auth/forgot-password`
  - `POST /api/auth/reset-password`
  - `GET  /api/auth/profile` (requires `Authorization: Bearer <token>`)

**Frontend** (`frontend/src/`):
- Pages: `pages/auth/Login.jsx`, `Signup.jsx`, `ForgotPassword.jsx`, `ResetPassword.jsx`.
- `context/AuthContext.jsx` — session state, wraps the app in `main.jsx`.
- `components/auth/PrivateRoute.jsx` — protects `/user/dashboard`, `/owner/dashboard`,
  `/admin/dashboard` by role.
- `components/Footer.jsx` — new, reusable footer for the auth/dashboard pages (the
  About page keeps its own existing inline footer, untouched).
- Routing added via `react-router-dom` in `App.jsx`; `main.jsx` now wraps the app in
  `BrowserRouter` + `AuthProvider` + a `react-hot-toast` `<Toaster />`.
- Navbar's "Get Started" button now navigates to `/login` (only the click handler
  changed — no markup/styling was touched).

### New setup steps

```bash
# backend
cd backend
npm install                # installs bcryptjs, jsonwebtoken, nodemailer
cp .env.example .env       # set JWT_SECRET; SMTP_* optional (see below)

# frontend
cd frontend
npm install                # installs react-router-dom, axios, react-hook-form,
                            # framer-motion, react-hot-toast, tailwindcss
```

Password reset emails: if `SMTP_HOST/USER/PASS` are left blank in `backend/.env`,
the reset link is logged to the backend console instead of emailed, so the flow
still works end to end in local dev without an email provider configured.

### Notable decisions / deviations from the brief

- **Stack actually found in the uploaded project** was React 18.3.1 with plain CSS
  (no Tailwind, no React Router, no Axios, no React Hook Form, no Framer Motion, no
  React 19). Rather than upgrading React or rewriting the working landing page's
  CSS, I added Tailwind/Router/Axios/RHF/Framer Motion/react-hot-toast as new
  dependencies for the auth module only, and kept the About page on its original
  React 18 + hand-written CSS setup so nothing already working could break.
- **Tailwind preflight is disabled** (`corePlugins.preflight = false` in
  `tailwind.config.js`) so Tailwind's base reset can't alter the existing
  hand-styled landing page.
- **Folder structure**: the brief asked for a top-level `server/` folder; the
  project already had a working `backend/` with `config/models/routes` under
  `backend/src`. I added `controllers/`, `middleware/`, and `utils/` alongside
  those rather than renaming/duplicating the backend, to avoid breaking the
  existing stats/FAQ/team/contact routes.
- **No OTP endpoint/page**: the API list in the brief only specifies
  forgot-password/reset-password (no verify-otp route), so reset works via a
  emailed, expiring token link instead of a separate OTP step. Say the word if
  you actually want an OTP-based flow instead/in addition.
- **Dashboards**: `/user/dashboard`, `/owner/dashboard`, `/admin/dashboard` are
  minimal placeholder pages (role-protected) so the redirect-by-role requirement
  is fully wired end to end — swap in real dashboard content whenever it's ready.

## Customizing

- Replace placeholder team members/bio via `backend/src/seed.js`, then re-run `npm run seed`.
- Update contact email/phone/socials in `frontend/src/components/about/ContactUs.jsx`.
- Colors, fonts, and spacing are all defined as CSS variables in
  `frontend/src/styles/tokens.css`.
