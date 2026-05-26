# MediSync — Medical Clinic Management System

A full-stack web application for managing a medical clinic, built with Angular 21 (standalone components, Signals) and Node.js/Express/Prisma/PostgreSQL.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Angular 21, Angular Signals, SCSS, Angular Animations |
| Backend | Node.js, Express.js, TypeScript |
<<<<<<< HEAD
| Database | PostgreSQL 16 via Prisma ORM |
=======
| Database | PostgreSQL 18 via Prisma ORM |
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
| Auth | JWT (15 min access token + 7 day refresh cookie), bcrypt, TOTP 2FA |
| Realtime | Socket.io |
| Email | Nodemailer |
| PDF | PDFKit |
| Storage | Multer (local disk) |
| Docs | Swagger / OpenAPI 3.0 at `/api-docs` |

---

## Prerequisites

- **Node.js 20+** — [nodejs.org](https://nodejs.org)
<<<<<<< HEAD
- **PostgreSQL 16** — must be running locally
=======
- **PostgreSQL 18** — must be running locally
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
- **Angular CLI** — `npm install -g @angular/cli`

---

<<<<<<< HEAD
## Quick Start (Windows)
=======
## Quick Start
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567

### 1. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../medisync-frontend
npm install
```

### 2. Configure the backend environment

<<<<<<< HEAD
A `.env` file already exists at `backend/.env`. Verify or update the following values:

```env
DATABASE_URL="postgresql://postgres:12345678@localhost:5432/medisync"
JWT_SECRET=supersecretjwtkey123456789
JWT_REFRESH_SECRET=superrefreshjwtkey123456789
PORT=3000
NODE_ENV=development
```

> If your PostgreSQL password is different, update `DATABASE_URL` accordingly.

### 3. Initialize the database
=======
Copy the example file and fill in your values:

```bash
# Windows
copy backend\.env.example backend\.env

# macOS / Linux
cp backend/.env.example backend/.env
```

Then open `backend/.env` and set your PostgreSQL credentials:

```env
DATABASE_URL="postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/medisync"
```

Replace `YOUR_POSTGRES_PASSWORD` with the password you chose when installing PostgreSQL.

> **Common passwords**: if you used the default PostgreSQL installer, the superuser is `postgres` and the password is whatever you typed during setup.
> If you are unsure, open pgAdmin → right-click your server → Properties → Connection to see the username.

The rest of the `.env` values (JWT secrets, CORS, etc.) work as-is for local development.

### 3. Create the database

Open a PostgreSQL client (psql or pgAdmin) and run:

```sql
CREATE DATABASE medisync;
```

Or via the command line:

```bash
# Windows (run as the postgres user)
psql -U postgres -c "CREATE DATABASE medisync;"

# macOS / Linux
createdb -U postgres medisync
```

### 4. Initialize the database
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567

Run this once to apply all migrations and load demo data:

```bash
cd backend
<<<<<<< HEAD
npx prisma migrate reset --force
=======
npx prisma migrate reset --force --skip-generate
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
npx ts-node prisma/seed.ts
```

This creates all tables and seeds: 1 admin, 1 secretary, 3 doctors, 10 patients, appointments, medical records, prescriptions, invoices, and audit logs.

<<<<<<< HEAD
### 4. Start the backend
=======
### 5. Start the backend
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567

```bash
cd backend
npm run dev
# API running at http://localhost:3000/api/v1
# Swagger docs at http://localhost:3000/api-docs
```

<<<<<<< HEAD
### 5. Start the frontend
=======
### 6. Start the frontend
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567

```bash
cd medisync-frontend
ng serve
# App running at http://localhost:4200
```

Open **http://localhost:4200** in your browser.

---

## Demo Credentials

All accounts use the passwords below. Log in at **http://localhost:4200**.

| Role | Email | Password | Dashboard |
|------|-------|----------|-----------|
| **Admin** | admin@medisync.ma | Admin123! | /admin/dashboard |
| **Secretary** | secretary@medisync.ma | Secretary123! | /secretary/dashboard |
| **Doctor** | dr.chen@medisync.ma | Doctor123! | /doctor/dashboard |
| **Doctor** | dr.moreau@medisync.ma | Doctor123! | /doctor/dashboard |
| **Doctor** | dr.garcia@medisync.ma | Doctor123! | /doctor/dashboard |
| **Patient** | alice.bernard@email.fr | Patient123! | /patient/dashboard |
| **Patient** | bob.martin@email.fr | Patient123! | /patient/dashboard |

<<<<<<< HEAD
> **2FA note**: Two-factor authentication is **mandatory for the Admin**. On first login, the admin is redirected to a setup page to scan a QR code with Google Authenticator and enter a 6-digit code. All subsequent admin sessions require the same app — no re-scan needed. Other roles (doctor, secretary, patient) do not require 2FA.
=======
> **2FA note**: Two-factor authentication is **mandatory for the Admin**. On first login, the admin is redirected to a setup page to scan a QR code with Google Authenticator and enter a 6-digit code. All subsequent admin sessions require the same app. If you lose access to the authenticator app, use the **"Rescanner le QR code"** button on the login page. Other roles do not require 2FA.
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567

---

## Features by Role

### Admin
- Dashboard with live KPI counters (patients, appointments, revenue, doctors)
- Staff management: add / edit / remove doctors and secretaries
- Finance reports with XLSX export
- Full audit log (all sensitive actions with user, IP, timestamp)
- Application settings (clinic info, 2FA setup)

### Doctor
- Personal planning calendar with appointment slots
- Patient consultation view with medical records
- Prescription creation and PDF download
- Lab results and document uploads

### Secretary
- Appointment booking and management for all patients
- Patient registration and profile management
- Invoice generation and PDF download
- Billing dashboard
<<<<<<< HEAD
=======
- Real-time notifications when patients book appointments
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567

### Patient
- Appointment booking with doctor selection and time slot picker
- Personal medical dossier (diagnoses, medications)
- Prescription history with PDF download
- Real-time notifications for appointment status changes

---

## Project Structure

```
medisync/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema (14+ models)
│   │   ├── seed.ts                # Demo data seeder
│   │   └── migrations/            # All Prisma migrations
│   ├── src/
│   │   ├── app.ts                 # Express + Socket.io setup
│   │   ├── controllers/           # Route handlers (auth, admin, doctor, patient, …)
│   │   ├── middlewares/           # Auth, error, audit, upload, rate-limit
│   │   ├── routes/                # Express router definitions
│   │   └── utils/                 # JWT, email, PDF, socket helpers
<<<<<<< HEAD
│   └── .env
=======
│   ├── .env                       # Local env vars (not committed — copy from .env.example)
│   └── .env.example               # Template for environment variables
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
│
├── medisync-frontend/
│   └── src/app/
│       ├── core/
│       │   ├── guards/            # authGuard, roleGuard
│       │   ├── interceptors/      # JWT attach + single-flight refresh
│       │   └── services/          # AuthService, ApiService, NotificationService
│       ├── features/
│       │   ├── auth/              # Login, Register, 2FA, Forgot Password
│       │   ├── patient/           # Dashboard, Appointments, Dossier, Prescriptions
│       │   ├── doctor/            # Dashboard, Planning, Patients, Consultation
│       │   ├── secretary/         # Dashboard, Appointments, Patients, Billing
│       │   └── admin/             # Dashboard, Staff, Finance, Audit, Settings
│       └── shared/components/     # Sidebar, Topbar, Toast notifications
│
└── docker-compose.yml
```

---

## API Overview

All endpoints are prefixed with `/api/v1/`. Full interactive documentation at **http://localhost:3000/api-docs**.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new patient |
| POST | `/auth/login` | Login, returns JWT access token |
| POST | `/auth/2fa/verify` | Verify TOTP code (if 2FA enabled) |
<<<<<<< HEAD
=======
| POST | `/auth/2fa/rescan` | Re-generate QR code for existing 2FA secret |
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
| GET  | `/auth/me` | Current user profile |
| GET  | `/doctors` | List all doctors |
| GET  | `/appointments` | List appointments (role-filtered) |
| POST | `/appointments` | Book an appointment |
| GET  | `/invoices` | List invoices (role-filtered) |
| GET  | `/invoices/:id/pdf` | Download invoice PDF |
| GET  | `/prescriptions/:id/pdf` | Download prescription PDF |
| GET  | `/admin/stats` | Admin dashboard KPIs |
| GET  | `/admin/staff` | List all staff members |
| POST | `/admin/staff` | Create doctor or secretary |
| PUT  | `/admin/staff/:id` | Update staff member |
| DELETE | `/admin/staff/:id` | Remove staff member |
| GET  | `/admin/audit` | Audit log |
| GET  | `/admin/finance` | Finance report |

---

## Resetting to a Clean State

If you need to start fresh (re-seed demo data, clear all sessions):

```bash
cd backend
<<<<<<< HEAD
npx prisma migrate reset --force
=======
npx prisma migrate reset --force --skip-generate
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
npx ts-node prisma/seed.ts
```

Then clear your browser's localStorage and cookies for `localhost:4200` and log in again.

---

<<<<<<< HEAD
=======
## Troubleshooting

**`prisma migrate reset` fails with a permission error on Windows**
Add the `--skip-generate` flag: `npx prisma migrate reset --force --skip-generate`

**Backend won't start — `Cannot find module`**
Make sure you run `npm run dev` from the `backend/` directory. The entry point is `src/app.ts` (not `server.ts`).

**`DATABASE_URL` connection refused**
- Ensure PostgreSQL 18 service is running.
- Double-check the password in `backend/.env` matches your PostgreSQL installation.
- Confirm the `medisync` database exists (Step 3 above).

**Angular build errors after pulling changes**
```bash
cd medisync-frontend
npm install   # pick up any new packages
ng serve
```

---

>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
## License

MIT — created for educational purposes.
