# RideBook — Uber-style ride booking (MVP)

Monorepo with three apps, built from the SRS / HLD / LLD documents.

| Folder | Stack | What it is |
|---|---|---|
| `backend/` | FastAPI · SQLAlchemy (async) · Alembic · PostgreSQL | REST API, OTP auth, RBAC, domain modules |
| `mobile/` | React Native · Expo SDK 58 · Expo Router · TypeScript | One app for Customers and Drivers (role-based navigation) |
| `admin/` | React · Vite · TypeScript · Recharts | Admin dashboard: users, driver approvals, charts |

## Status

**Phase 1 — Foundation ✅** phone OTP login (mock provider in dev), JWT access + rotating refresh sessions,
logout/revocation, RBAC (roles + permissions), onboarding (Customer / Driver), driver registration,
admin approval, online/offline toggle, admin users/drivers tables and dashboard charts.

Next: Phase 2 booking (maps, fare quote, idempotent ride request) → Phase 3 dispatch + WebSockets →
Phase 4 FCM + Razorpay test → Phase 5 MQTT + ride analytics → Phase 6 hardening.

## Prerequisites

- Python 3.12, Node.js LTS, PostgreSQL (local, port 5432)
- Android Studio + an emulator (the build uses Android Studio's bundled JDK)

## 1. Backend

```bash
cd backend
py -3.12 -m venv .venv
.venv/Scripts/pip install -r requirements.txt
cp .env.example .env            # set DATABASE_URL password and JWT_SECRET
psql -U postgres -c "CREATE DATABASE ride_booking;"
.venv/Scripts/alembic upgrade head
.venv/Scripts/python -m scripts.seed
.venv/Scripts/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

API docs: http://localhost:8000/docs

Tests (use a separate `ride_booking_test` database, recreated on each run):

```bash
psql -U postgres -c "CREATE DATABASE ride_booking_test;"
.venv/Scripts/pytest -q
```

### Seeded test accounts (mock OTP)

In `ENV=development` the OTP is printed in the API console **and** returned as `dev_code`, which the apps show
in a "Dev mode" banner. Nothing is sent by SMS.

| Phone | Role |
|---|---|
| +91 90000 00001 | Super Admin + Admin (use in the admin dashboard) |
| +91 90000 00002 | Customer |
| +91 90000 00003 | Driver (approved, with vehicle) |

Any other valid Indian mobile number signs up as a new user and goes through onboarding.

## 2. Mobile (Android emulator)

```bash
cd mobile
npm install
cp .env.example .env            # EXPO_PUBLIC_API_URL=http://10.0.2.2:8000 for the emulator
npx expo run:android            # builds the native dev build and starts Metro
```

For a physical phone, set `EXPO_PUBLIC_API_URL` to your PC's LAN IP (e.g. `http://192.168.1.10:8000`).

**Windows build notes** (the native C++ build of `react-native-worklets` creates paths over 260 chars):

1. Enable long paths once (admin PowerShell, then restart):
   `New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name LongPathsEnabled -Value 1 -PropertyType DWORD -Force`
2. Install CMake 4.x from Android Studio → SDK Manager → SDK Tools (its ninja supports long paths), and point the
   build at it in `mobile/android/local.properties` (generated folder, not committed — re-add after `prebuild --clean`):
   ```
   sdk.dir=C:/Users/<you>/AppData/Local/Android/Sdk
   cmake.dir=C:/Users/<you>/AppData/Local/Android/Sdk/cmake/4.1.2
   ```
3. If Gradle downloads time out, force IPv4 for the JVM: `JAVA_TOOL_OPTIONS=-Djava.net.preferIPv4Stack=true`.
4. Use Android Studio's JDK: `JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"`.

After the first build, day-to-day you only need `npx expo start` (Metro) — the installed app reloads on save.

## 3. Admin dashboard

```bash
cd admin
npm install
npm run dev                     # http://localhost:5173
```

## Front-end structure (mobile and admin follow the same layering)

```
src/
├── constants/      apiEndpoints.ts (every URL), config.ts, roles, ride status, storage keys
├── interceptors/   requestId · auth (Bearer) · refresh (401 → refresh once → replay) · error (→ AppError)
├── services/       httpClient (single axios instance) · api.service (get/post/put/patch/delete)
│                   · auth / user / driver / admin services · token + secure storage
├── components/
│   └── common/     DataTable, BarChart / DonutChart, StatCard, ListCard, Button, TextField, OtpInput, Badge…
├── screens|pages/  feature screens (auth, customer, driver, shared) / admin pages
├── app|routes/     routing only (Expo Router route files / React Router)
├── store/          zustand auth store (session + role → route guards)
├── hooks/  types/  utils/  theme/
```

Request flow: **screen → domain service → api.service → httpClient (interceptors) → backend**.
Services never hardcode URLs; they use `API_ENDPOINTS`.

## Backend structure

```
app/
├── main.py                 composition, CORS, error envelope
├── core/                   config, db, security (OTP/JWT), deps (current actor, RBAC guards), errors, permissions
├── api/v1/                 auth, users (/me), drivers, admin routers
└── domains/
    ├── identity/           users, roles, permissions, OTP challenges, refresh sessions, audit log
    ├── fleet/              drivers, vehicles, approval & availability
    └── operations/         admin queries, moderation, dashboard stats
alembic/                    migrations
scripts/seed.py             roles, permissions, test users
tests/                      auth + RBAC integration tests
```

Errors always use `{"error": {"code", "message", "request_id"}}`. Authorization is enforced on the server;
UI route guards are convenience only.
