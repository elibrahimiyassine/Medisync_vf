import { z } from 'zod';

// ── Auth ──────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const passwordSchema = z.string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .refine(v => /[A-Z]/.test(v), 'Le mot de passe doit contenir au moins 1 majuscule')
  .refine(v => /[0-9]/.test(v), 'Le mot de passe doit contenir au moins 1 chiffre')
  .refine(v => /[^a-zA-Z0-9]/.test(v), 'Le mot de passe doit contenir au moins 1 caractère spécial');

export const registerSchema = z.object({
  email:       z.string().email('Adresse email invalide'),
  password:    passwordSchema,
  firstName:   z.string().min(1, 'Le prénom est requis'),
  lastName:    z.string().min(1, 'Le nom est requis'),
  phone:       z.string().optional(),
  dateOfBirth: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token:    z.string().min(1, 'Token requis'),
  password: passwordSchema,
});

export const verify2FASchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  token:  z.string().length(6, 'TOTP code must be 6 digits').regex(/^\d{6}$/, 'TOTP code must be numeric'),
});

export const enable2FASchema = z.object({
  token: z.string().length(6, 'TOTP code must be 6 digits').regex(/^\d{6}$/, 'TOTP code must be numeric'),
});

// ── Appointments ──────────────────────────────────────────────────────────────

export const createAppointmentSchema = z.object({
  motif:     z.string().min(1, 'Motif is required'),
  notes:     z.string().optional(),
  patientId: z.string().optional(),
  doctorId:  z.string().optional(),
  slotId:    z.string().optional(),
  slot: z.object({
    date:      z.string().min(1, 'Slot date is required'),
    startTime: z.string().min(1, 'Start time is required'),
    duration:  z.number().int().positive().optional(),
  }).optional(),
}).refine(data => data.slotId || data.slot, {
  message: 'Either slotId or slot object is required',
});

export const updateAppointmentSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'SCHEDULED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']).optional(),
  notes:  z.string().optional(),
  motif:  z.string().min(1).optional(),
});

// ── Time Slots ────────────────────────────────────────────────────────────────

export const createSlotSchema = z.object({
  dates:     z.array(z.string().min(1)).min(1, 'At least one date is required'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'startTime must be HH:MM'),
  endTime:   z.string().regex(/^\d{2}:\d{2}$/, 'endTime must be HH:MM'),
  duration:  z.number().int().positive().optional(),
});

// ── Medical Records ───────────────────────────────────────────────────────────

export const createRecordSchema = z.object({
  patientId:     z.string().min(1, 'Patient ID is required'),
  appointmentId: z.string().min(1, 'Appointment ID is required'),
  diagnosis:     z.string().min(1, 'Diagnosis is required'),
  notes:         z.string().optional(),
  symptoms:      z.array(z.string()).optional(),
  vitals:        z.record(z.string(), z.unknown()).optional(),
});

export const updateRecordSchema = z.object({
  diagnosis: z.string().min(1).optional(),
  notes:     z.string().optional(),
  symptoms:  z.array(z.string()).optional(),
  vitals:    z.record(z.string(), z.unknown()).optional(),
});

// ── Prescriptions ─────────────────────────────────────────────────────────────

const medicationSchema = z.object({
  name:      z.string().min(1),
  dosage:    z.string().optional(),
  frequency: z.string().optional(),
  duration:  z.string().optional(),
});

export const createPrescriptionSchema = z.object({
  patientId:       z.string().min(1, 'Patient ID is required'),
  medicalRecordId: z.string().optional(),
  medications:     z.array(medicationSchema).optional(),
  medication:      z.string().optional(),
  dosage:          z.string().optional(),
  duration:        z.string().optional(),
  frequency:       z.string().optional(),
  instructions:    z.string().optional(),
  expiresAt:       z.string().optional(),
});

export const updatePrescriptionSchema = z.object({
  medications:  z.array(medicationSchema).optional(),
  medication:   z.string().optional(),
  dosage:       z.string().optional(),
  duration:     z.string().optional(),
  instructions: z.string().optional(),
  expiresAt:    z.string().nullable().optional(),
});

// ── Admin ─────────────────────────────────────────────────────────────────────

export const createStaffSchema = z.object({
  email:            z.string().email('Invalid email address'),
  password:         z.string().min(8, 'Password must be at least 8 characters'),
  role:             z.enum(['DOCTOR', 'SECRETARY']),
  firstName:        z.string().min(1, 'First name is required'),
  lastName:         z.string().min(1, 'Last name is required'),
  specialty:        z.string().optional(),
  sectorType:       z.enum(['SECTOR_1', 'SECTOR_2', 'SECTOR_3']).optional(),
  consultationRate: z.number().positive().nullable().optional(),
  consultationFee:  z.number().positive().nullable().optional(),
  bio:              z.string().optional(),
  phone:            z.string().optional(),
});

export const updateStaffSchema = z.object({
  email:           z.string().email().optional(),
  firstName:       z.string().min(1).optional(),
  lastName:        z.string().min(1).optional(),
  specialty:       z.string().optional(),
  consultationFee: z.number().positive().nullable().optional(),
  consultationRate:z.number().positive().nullable().optional(),
  phone:           z.string().optional(),
  isActive:        z.boolean().optional(),
});

export const updateSettingsSchema = z.object({
  clinicName:           z.string().min(1).optional(),
  address:              z.string().optional(),
  phone:                z.string().optional(),
  email:                z.string().email().optional(),
  slotDuration:         z.number().int().positive().optional(),
  workingHoursStart:    z.string().regex(/^\d{2}:\d{2}$/).optional(),
  workingHoursEnd:      z.string().regex(/^\d{2}:\d{2}$/).optional(),
  consultationFee:      z.number().positive().optional(),
  invoicePrefix:        z.string().optional(),
  passwordPolicy:       z.string().optional(),
  twoFactorEnabled:     z.boolean().optional(),
  sessionTimeout:       z.number().int().positive().optional(),
});

// ── Patient ───────────────────────────────────────────────────────────────────

export const updatePatientSchema = z.object({
  firstName:        z.string().min(1).optional(),
  lastName:         z.string().min(1).optional(),
  phone:            z.string().optional(),
  address:          z.string().optional(),
  dateOfBirth:      z.string().optional(),
  bloodType:        z.enum(['A_POS','A_NEG','B_POS','B_NEG','AB_POS','AB_NEG','O_POS','O_NEG']).optional(),
  allergies:        z.array(z.string()).optional(),
  emergencyContact:     z.string().optional(),
  emergencyPhone:       z.string().optional(),
  guardianName:         z.string().optional(),
  guardianPhone:        z.string().optional(),
  guardianRelationship: z.string().optional(),
});

// ── Leave ─────────────────────────────────────────────────────────────────────

export const createLeaveSchema = z.object({
  startDate: z.string().min(1, 'Start date is required').regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  endDate:   z.string().min(1, 'End date is required').regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  reason:    z.string().optional(),
}).refine(d => new Date(d.endDate) >= new Date(d.startDate), {
  message: 'End date must be on or after start date',
  path: ['endDate'],
});

// ── Secretary ─────────────────────────────────────────────────────────────────

export const updateSecretarySchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName:  z.string().min(1).optional(),
  phone:     z.string().optional(),
});
