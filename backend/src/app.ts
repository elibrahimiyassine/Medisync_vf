import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

import authRoutes from './routes/auth.routes';
import patientRoutes from './routes/patient.routes';
import doctorRoutes from './routes/doctor.routes';
import appointmentRoutes from './routes/appointment.routes';
import slotRoutes from './routes/slot.routes';
import recordRoutes from './routes/record.routes';
import prescriptionRoutes from './routes/prescription.routes';
import invoiceRoutes from './routes/invoice.routes';
import adminRoutes from './routes/admin.routes';
import notificationRoutes from './routes/notification.routes';
import documentRoutes from './routes/document.routes';
import reviewRoutes from './routes/review.routes';
import leaveRoutes from './routes/leave.routes';
import secretaryRoutes from './routes/secretary.routes';

import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './utils/swagger';
import { errorHandler } from './middlewares/error.middleware';
import { setupSocketIO } from './utils/socket';
import { logger } from './utils/logger';
import { scheduleReminders } from './utils/reminders';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true,
  },
});

// Make io available to routes
app.set('io', io);

setupSocketIO(io);

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());

// Logging
app.use(morgan('combined', {
  stream: { write: (msg) => logger.info(msg.trim()) }
}));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'MediSync API' });
});

// API docs (Swagger UI) — disable CSP only for this path so the UI loads
app.use('/api-docs', (req: express.Request, res: express.Response, next: express.NextFunction) => { res.setHeader('Content-Security-Policy', ''); next(); }, swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customSiteTitle: 'MediSync API Docs' }));
app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));

// API Routes
const apiPrefix = '/api/v1';
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/patients`, patientRoutes);
app.use(`${apiPrefix}/doctors`, doctorRoutes);
app.use(`${apiPrefix}/appointments`, appointmentRoutes);
app.use(`${apiPrefix}/slots`, slotRoutes);
app.use(`${apiPrefix}/records`, recordRoutes);
app.use(`${apiPrefix}/medical-records`, recordRoutes);
app.use(`${apiPrefix}/dossier`, recordRoutes);
app.use(`${apiPrefix}/prescriptions`, prescriptionRoutes);
app.use(`${apiPrefix}/invoices`, invoiceRoutes);
app.use(`${apiPrefix}/admin`, adminRoutes);
app.use(`${apiPrefix}/notifications`, notificationRoutes);
app.use(`${apiPrefix}/documents`, documentRoutes);
app.use(`${apiPrefix}/reviews`, reviewRoutes);
app.use(`${apiPrefix}/doctor/leaves`, leaveRoutes);
app.use(`${apiPrefix}/secretary`, secretaryRoutes);

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  logger.info(`MediSync API running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  scheduleReminders();
});

export { app, io };
