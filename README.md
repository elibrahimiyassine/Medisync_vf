# MediSync - Systeme de gestion de clinique medicale

MediSync est une application web full-stack pour la gestion d'une clinique medicale. Elle couvre les profils demandes dans le cahier des charges: patient, medecin, secretaire et administrateur.

## Stack technique

| Couche | Technologie |
| --- | --- |
| Frontend | Angular 21, Angular Signals, SCSS |
| Backend | Node.js, Express.js, TypeScript |
| Base de donnees | PostgreSQL 16, Prisma ORM |
| Authentification | JWT, refresh token, bcrypt, TOTP 2FA admin |
| Temps reel | Socket.io |
| Fichiers | Multer, stockage local |
| PDF | PDFKit |
| Documentation API | Swagger / OpenAPI sur `/api-docs` |

## Architecture du systeme

L'application suit une architecture en couches:

```text
Utilisateur web
    |
    v
Frontend Angular
    |
    | REST API + JWT
    v
Backend Node.js / Express
    |
    | Prisma ORM
    v
Base de donnees PostgreSQL
```

### Role de chaque couche

- **Frontend Angular**: interface utilisateur responsive pour les patients, medecins, secretaires et administrateurs.
- **Backend Express**: logique metier, authentification, gestion des rendez-vous, dossiers medicaux, factures, prescriptions et notifications.
- **Prisma ORM**: acces structure a la base de donnees et gestion des migrations.
- **PostgreSQL**: stockage des utilisateurs, rendez-vous, dossiers, documents, prescriptions, factures, logs d'audit et parametres.
- **Socket.io**: notifications en temps reel pour les changements de rendez-vous et les alertes.

## Schema de base de donnees

Le schema complet est dans `backend/prisma/schema.prisma`. Les principales tables sont:

| Table | Role |
| --- | --- |
| `users` | Comptes, roles, mots de passe, refresh tokens, 2FA |
| `patients` | Informations patients, securite sociale, contact |
| `doctors` | Informations medecins, specialite, disponibilite |
| `secretaries` | Comptes secretaires |
| `admins` | Comptes administrateurs |
| `time_slots` | Creneaux disponibles des medecins |
| `appointments` | Rendez-vous, statut, motif, notes |
| `medical_records` | Dossiers medicaux et consultations |
| `prescriptions` | Ordonnances et medicaments |
| `documents` | Documents uploades du patient |
| `invoices` | Factures et paiement |
| `notifications` | Notifications utilisateur |
| `reviews` | Avis et signalements |
| `audit_logs` | Journalisation des actions sensibles |

Relations principales:

- `User` est relie a un seul profil selon son role: `Patient`, `Doctor`, `Secretary` ou `Admin`.
- Un `Patient` peut avoir plusieurs `Appointment`, `MedicalRecord`, `Prescription`, `Document`, `Invoice` et `Review`.
- Un `Doctor` possede plusieurs `TimeSlot`, `Appointment`, `MedicalRecord` et `Prescription`.
- Un `Appointment` relie un patient, un medecin, un creneau et peut generer un dossier medical, une facture et un avis.

## Fonctionnalites par profil

### Patient

- Creation de compte patient.
- Connexion securisee avec JWT.
- Reservation de rendez-vous avec choix du medecin et du creneau.
- Consultation du dossier medical.
- Telechargement des ordonnances en PDF.
- Upload de documents medicaux.
- Notifications de changement de rendez-vous.
- Avis et signalement apres consultation.

### Medecin

- Tableau de bord et planning.
- Consultation de la liste des patients.
- Gestion des consultations et dossiers medicaux.
- Creation d'ordonnances.
- Ajout de documents et suivi des rendez-vous.

### Secretaire

- Creation et gestion des patients.
- Gestion des rendez-vous.
- Facturation.
- Generation de factures PDF.
- Notifications lors des reservations.

### Administrateur

- Tableau de bord avec statistiques.
- Gestion du personnel.
- Gestion financiere.
- Journal d'audit.
- Parametres de la clinique.
- 2FA obligatoire par application TOTP.

## Prerequis

- Node.js 20 ou plus
- npm
- PostgreSQL 16 ou plus
- Angular CLI, optionnel si vous utilisez `npm run start`

## Guide d'installation locale

### 1. Installer les dependances

Depuis la racine du projet:

```bash
cd backend
npm install

cd ../medisync-frontend
npm install
```

### 2. Configurer le backend

Copier le fichier d'exemple:

```bash
copy backend\.env.example backend\.env
```

Sur macOS ou Linux:

```bash
cp backend/.env.example backend/.env
```

Modifier ensuite `backend/.env` selon votre installation PostgreSQL:

```env
DATABASE_URL="postgresql://medisync:medisync_secret@localhost:5432/medisync"
JWT_SECRET="change-this-jwt-secret"
JWT_REFRESH_SECRET="change-this-refresh-secret"
PORT=3000
NODE_ENV=development
CORS_ORIGIN="http://localhost:4200"
```

Si vous utilisez l'utilisateur PostgreSQL `postgres`, l'URL peut devenir:

```env
DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/medisync"
```

### 3. Creer la base de donnees

Avec `psql`:

```bash
psql -U postgres -c "CREATE DATABASE medisync;"
```

Ou avec pgAdmin: creer une base nommee `medisync`.

### 4. Initialiser Prisma et les donnees demo

```bash
cd backend
npx prisma migrate reset --force --skip-generate
npx prisma generate
npm run seed
```

Cette commande cree les tables et ajoute des comptes demo: admin, secretaire, medecins, patients, rendez-vous, dossiers, prescriptions, factures et logs.

### 5. Lancer le backend

```bash
cd backend
npm run dev
```

Backend:

- API: `http://localhost:3000/api/v1`
- Health check: `http://localhost:3000/health`
- Swagger: `http://localhost:3000/api-docs`

### 6. Lancer le frontend

Dans un nouveau terminal:

```bash
cd medisync-frontend
npm run start
```

Application web:

- `http://localhost:4200`

## Comptes de demonstration

| Role | Email | Mot de passe |
| --- | --- | --- |
| Admin | `admin@medisync.ma` | `Admin123!` |
| Secretaire | `secretary@medisync.ma` | `Secretary123!` |
| Medecin | `dr.chen@medisync.ma` | `Doctor123!` |
| Medecin | `dr.moreau@medisync.ma` | `Doctor123!` |
| Medecin | `dr.garcia@medisync.ma` | `Doctor123!` |
| Patient | `alice.bernard@email.fr` | `Patient123!` |
| Patient | `bob.martin@email.fr` | `Patient123!` |

Note: la 2FA est obligatoire pour l'administrateur. Au premier login, l'admin doit scanner le QR code avec Google Authenticator, Microsoft Authenticator ou une application compatible TOTP.

## Build de l'application compilee

### Backend

```bash
cd backend
npm run build
npm run start
```

### Frontend

```bash
cd medisync-frontend
npm run build
```

Le resultat compile du frontend se trouve dans `medisync-frontend/dist/`.

## Guide de deploiement

### Option Docker locale

Le fichier `docker-compose.yml` lance PostgreSQL, pgAdmin et le backend:

```bash
docker compose up --build
```

Services:

- PostgreSQL: `localhost:5432`
- pgAdmin: `http://localhost:5050`
- Backend: `http://localhost:3000`

### Option frontend Vercel + backend Render/Railway

1. Deployer le backend sur Render ou Railway.
2. Ajouter les variables d'environnement backend: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `NODE_ENV`, `CORS_ORIGIN`.
3. Deployer le frontend Angular sur Vercel.
4. Configurer l'URL API du frontend pour pointer vers l'URL publique du backend.
5. Verifier:
   - `GET /health` sur le backend.
   - Login avec un compte demo.
   - Reservation d'un rendez-vous.
   - Telechargement PDF ordonnance/facture.

## Structure du projet

```text
medisync/
|-- backend/
|   |-- prisma/
|   |   |-- schema.prisma
|   |   |-- seed.ts
|   |   `-- migrations/
|   |-- src/
|   |   |-- app.ts
|   |   |-- controllers/
|   |   |-- middlewares/
|   |   |-- routes/
|   |   `-- utils/
|   |-- uploads/
|   |-- .env.example
|   `-- package.json
|-- medisync-frontend/
|   |-- src/app/
|   |   |-- core/
|   |   |-- features/
|   |   `-- shared/
|   |-- angular.json
|   `-- package.json
`-- docker-compose.yml
```

## API principale

Tous les endpoints commencent par `/api/v1`.

| Methode | Endpoint | Description |
| --- | --- | --- |
| POST | `/auth/register` | Creation d'un compte patient |
| POST | `/auth/login` | Connexion et generation JWT |
| POST | `/auth/2fa/verify` | Verification 2FA |
| GET | `/auth/me` | Profil utilisateur connecte |
| GET | `/doctors` | Liste des medecins |
| GET | `/appointments` | Liste des rendez-vous |
| POST | `/appointments` | Creation d'un rendez-vous |
| GET | `/invoices` | Liste des factures |
| GET | `/invoices/:id/pdf` | Telechargement facture PDF |
| GET | `/prescriptions/:id/pdf` | Telechargement ordonnance PDF |
| GET | `/admin/stats` | Statistiques admin |
| GET | `/admin/staff` | Liste du personnel |
| GET | `/admin/audit` | Journal d'audit |
| GET | `/admin/finance` | Rapport financier |

## Depannage rapide

**Erreur `DATABASE_URL connection refused`**

Verifier que PostgreSQL est lance et que la base `medisync` existe.

**Erreur Prisma sur Windows**

Utiliser:

```bash
npx prisma migrate reset --force --skip-generate
npx prisma generate
```

**Frontend ne trouve pas Angular CLI**

Utiliser `npm run start` dans `medisync-frontend` apres `npm install`.

**Login retourne 500**

La cause la plus frequente est une base de donnees non initialisee ou PostgreSQL arrete.

## Livrables recommandes

- Code source complet du frontend et du backend.
- Application compilee: `backend/dist/` et `medisync-frontend/dist/`.
- Documentation technique: ce README couvre architecture, schema DB, installation et deploiement.
- Video de demonstration par profil: patient, medecin, secretaire, administrateur.

## Licence

Projet realise dans un cadre pedagogique.
