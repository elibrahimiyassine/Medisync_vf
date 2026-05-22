# MediSync — Medical Clinic Management System

A full-stack web application for managing a medical clinic, built with Angular 17+ (standalone, signals) and Node.js/Express.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Angular 21, Angular Signals, SCSS, Angular Animations |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL 16 via Prisma ORM |
| Auth | JWT (access + refresh tokens), bcrypt, TOTP 2FA |
| Realtime | Socket.io |
| Email | Nodemailer |
| PDF | PDFKit |
| Storage | Multer (local disk) |

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 16 (or Docker)
- Angular CLI: `npm install -g @angular/cli`

---

## Quick Start

### 1. Clone & install

```bash
git clone <repo-url>
cd medisync

# Install backend deps
cd backend
npm install

# Install frontend deps
cd ../medisync-frontend
npm install
```

### 2. Start PostgreSQL with Docker

```bash
# From project root
docker-compose up postgres -d
```

Or connect an existing PostgreSQL instance and update `DATABASE_URL` in `backend/.env`.

### 3. Configure environment

```bash
cd backend
cp .env.example .env
# Edit .env — at minimum set DATABASE_URL and JWT secrets
```

### 4. Run database migrations & seed

```bash
cd backend
npx prisma migrate dev --name init
npx ts-node prisma/seed.ts
```

### 5. Start the backend

```bash
cd backend
npm run dev
# API running at http://localhost:3000/api/v1
```

### 6. Start the frontend

```bash
cd medisync-frontend
ng serve
# App running at http://localhost:4200
```

---

## Docker (all services)

```bash
# From project root
docker-compose up -d

# Run migrations inside container
docker exec -it medisync_backend npx prisma migrate deploy
docker exec -it medisync_backend npx ts-node prisma/seed.ts
```

Services:
- **App**: http://localhost:4200
- **API**: http://localhost:3000/api/v1
- **pgAdmin**: http://localhost:5050

---

## Seed Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@medisync.com | Admin123! |
| Secretary | secretary@medisync.com | Secretary123! |
| Doctor | dr.chen@medisync.com | Doctor123! |
| Doctor | dr.moreau@medisync.com | Doctor123! |
| Doctor | dr.garcia@medisync.com | Doctor123! |
| Patient | patient1@example.com | Patient123! |

---

## Project Structure

```
medisync/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema (14+ models)
│   │   └── seed.ts             # Demo data seeder
│   ├── src/
│   │   ├── app.ts              # Express + Socket.io setup
│   │   ├── controllers/        # Route handlers
│   │   ├── middlewares/        # Auth, error, audit, upload
│   │   ├── routes/             # Express router definitions
│   │   └── utils/              # JWT, email, PDF, socket helpers
│   └── .env.example
│
├── medisync-frontend/
│   └── src/
│       ├── app/
│       │   ├── core/
│       │   │   ├── guards/     # authGuard, roleGuard
│       │   │   ├── interceptors/  # JWT attach + refresh
│       │   │   └── services/   # AuthService, ApiService, NotificationService
│       │   ├── features/
│       │   │   ├── auth/       # Login, Register, 2FA, Forgot Password
│       │   │   ├── patient/    # Dashboard, Appointments, Dossier, Prescriptions
│       │   │   ├── doctor/     # Dashboard, Planning, Patients, Consultation
│       │   │   ├── secretary/  # Dashboard, Appointments, Patients, Billing
│       │   │   └── admin/      # Dashboard, Staff, Finance, Audit, Settings
│       │   └── shared/
│       │       └── components/ # Sidebar, Topbar, Medi Mascot, Toast
│       └── styles/             # Global SCSS, glassmorphism, animations
│
└── docker-compose.yml
```

## API Overview

All endpoints are prefixed with `/api/v1/`.

| Prefix | Description |
|--------|-------------|
| `POST /auth/register` | Register a new patient |
| `POST /auth/login` | Login, returns JWT |
| `POST /auth/verify-2fa` | Verify TOTP code |
| `GET  /auth/me` | Current user profile |
| `GET  /appointments` | List appointments (role-filtered) |
| `POST /appointments` | Book appointment |
| `GET  /doctors` | List all doctors |
| `GET  /patients` | List all patients (secretary+) |
| `GET  /invoices` | List invoices (role-filtered) |
| `GET  /invoices/:id/pdf` | Download invoice PDF |
| `GET  /prescriptions/:id/pdf` | Download prescription PDF |
| `GET  /admin/stats` | Admin dashboard KPIs |
| `GET  /admin/staff` | List all staff |
| `GET  /admin/audit` | Audit log |
| `GET  /admin/finance` | Finance report |

Full API documentation available in Postman collection (see `/docs`).

## Features

- **Role-based access**: PATIENT, DOCTOR, SECRETARY, ADMIN with dedicated dashboards
- **Bioluminescent UI**: Dark-mode glassmorphism with animated ECG, particle background
- **Medi Mascot**: Animated SVG fox with eye-tracking, paw cover on password reveal, contextual hints
- **Real-time notifications**: Socket.io push for appointment status changes
- **2FA**: TOTP-based two-factor auth (Google Authenticator compatible)
- **PDF generation**: Server-side prescription and invoice PDFs
- **Audit logging**: All sensitive actions tracked with user, IP, timestamp
- **Animated KPI counters**: Count-up animation on dashboard metrics

## License

MIT — created for educational purposes.
