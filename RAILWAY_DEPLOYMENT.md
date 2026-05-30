# MediSync Railway Deployment

## Services

- Frontend: Vercel, already deployed at `https://medisync-vf.vercel.app`
- Backend: Railway Node service from `backend`
- Database: Railway PostgreSQL

## Backend Service

Use `backend` as the service root directory.

Railway reads `backend/railway.json`:

- build: `npm ci && npx prisma generate && npm run build`
- pre-deploy: `npm run prisma:deploy`
- start: `npm start`
- healthcheck: `/health`

## Required Railway Variables

```text
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<generate a long random secret>
JWT_REFRESH_SECRET=<generate another long random secret>
NODE_ENV=production
FRONTEND_URL=https://medisync-vf.vercel.app
FRONTEND_URLS=https://medisync-vf.vercel.app,https://medisync-frontend-pi.vercel.app
```

Optional SMTP variables:

```text
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=MediSync <no-reply@your-domain.com>
```

## Codex / CLI Token

Codex cannot complete Railway's browser login in a non-interactive terminal. Create a Railway token, then set it locally.

For the smoothest CLI/API deployment, create an **Account token** by choosing **No workspace** in the Railway token form. A workspace token can work only for workspace-scoped actions, and a project token is too narrow for creating the project/database.

```powershell
[Environment]::SetEnvironmentVariable("RAILWAY_API_TOKEN", "your_railway_token", "User")
$env:RAILWAY_API_TOKEN="your_railway_token"
```

After that, run Railway CLI commands from the repository root or from `backend`.

## After Deploy

1. Generate a Railway public domain for the backend service.
2. Test `https://<railway-domain>/health`.
3. Set Vercel variables:

```text
MEDISYNC_API_URL=https://medisync-api-production-1ace.up.railway.app/api/v1
MEDISYNC_WS_URL=https://medisync-api-production-1ace.up.railway.app
```

4. Redeploy Vercel.
5. Seed the DB once:

```bash
npm run seed
```
