# MediSync Deployment

Recommended setup:

- Backend and PostgreSQL: Render
- Frontend Angular: Vercel

## 1. Push This Clean Version To GitHub

Use the clean `Medisync` repo, not the broken `Medisync_vf` merge-conflict copy.

## 2. Deploy Backend On Render

1. Go to Render and create a new Blueprint.
2. Select the GitHub repository.
3. Render will read `render.yaml`.
4. After deployment, copy the backend URL, for example:

```text
https://medisync-api.onrender.com
```

5. In Render, use the deployed frontend URL:

```text
FRONTEND_URL=https://medisync-vf.vercel.app
FRONTEND_URLS=https://medisync-vf.vercel.app,https://medisync-frontend-pi.vercel.app
```

Optional first seed after deploy:

```bash
npx ts-node prisma/seed.ts
```

Run it from a Render shell or locally with the production `DATABASE_URL`.

## 3. Deploy Frontend On Vercel

1. Import the same GitHub repository in Vercel.
2. Set the root directory to:

```text
medisync-frontend
```

3. Add environment variables:

```text
MEDISYNC_API_URL=https://medisync-api.onrender.com/api/v1
MEDISYNC_WS_URL=https://medisync-api.onrender.com
```

4. Deploy.

## 4. Connect Both Sides

The current production frontend URL is:

```text
https://medisync-vf.vercel.app
```

Then redeploy the backend.

## 5. Production Notes

- Do not commit `.env`, token files, logs, or uploaded medical files.
- Use strong JWT secrets.
- Configure SMTP for real email reminders and invoices.
- Medical data is sensitive: use HTTPS, access control, audit logs, backups, and proper legal/privacy notices.
