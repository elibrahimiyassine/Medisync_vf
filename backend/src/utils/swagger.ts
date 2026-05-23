import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MediSync API',
      version: '1.0.0',
      description: 'REST API for MediSync — clinic management platform. All endpoints are prefixed with `/api/v1`.',
      contact: { name: 'MediSync Dev', email: 'dev@medisync.ma' },
    },
    servers: [
      { url: '/api/v1', description: 'Current server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Access token obtained from POST /auth/login',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Resource not found' },
          },
        },
        Appointment: {
          type: 'object',
          properties: {
            id:        { type: 'string', format: 'uuid' },
            patientId: { type: 'string', format: 'uuid' },
            doctorId:  { type: 'string', format: 'uuid' },
            slotId:    { type: 'string', format: 'uuid' },
            status:    { type: 'string', enum: ['PENDING','CONFIRMED','SCHEDULED','CANCELLED','COMPLETED','NO_SHOW'] },
            motif:     { type: 'string' },
            notes:     { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Patient: {
          type: 'object',
          properties: {
            id:          { type: 'string', format: 'uuid' },
            firstName:   { type: 'string' },
            lastName:    { type: 'string' },
            dateOfBirth: { type: 'string', format: 'date', nullable: true },
            phone:       { type: 'string', nullable: true },
            bloodType:   { type: 'string', nullable: true },
            allergies:   { type: 'array', items: { type: 'string' } },
          },
        },
        Doctor: {
          type: 'object',
          properties: {
            id:               { type: 'string', format: 'uuid' },
            firstName:        { type: 'string' },
            lastName:         { type: 'string' },
            specialty:        { type: 'string' },
            sectorType:       { type: 'string', enum: ['SECTOR_1','SECTOR_2','SECTOR_3'] },
            consultationRate: { type: 'number' },
            isAvailable:      { type: 'boolean' },
          },
        },
        Prescription: {
          type: 'object',
          properties: {
            id:             { type: 'string', format: 'uuid' },
            medicalRecordId:{ type: 'string', format: 'uuid' },
            medications:    { type: 'array', items: { type: 'object' } },
            instructions:   { type: 'string', nullable: true },
            issuedAt:       { type: 'string', format: 'date-time' },
            expiresAt:      { type: 'string', format: 'date-time', nullable: true },
          },
        },
        Invoice: {
          type: 'object',
          properties: {
            id:            { type: 'string', format: 'uuid' },
            patientId:     { type: 'string', format: 'uuid' },
            appointmentId: { type: 'string', format: 'uuid' },
            amount:        { type: 'number' },
            status:        { type: 'string', enum: ['PENDING','PAID','OVERDUE'] },
            issuedAt:      { type: 'string', format: 'date-time' },
          },
        },
        MedicalRecord: {
          type: 'object',
          properties: {
            id:            { type: 'string', format: 'uuid' },
            patientId:     { type: 'string', format: 'uuid' },
            doctorId:      { type: 'string', format: 'uuid' },
            appointmentId: { type: 'string', format: 'uuid' },
            diagnosis:     { type: 'string' },
            symptoms:      { type: 'array', items: { type: 'string' } },
            vitals:        { type: 'object', nullable: true },
            notes:         { type: 'string', nullable: true },
          },
        },
        Notification: {
          type: 'object',
          properties: {
            id:        { type: 'string', format: 'uuid' },
            message:   { type: 'string' },
            type:      { type: 'string' },
            isRead:    { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Report: {
          type: 'object',
          properties: {
            id:          { type: 'string', format: 'uuid' },
            patientId:   { type: 'string', format: 'uuid' },
            urgency:     { type: 'string', enum: ['INFO','LOW','MEDIUM','HIGH','CRITICAL'] },
            description: { type: 'string' },
            status:      { type: 'string', enum: ['OPEN','IN_PROGRESS','RESOLVED'] },
            createdAt:   { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth',          description: 'Authentication & 2FA' },
      { name: 'Patients',      description: 'Patient profile & records' },
      { name: 'Doctors',       description: 'Doctor profiles & availability' },
      { name: 'Appointments',  description: 'Appointment booking & management' },
      { name: 'Slots',         description: 'Doctor time-slot management' },
      { name: 'Records',       description: 'Medical records & documents' },
      { name: 'Prescriptions', description: 'Prescription issuance' },
      { name: 'Invoices',      description: 'Billing & invoices' },
      { name: 'Admin',         description: 'Admin-only endpoints' },
      { name: 'Notifications', description: 'User notifications' },
      { name: 'Reviews',       description: 'Patient doctor reviews' },
      { name: 'Leave',         description: 'Doctor leave management' },
      { name: 'Secretary',     description: 'Secretary-specific operations' },
    ],
    paths: {
      // ── AUTH ──────────────────────────────────────────────────────────────────
      '/auth/register': {
        post: {
          tags: ['Auth'], summary: 'Register a new patient account', security: [],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email','password','firstName','lastName'], properties: { email: { type: 'string', format: 'email' }, password: { type: 'string', minLength: 8 }, firstName: { type: 'string' }, lastName: { type: 'string' }, phone: { type: 'string' } } } } } },
          responses: { '201': { description: 'Account created' }, '409': { description: 'Email already in use' } },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Auth'], summary: 'Authenticate and receive access token', security: [],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email','password'], properties: { email: { type: 'string', format: 'email' }, password: { type: 'string' } } } } } },
          responses: { '200': { description: 'Login successful, returns JWT access token + sets httpOnly refresh cookie' }, '401': { description: 'Invalid credentials' } },
        },
      },
      '/auth/logout': {
        post: { tags: ['Auth'], summary: 'Invalidate refresh token and clear cookie', responses: { '200': { description: 'Logged out' } } },
      },
      '/auth/refresh': {
        post: { tags: ['Auth'], summary: 'Obtain new access token using refresh cookie', security: [], responses: { '200': { description: 'New access token' }, '401': { description: 'Invalid or expired refresh token' } } },
      },
      '/auth/me': {
        get: { tags: ['Auth'], summary: 'Get current authenticated user info', responses: { '200': { description: 'User object' } } },
      },
      '/auth/forgot-password': {
        post: { tags: ['Auth'], summary: 'Request password reset email', security: [], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email'], properties: { email: { type: 'string', format: 'email' } } } } } }, responses: { '200': { description: 'Reset email sent if account exists' } } },
      },
      '/auth/reset-password': {
        post: { tags: ['Auth'], summary: 'Reset password with token', security: [], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['token','password'], properties: { token: { type: 'string' }, password: { type: 'string', minLength: 8 } } } } } }, responses: { '200': { description: 'Password updated' }, '400': { description: 'Invalid or expired token' } } },
      },
      '/auth/2fa/verify': {
        post: { tags: ['Auth'], summary: 'Verify TOTP code after login (2FA step)', security: [], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['userId','token'], properties: { userId: { type: 'string' }, token: { type: 'string', minLength: 6, maxLength: 6 } } } } } }, responses: { '200': { description: 'Access token returned' }, '401': { description: 'Invalid code' } } },
      },

      // ── PATIENTS ──────────────────────────────────────────────────────────────
      '/patients/me': {
        get:  { tags: ['Patients'], summary: "Get logged-in patient's own profile", responses: { '200': { description: 'Patient profile', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Patient' } } } } } },
        put:  { tags: ['Patients'], summary: 'Update own patient profile', requestBody: { required: true, content: { 'application/json': { schema: { '$ref': '#/components/schemas/Patient' } } } }, responses: { '200': { description: 'Updated patient' } } },
      },
      '/patients': {
        get: { tags: ['Patients'], summary: 'List all patients (staff only)', parameters: [{ name: 'search', in: 'query', schema: { type: 'string' } }, { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } }, { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } }], responses: { '200': { description: 'Paginated patient list' } } },
      },
      '/patients/{id}': {
        get: { tags: ['Patients'], summary: 'Get patient by ID (staff only)', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Patient detail' }, '404': { description: 'Not found' } } },
      },
      '/patients/{id}/records': {
        get: { tags: ['Patients'], summary: 'Get all medical records for a patient', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Medical records list' } } },
      },
      '/patients/{id}/lab-results': {
        get: { tags: ['Patients'], summary: 'Get lab-result documents for a patient', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'LAB_RESULT documents' } } },
      },
      '/patients/{id}/documents': {
        post: { tags: ['Patients'], summary: 'Upload document to patient dossier', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' }, documentType: { type: 'string' } } } } } }, responses: { '201': { description: 'Document created' } } },
      },
      '/patients/signal': {
        post: { tags: ['Patients'], summary: 'Patient submits symptom report / alert', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { urgency: { type: 'string', enum: ['INFO','LOW','MEDIUM','HIGH','CRITICAL'] }, description: { type: 'string' }, doctorId: { type: 'string', nullable: true } } } } } }, responses: { '201': { description: 'Report created, admins notified' } } },
      },

      // ── APPOINTMENTS ─────────────────────────────────────────────────────────
      '/appointments': {
        get:  { tags: ['Appointments'], summary: 'List appointments (filtered by caller role)', parameters: [{ name: 'status', in: 'query', schema: { type: 'string' } }, { name: 'date', in: 'query', schema: { type: 'string', format: 'date' } }], responses: { '200': { description: 'Appointment list' } } },
        post: { tags: ['Appointments'], summary: 'Book a new appointment', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['motif'], properties: { motif: { type: 'string' }, slotId: { type: 'string' }, doctorId: { type: 'string' }, patientId: { type: 'string' } } } } } }, responses: { '201': { description: 'Appointment booked' }, '409': { description: 'Slot already taken' } } },
      },
      '/appointments/{id}': {
        get:   { tags: ['Appointments'], summary: 'Get appointment by ID', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Appointment detail' } } },
        patch: { tags: ['Appointments'], summary: 'Update appointment status or notes', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' }, notes: { type: 'string' } } } } } }, responses: { '200': { description: 'Updated appointment' } } },
        delete: { tags: ['Appointments'], summary: 'Cancel/delete appointment', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Cancelled' } } },
      },

      // ── SLOTS ─────────────────────────────────────────────────────────────────
      '/slots': {
        get:  { tags: ['Slots'], summary: 'Get available time slots', parameters: [{ name: 'doctorId', in: 'query', schema: { type: 'string' } }, { name: 'date', in: 'query', schema: { type: 'string', format: 'date' } }], responses: { '200': { description: 'Slot list' } } },
        post: { tags: ['Slots'], summary: 'Create time slots for a doctor', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['dates','startTime','endTime'], properties: { dates: { type: 'array', items: { type: 'string', format: 'date' } }, startTime: { type: 'string', example: '09:00' }, endTime: { type: 'string', example: '17:00' }, duration: { type: 'integer', default: 30 } } } } } }, responses: { '201': { description: 'Slots created' } } },
      },
      '/slots/{id}': {
        delete: { tags: ['Slots'], summary: 'Delete a time slot', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Deleted' } } },
      },

      // ── RECORDS ──────────────────────────────────────────────────────────────
      '/records': {
        get:  { tags: ['Records'], summary: 'List medical records (role-filtered)', responses: { '200': { description: 'Records list' } } },
        post: { tags: ['Records'], summary: 'Create a medical record (doctor only)', requestBody: { required: true, content: { 'application/json': { schema: { '$ref': '#/components/schemas/MedicalRecord' } } } }, responses: { '201': { description: 'Record created' } } },
      },
      '/records/{id}': {
        get: { tags: ['Records'], summary: 'Get record by ID', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Record detail' } } },
        put: { tags: ['Records'], summary: 'Update medical record (doctor only)', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { '$ref': '#/components/schemas/MedicalRecord' } } } }, responses: { '200': { description: 'Updated record' } } },
      },
      '/records/{id}/documents': {
        post: { tags: ['Records'], summary: 'Upload document linked to a medical record (doctor only)', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' }, documentType: { type: 'string' } } } } } }, responses: { '201': { description: 'Document saved under patient dossier' } } },
      },

      // ── PRESCRIPTIONS ─────────────────────────────────────────────────────────
      '/prescriptions': {
        get:  { tags: ['Prescriptions'], summary: 'List prescriptions (role-filtered)', responses: { '200': { description: 'Prescriptions list' } } },
        post: { tags: ['Prescriptions'], summary: 'Create prescription (doctor only)', requestBody: { required: true, content: { 'application/json': { schema: { '$ref': '#/components/schemas/Prescription' } } } }, responses: { '201': { description: 'Prescription issued' } } },
      },
      '/prescriptions/{id}': {
        get:   { tags: ['Prescriptions'], summary: 'Get prescription by ID', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Prescription detail' } } },
        patch: { tags: ['Prescriptions'], summary: 'Update prescription', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { '$ref': '#/components/schemas/Prescription' } } } }, responses: { '200': { description: 'Updated' } } },
      },
      '/prescriptions/{id}/pdf': {
        get: { tags: ['Prescriptions'], summary: 'Download prescription as PDF', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'PDF binary', content: { 'application/pdf': {} } } } },
      },

      // ── INVOICES ──────────────────────────────────────────────────────────────
      '/invoices': {
        get:  { tags: ['Invoices'], summary: 'List invoices', parameters: [{ name: 'status', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Invoices list' } } },
        post: { tags: ['Invoices'], summary: 'Create invoice (secretary/admin)', requestBody: { required: true, content: { 'application/json': { schema: { '$ref': '#/components/schemas/Invoice' } } } }, responses: { '201': { description: 'Invoice created' } } },
      },
      '/invoices/{id}': {
        get:   { tags: ['Invoices'], summary: 'Get invoice by ID', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Invoice detail' } } },
        patch: { tags: ['Invoices'], summary: 'Update invoice status', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', enum: ['PENDING','PAID','OVERDUE'] } } } } } }, responses: { '200': { description: 'Updated' } } },
      },
      '/invoices/{id}/pdf': {
        get: { tags: ['Invoices'], summary: 'Download invoice PDF', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'PDF', content: { 'application/pdf': {} } } } },
      },
      '/invoices/{id}/feuille-soins': {
        get: { tags: ['Invoices'], summary: 'Download feuille de soins PDF', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'PDF', content: { 'application/pdf': {} } } } },
      },
      '/invoices/{id}/send-email': {
        post: { tags: ['Invoices'], summary: 'Send invoice by email to patient (secretary/admin)', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Email dispatched' } } },
      },

      // ── ADMIN ─────────────────────────────────────────────────────────────────
      '/admin/stats': {
        get: { tags: ['Admin'], summary: 'Get global KPI stats', responses: { '200': { description: 'Stats object' } } },
      },
      '/admin/stats/monthly': {
        get: { tags: ['Admin'], summary: 'Get monthly consultations & revenue for current year', responses: { '200': { description: 'Monthly array' } } },
      },
      '/admin/audit': {
        get: { tags: ['Admin'], summary: 'Get audit log', parameters: [{ name: 'limit', in: 'query', schema: { type: 'integer', default: 500 } }, { name: 'action', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Audit entries' } } },
      },
      '/admin/reports': {
        get: { tags: ['Admin'], summary: 'List patient symptom reports', parameters: [{ name: 'status', in: 'query', schema: { type: 'string', enum: ['OPEN','IN_PROGRESS','RESOLVED'] } }], responses: { '200': { description: 'Reports list' } } },
      },
      '/admin/reports/{id}': {
        patch: { tags: ['Admin'], summary: 'Update report status', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', enum: ['OPEN','IN_PROGRESS','RESOLVED'] } } } } } }, responses: { '200': { description: 'Updated report' } } },
      },
      '/admin/staff': {
        get:  { tags: ['Admin'], summary: 'List all staff (doctors + secretaries)', responses: { '200': { description: 'Staff list' } } },
        post: { tags: ['Admin'], summary: 'Create new staff member', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email','password','role','firstName','lastName'], properties: { email: { type: 'string' }, password: { type: 'string' }, role: { type: 'string', enum: ['DOCTOR','SECRETARY'] }, firstName: { type: 'string' }, lastName: { type: 'string' }, specialty: { type: 'string' } } } } } }, responses: { '201': { description: 'Staff created' } } },
      },
      '/admin/staff/{id}': {
        put:    { tags: ['Admin'], summary: 'Update staff member', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Updated' } } },
        delete: { tags: ['Admin'], summary: 'Deactivate staff member', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Deactivated' } } },
      },
      '/admin/finance': {
        get: { tags: ['Admin'], summary: 'Get finance report', parameters: [{ name: 'month', in: 'query', schema: { type: 'string', example: '2026-05' } }, { name: 'date', in: 'query', schema: { type: 'string', format: 'date' } }, { name: 'week', in: 'query', schema: { type: 'string', format: 'date' } }, { name: 'year', in: 'query', schema: { type: 'string', example: '2026' } }], responses: { '200': { description: 'Finance summary + invoices list' } } },
      },
      '/admin/settings': {
        get: { tags: ['Admin'], summary: 'Get clinic settings', responses: { '200': { description: 'ClinicSettings object' } } },
        put: { tags: ['Admin'], summary: 'Update clinic settings', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { '200': { description: 'Updated settings' } } },
      },
      '/admin/permissions': {
        get: { tags: ['Admin'], summary: 'Get role permissions matrix', responses: { '200': { description: 'Permissions per role (DOCTOR, SECRETARY, PATIENT)' } } },
      },
      '/admin/permissions/{role}': {
        put: { tags: ['Admin'], summary: 'Update permissions for a role', parameters: [{ name: 'role', in: 'path', required: true, schema: { type: 'string', enum: ['DOCTOR','SECRETARY','PATIENT'] } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { '200': { description: 'Updated' } } },
      },
      '/admin/rooms': {
        get:  { tags: ['Admin'], summary: 'List active rooms', responses: { '200': { description: 'Rooms list' } } },
        post: { tags: ['Admin'], summary: 'Create room', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name'], properties: { name: { type: 'string' }, equipment: { type: 'array', items: { type: 'string' } } } } } } }, responses: { '201': { description: 'Room created' } } },
      },
      '/admin/rooms/occupancy': {
        get: { tags: ['Admin'], summary: 'Get room occupancy stats', parameters: [{ name: 'period', in: 'query', schema: { type: 'integer', default: 7 } }], responses: { '200': { description: 'Per-room occupancy rates' } } },
      },
      '/admin/rooms/{id}': {
        delete: { tags: ['Admin'], summary: 'Deactivate room', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Deactivated' } } },
      },
      '/admin/totp/setup': {
        get: { tags: ['Admin'], summary: 'Generate TOTP secret + QR code for admin 2FA setup', responses: { '200': { description: 'Secret and QR code data URL' } } },
      },
      '/admin/totp/verify': {
        post: { tags: ['Admin'], summary: 'Verify TOTP code and enable 2FA for admin', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['code'], properties: { code: { type: 'string', minLength: 6, maxLength: 6 } } } } } }, responses: { '200': { description: '2FA enabled' }, '401': { description: 'Invalid code' } } },
      },

      // ── NOTIFICATIONS ─────────────────────────────────────────────────────────
      '/notifications': {
        get: { tags: ['Notifications'], summary: 'Get notifications for current user', responses: { '200': { description: 'Notifications list' } } },
      },
      '/notifications/{id}/read': {
        patch: { tags: ['Notifications'], summary: 'Mark notification as read', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Marked read' } } },
      },
      '/notifications/read-all': {
        patch: { tags: ['Notifications'], summary: 'Mark all notifications as read', responses: { '200': { description: 'All marked read' } } },
      },

      // ── REVIEWS ───────────────────────────────────────────────────────────────
      '/reviews': {
        post: { tags: ['Reviews'], summary: 'Submit a review for a completed appointment', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['appointmentId','rating'], properties: { appointmentId: { type: 'string' }, rating: { type: 'integer', minimum: 1, maximum: 5 }, comment: { type: 'string' } } } } } }, responses: { '201': { description: 'Review saved' } } },
      },
      '/reviews/doctor/{doctorId}': {
        get: { tags: ['Reviews'], summary: 'Get all reviews for a doctor', parameters: [{ name: 'doctorId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Reviews list' } } },
      },

      // ── LEAVE ─────────────────────────────────────────────────────────────────
      '/doctor/leaves': {
        get:  { tags: ['Leave'], summary: 'Get leaves for the authenticated doctor', responses: { '200': { description: 'Leave list' } } },
        post: { tags: ['Leave'], summary: 'Create a leave period', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['startDate','endDate'], properties: { startDate: { type: 'string', format: 'date' }, endDate: { type: 'string', format: 'date' }, reason: { type: 'string' } } } } } }, responses: { '201': { description: 'Leave created' } } },
      },
      '/doctor/leaves/{id}': {
        delete: { tags: ['Leave'], summary: 'Delete a leave period', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Deleted' } } },
      },

      // ── SECRETARY ─────────────────────────────────────────────────────────────
      '/secretary/patients': {
        post: { tags: ['Secretary'], summary: 'Secretary creates a patient account', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email','firstName','lastName'], properties: { email: { type: 'string', format: 'email' }, firstName: { type: 'string' }, lastName: { type: 'string' }, phone: { type: 'string' }, dateOfBirth: { type: 'string', format: 'date' } } } } } }, responses: { '201': { description: 'Patient created, temp password emailed' } } },
      },
      '/secretary/me': {
        put: { tags: ['Secretary'], summary: "Update secretary's own profile", requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { firstName: { type: 'string' }, lastName: { type: 'string' }, phone: { type: 'string' } } } } } }, responses: { '200': { description: 'Updated' } } },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
