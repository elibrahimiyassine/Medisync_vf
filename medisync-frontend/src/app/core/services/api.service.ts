import { Injectable } from '@angular/core';
<<<<<<< HEAD
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get<T>(path: string, params?: Record<string, any>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) httpParams = httpParams.set(k, String(v));
      });
    }
    return this.http.get<T>(`${this.base}${path}`, { params: httpParams });
  }

  post<T>(path: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.base}${path}`, body);
  }

  put<T>(path: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.base}${path}`, body);
  }

  patch<T>(path: string, body: any): Observable<T> {
    return this.http.patch<T>(`${this.base}${path}`, body);
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.base}${path}`);
  }

  upload<T>(path: string, form: FormData): Observable<T> {
    return this.http.post<T>(`${this.base}${path}`, form);
=======
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AuthService } from './auth.service';

// ── DB schema ─────────────────────────────────────────────────────────────────

interface AppDb {
  appointments:    any[];
  prescriptions:   any[];
  medicalRecords:  any[];
  patientProfiles: any[];
  doctorProfiles:  any[];
  staff:           any[];
  invoices:        any[];
  auditLogs:       any[];
  settings:        any;
  slots:           any[];
  leaves:          any[];
  rooms:           any[];
  reviews:         any[];
}

const APP_DB_KEY = 'medisync_app_db';

// ── Date helpers ──────────────────────────────────────────────────────────────

const _D        = new Date();
const today     = _D.toISOString().slice(0, 10);
const tomorrow  = new Date(_D.getTime() +  86_400_000).toISOString().slice(0, 10);
const in2days   = new Date(_D.getTime() + 172_800_000).toISOString().slice(0, 10);
const in3days   = new Date(_D.getTime() + 259_200_000).toISOString().slice(0, 10);
const yesterday = new Date(_D.getTime() -  86_400_000).toISOString().slice(0, 10);
const lastWeek  = new Date(_D.getTime() - 604_800_000).toISOString().slice(0, 10);

function buildSlots(doctorId: string, allAvailable = false): any[] {
  const times = ['08:30','09:00','09:30','10:00','10:30','11:00','14:00','14:30','15:00','15:30'];
  const result: any[] = [];
  [tomorrow, in2days, in3days].forEach(date => {
    times.forEach(t => {
      result.push({ id: `sl-${doctorId}-${date}-${t}`, date, startTime: t, duration: 30,
        isAvailable: allAvailable ? true : Math.random() > 0.35, doctorId });
    });
  });
  return result;
}

// ── Seed data for demo accounts ───────────────────────────────────────────────

const SEED_DOCTOR_PROFILES = [
  { id: 'd1', email: 'dr.chen@medisync.ma',     firstName: 'Marc',     lastName: 'Chen',     specialty: 'Cardiologue',  phone: '+212 6 11 22 33 44', isActive: true, bio: '15 ans de cardiologie. Ancien chef du service cardiologie du CHU de Casablanca.', rating: 4.9, consultations: 2340, slots: buildSlots('d1') },
  { id: 'd2', email: 'dr.martin@medisync.ma',   firstName: 'Sophie',   lastName: 'Martin',   specialty: 'Neurologue',   phone: '+212 6 22 33 44 55', isActive: true, bio: 'Spécialiste des maladies neurodégénératives et de la gestion des migraines.',      rating: 4.7, consultations: 1850, slots: buildSlots('d2') },
  { id: 'd3', email: 'dr.dubois@medisync.ma',   firstName: 'Pierre',   lastName: 'Dubois',   specialty: 'Pédiatre',     phone: '+212 6 33 44 55 66', isActive: true, bio: "Passionné par la santé de l'enfant avec 12 ans d'expérience pédiatrique.",         rating: 4.8, consultations: 3100, slots: buildSlots('d3') },
  { id: 'd4', email: 'dr.lefebvre@medisync.ma', firstName: 'Isabelle', lastName: 'Lefebvre', specialty: 'Dermatologue', phone: '+212 6 44 55 66 77', isActive: true, bio: 'Experte en dermatologie et en cosmétologie médicale.',                              rating: 4.6, consultations: 1420, slots: buildSlots('d4') },
];

const SEED_PATIENT_PROFILES = [
  { id: 'p1', email: 'alice.bernard@email.fr',  firstName: 'Alice',   lastName: 'Bernard', user: { email: 'alice.bernard@email.fr'  }, phone: '+212 6 12 34 56 78', bloodType: 'A_POS',  allergies: ['Pénicilline'], address: '', dateOfBirth: '', emergencyContact: '', emergencyPhone: '', createdAt: '2025-01-15T00:00:00Z' },
  { id: 'p2', email: 'jean.dupont@email.fr',    firstName: 'Jean',    lastName: 'Dupont',  user: { email: 'jean.dupont@email.fr'    }, phone: '+212 6 23 45 67 89', bloodType: 'O_POS',  allergies: [], address: '', dateOfBirth: '', emergencyContact: '', emergencyPhone: '', createdAt: '2025-02-01T00:00:00Z' },
  { id: 'p3', email: 'marie.leroy@email.fr',    firstName: 'Marie',   lastName: 'Leroy',   user: { email: 'marie.leroy@email.fr'    }, phone: '+212 6 34 56 78 90', bloodType: 'B_NEG',  allergies: ['Aspirine'], address: '', dateOfBirth: '', emergencyContact: '', emergencyPhone: '', createdAt: '2025-02-15T00:00:00Z' },
  { id: 'p4', email: 'thomas.petit@email.fr',   firstName: 'Thomas',  lastName: 'Petit',   user: { email: 'thomas.petit@email.fr'   }, phone: '+212 6 45 67 89 01', bloodType: 'AB_POS', allergies: [], address: '', dateOfBirth: '', emergencyContact: '', emergencyPhone: '', createdAt: '2025-03-01T00:00:00Z' },
  { id: 'p5', email: 'camille.moreau@email.fr', firstName: 'Camille', lastName: 'Moreau',  user: { email: 'camille.moreau@email.fr' }, phone: '+212 6 56 78 90 12', bloodType: 'A_NEG',  allergies: [], address: '', dateOfBirth: '', emergencyContact: '', emergencyPhone: '', createdAt: '2025-03-15T00:00:00Z' },
];

const SEED_APPOINTMENTS = [
  { id: 'a1', patientEmail: 'alice.bernard@email.fr', doctorEmail: 'dr.chen@medisync.ma',     patientId: 'p1', status: 'CONFIRMED', motif: 'Bilan cardiaque annuel',     slot: { id: 'sl1', date: tomorrow,  startTime: '09:00', duration: 30 }, doctor: { id: 'd1', firstName: 'Marc',     lastName: 'Chen',     specialty: 'Cardiologue'  }, patient: { id: 'p1', firstName: 'Alice',  lastName: 'Bernard', allergies: [] } },
  { id: 'a2', patientEmail: 'alice.bernard@email.fr', doctorEmail: 'dr.martin@medisync.ma',   patientId: 'p1', status: 'PENDING',   motif: 'Consultation neurologique',  slot: { id: 'sl2', date: in2days,   startTime: '10:30', duration: 30 }, doctor: { id: 'd2', firstName: 'Sophie',   lastName: 'Martin',   specialty: 'Neurologue'   }, patient: { id: 'p1', firstName: 'Alice',  lastName: 'Bernard', allergies: ['Pénicilline'] } },
  { id: 'a3', patientEmail: 'jean.dupont@email.fr',   doctorEmail: 'dr.chen@medisync.ma',     patientId: 'p2', status: 'CONFIRMED', motif: 'Consultation de suivi',      slot: { id: 'sl3', date: today,     startTime: '11:00', duration: 30 }, doctor: { id: 'd1', firstName: 'Marc',     lastName: 'Chen',     specialty: 'Cardiologue'  }, patient: { id: 'p2', firstName: 'Jean',   lastName: 'Dupont',  allergies: [] } },
  { id: 'a4', patientEmail: 'marie.leroy@email.fr',   doctorEmail: 'dr.dubois@medisync.ma',   patientId: 'p3', status: 'COMPLETED', motif: 'Bilan pédiatrique annuel',   slot: { id: 'sl4', date: yesterday, startTime: '14:00', duration: 45 }, doctor: { id: 'd3', firstName: 'Pierre',   lastName: 'Dubois',   specialty: 'Pédiatre'     }, patient: { id: 'p3', firstName: 'Marie',  lastName: 'Leroy',   allergies: [] } },
  { id: 'a5', patientEmail: 'thomas.petit@email.fr',  doctorEmail: 'dr.martin@medisync.ma',   patientId: 'p4', status: 'CANCELLED', motif: 'Douleurs dorsales',          slot: { id: 'sl5', date: yesterday, startTime: '16:00', duration: 30 }, doctor: { id: 'd2', firstName: 'Sophie',   lastName: 'Martin',   specialty: 'Neurologue'   }, patient: { id: 'p4', firstName: 'Thomas', lastName: 'Petit',   allergies: [] } },
  { id: 'a6', patientEmail: 'alice.bernard@email.fr', doctorEmail: 'dr.chen@medisync.ma',     patientId: 'p1', status: 'COMPLETED', motif: "Test ECG d'effort",          slot: { id: 'sl6', date: lastWeek,  startTime: '09:30', duration: 60 }, doctor: { id: 'd1', firstName: 'Marc',     lastName: 'Chen',     specialty: 'Cardiologue'  }, patient: { id: 'p1', firstName: 'Alice',  lastName: 'Bernard', allergies: [] } },
  { id: 'a7', patientEmail: 'jean.dupont@email.fr',   doctorEmail: 'dr.lefebvre@medisync.ma', patientId: 'p2', status: 'PENDING',   motif: 'Éruption cutanée',           slot: { id: 'sl7', date: in3days,   startTime: '14:30', duration: 30 }, doctor: { id: 'd4', firstName: 'Isabelle', lastName: 'Lefebvre', specialty: 'Dermatologue' }, patient: { id: 'p2', firstName: 'Jean',   lastName: 'Dupont',  allergies: [] } },
];

const SEED_PRESCRIPTIONS = [
  { id: 'rx1', patientEmail: 'alice.bernard@email.fr', doctorEmail: 'dr.chen@medisync.ma',   patientId: 'p1', medication: 'Amoxicilline 500 mg', dosage: '3 fois par jour',           duration: '7 jours',  instructions: 'Prendre avec un repas.', status: 'ACTIVE',    createdAt: '2026-05-01T10:00:00Z', doctor: { firstName: 'Marc',   lastName: 'Chen'   } },
  { id: 'rx2', patientEmail: 'alice.bernard@email.fr', doctorEmail: 'dr.martin@medisync.ma', patientId: 'p1', medication: 'Ibuprofène 400 mg',   dosage: '2 fois par jour si besoin', duration: '5 jours',  instructions: 'Ne pas prendre à jeun.', status: 'ACTIVE',    createdAt: '2026-04-15T14:30:00Z', doctor: { firstName: 'Sophie', lastName: 'Martin' } },
  { id: 'rx3', patientEmail: 'alice.bernard@email.fr', doctorEmail: 'dr.chen@medisync.ma',   patientId: 'p1', medication: 'Oméprazole 20 mg',    dosage: '1 fois par jour (matin)',   duration: '30 jours', instructions: 'Prendre 30 min avant le petit-déjeuner.', status: 'COMPLETED', createdAt: '2026-03-10T09:00:00Z', doctor: { firstName: 'Marc',   lastName: 'Chen'   } },
  { id: 'rx4', patientEmail: 'marie.leroy@email.fr',   doctorEmail: 'dr.dubois@medisync.ma', patientId: 'p3', medication: 'Cétirizine 10 mg',    dosage: '1 fois par jour au coucher',duration: 'En continu',instructions: 'Peut provoquer de la somnolence.', status: 'ACTIVE',    createdAt: '2026-04-28T11:00:00Z', doctor: { firstName: 'Pierre', lastName: 'Dubois' } },
];

const SEED_RECORDS = [
  { id: 'r1', patientEmail: 'alice.bernard@email.fr', doctorEmail: 'dr.chen@medisync.ma',   patientId: 'p1', diagnosis: 'Hypertension artérielle essentielle', notes: 'TA élevée à 145/90. Régime recommandé.',                  files: [], createdAt: '2026-04-10T10:00:00Z', doctor: { firstName: 'Marc',   lastName: 'Chen'   } },
  { id: 'r2', patientEmail: 'alice.bernard@email.fr', doctorEmail: 'dr.martin@medisync.ma', patientId: 'p1', diagnosis: 'Céphalées de tension',                notes: 'Probablement dues au stress. Myorelaxants prescrits.',     files: [], createdAt: '2026-03-15T14:00:00Z', doctor: { firstName: 'Sophie', lastName: 'Martin' } },
  { id: 'r3', patientEmail: 'alice.bernard@email.fr', doctorEmail: 'dr.chen@medisync.ma',   patientId: 'p1', diagnosis: 'Pharyngite aiguë',                    notes: 'Infection bactérienne. Antibiothérapie de 7 jours.',       files: [], createdAt: '2026-02-20T11:00:00Z', doctor: { firstName: 'Marc',   lastName: 'Chen'   } },
];

const SEED_STAFF = [
  { id: 's1', firstName: 'Marc',     lastName: 'Chen',     email: 'dr.chen@medisync.ma',     role: 'DOCTOR',    specialty: 'Cardiologue',  phone: '+212 6 11 22 33 44', isActive: true },
  { id: 's2', firstName: 'Sophie',   lastName: 'Martin',   email: 'dr.martin@medisync.ma',   role: 'DOCTOR',    specialty: 'Neurologue',   phone: '+212 6 22 33 44 55', isActive: true },
  { id: 's3', firstName: 'Pierre',   lastName: 'Dubois',   email: 'dr.dubois@medisync.ma',   role: 'DOCTOR',    specialty: 'Pédiatre',     phone: '+212 6 33 44 55 66', isActive: true },
  { id: 's4', firstName: 'Isabelle', lastName: 'Lefebvre', email: 'dr.lefebvre@medisync.ma', role: 'DOCTOR',    specialty: 'Dermatologue', phone: '+212 6 44 55 66 77', isActive: true },
  { id: 's5', firstName: 'Sarah',    lastName: 'Leblanc',  email: 'secretary@medisync.ma',   role: 'SECRETARY', specialty: undefined,       phone: '+212 6 55 66 77 88', isActive: true },
];

const SEED_INVOICES = [
  { id: 'inv1', patientEmail: 'alice.bernard@email.fr', patient: { firstName: 'Alice',  lastName: 'Bernard' }, appointment: { doctor: { lastName: 'Chen'   } }, issuedAt: '2026-05-01', amount: 150, status: 'PAID'    },
  { id: 'inv2', patientEmail: 'jean.dupont@email.fr',   patient: { firstName: 'Jean',   lastName: 'Dupont'  }, appointment: { doctor: { lastName: 'Martin' } }, issuedAt: '2026-05-05', amount: 120, status: 'PENDING' },
  { id: 'inv3', patientEmail: 'marie.leroy@email.fr',   patient: { firstName: 'Marie',  lastName: 'Leroy'   }, appointment: { doctor: { lastName: 'Dubois' } }, issuedAt: '2026-05-08', amount: 200, status: 'PAID'    },
  { id: 'inv4', patientEmail: 'thomas.petit@email.fr',  patient: { firstName: 'Thomas', lastName: 'Petit'   }, appointment: { doctor: { lastName: 'Chen'   } }, issuedAt: '2026-05-12', amount: 80,  status: 'OVERDUE' },
  { id: 'inv5', patientEmail: 'alice.bernard@email.fr', patient: { firstName: 'Alice',  lastName: 'Bernard' }, appointment: { doctor: { lastName: 'Martin' } }, issuedAt: '2026-05-15', amount: 160, status: 'PAID'    },
];

const _now = new Date();
const SEED_AUDIT = [
  { id: 'l1', action: 'CONNEXION',           target: null,                    ip: '192.168.1.10', createdAt: _now.toISOString(),                                 user: { email: 'dr.chen@medisync.ma',    role: 'DOCTOR'    } },
  { id: 'l2', action: 'CRÉER_RENDEZ-VOUS',   target: 'Rendez-vous #a1',       ip: '192.168.1.11', createdAt: new Date(_now.getTime() -  3_600_000).toISOString(), user: { email: 'secretary@medisync.ma',  role: 'SECRETARY' } },
  { id: 'l3', action: 'MODIFIER_PARAMÈTRES', target: 'Configuration clinique', ip: '192.168.1.5',  createdAt: new Date(_now.getTime() -  7_200_000).toISOString(), user: { email: 'admin@medisync.ma',      role: 'ADMIN'     } },
  { id: 'l4', action: 'SUPPRIMER_RDV',       target: 'Rendez-vous #a5',       ip: '192.168.1.11', createdAt: new Date(_now.getTime() - 14_400_000).toISOString(), user: { email: 'secretary@medisync.ma',  role: 'SECRETARY' } },
  { id: 'l5', action: 'CONNEXION',           target: null,                    ip: '10.0.0.42',    createdAt: new Date(_now.getTime() - 86_400_000).toISOString(), user: { email: 'alice.bernard@email.fr', role: 'PATIENT'   } },
];

const SEED_SETTINGS = {
  clinicName: 'MediSync Clinique', address: 'Centre Médical MediSync, Avenue Mohammed V, 20000 Casablanca, Maroc',
  phone: '+212 5 22 00 00 00', email: 'contact@medisync.ma',
  slotDuration: 30, workingHoursStart: '08:00', workingHoursEnd: '18:00',
  consultationFee: 300, invoicePrefix: 'FAC',
  passwordPolicy: 'strong', twoFactorEnabled: false, sessionTimeout: 30,
};

function buildSeedDb(): AppDb {
  return {
    appointments:    [...SEED_APPOINTMENTS],
    prescriptions:   [...SEED_PRESCRIPTIONS],
    medicalRecords:  [...SEED_RECORDS],
    patientProfiles: [...SEED_PATIENT_PROFILES],
    doctorProfiles:  [...SEED_DOCTOR_PROFILES],
    staff:           [...SEED_STAFF],
    invoices:        [...SEED_INVOICES],
    auditLogs:       [...SEED_AUDIT],
    settings:        { ...SEED_SETTINGS },
    slots:           [],
    leaves:          [],
    rooms:           [],
    reviews:         [],
  };
}

// ─────────────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class ApiService {

  constructor(private authService: AuthService) {
    if (!localStorage.getItem(APP_DB_KEY)) {
      localStorage.setItem(APP_DB_KEY, JSON.stringify(buildSeedDb()));
    } else {
      // Migrate: add missing arrays for older stored DBs
      try {
        const existing = JSON.parse(localStorage.getItem(APP_DB_KEY)!);
        let changed = false;
        for (const key of ['slots', 'leaves', 'rooms', 'reviews'] as const) {
          if (!existing[key]) { existing[key] = []; changed = true; }
        }
        // Add mutuelle field to existing invoices
        for (const inv of existing.invoices || []) {
          if (!('mutuelle' in inv)) { inv.mutuelle = ''; changed = true; }
        }
        // Migrate clinic address from France to Morocco
        if (existing.settings?.address?.includes('Paris, France')) {
          existing.settings.address = 'Centre Médical MediSync, Avenue Mohammed V, 20000 Casablanca, Maroc';
          existing.settings.phone   = '+212 5 22 00 00 00';
          changed = true;
        }
        if (changed) localStorage.setItem(APP_DB_KEY, JSON.stringify(existing));
      } catch { /* ignore */ }
    }
  }

  private db(): AppDb {
    try { return JSON.parse(localStorage.getItem(APP_DB_KEY)!); }
    catch { return buildSeedDb(); }
  }

  private save(db: AppDb): void {
    localStorage.setItem(APP_DB_KEY, JSON.stringify(db));
  }

  // ── Profile helpers (lazy-create on first access) ─────────────────────────

  private getOrCreatePatient(db: AppDb, email: string, profile: any): any {
    const el = email.toLowerCase();
    let p = db.patientProfiles.find(x => x.email?.toLowerCase() === el);
    if (!p) {
      p = { id: 'p-' + Date.now(), email: el, firstName: profile?.firstName || '', lastName: profile?.lastName || '',
            user: { email: el }, phone: '', address: '', dateOfBirth: '', bloodType: '',
            allergies: [], emergencyContact: '', emergencyPhone: '', createdAt: new Date().toISOString() };
      db.patientProfiles.push(p);
      this.save(db);
    }
    return p;
  }

  private getOrCreateDoctor(db: AppDb, email: string, profile: any): any {
    const el = email.toLowerCase();
    let d = db.doctorProfiles.find(x => x.email?.toLowerCase() === el);
    if (!d) {
      const did = 'd-' + Date.now();
      d = { id: did, email: el, firstName: profile?.firstName || '', lastName: profile?.lastName || '',
            specialty: '', phone: '', bio: '', isActive: true, rating: 0, consultations: 0,
            slots: buildSlots(did, true) };
      db.doctorProfiles.push(d);
      // Also register in staff list
      if (!db.staff.find(s => s.email?.toLowerCase() === el)) {
        db.staff.push({ id: 's-' + Date.now(), firstName: d.firstName, lastName: d.lastName,
                        email: el, role: 'DOCTOR', specialty: '', phone: '', isActive: true });
      }
      this.save(db);
    }
    return d;
  }

  private ensureSecretaryInStaff(db: AppDb, email: string, profile: any): void {
    const el = email.toLowerCase();
    if (!db.staff.find(s => s.email?.toLowerCase() === el)) {
      db.staff.push({ id: 's-' + Date.now(), firstName: profile?.firstName || '', lastName: profile?.lastName || '',
                      email: el, role: 'SECRETARY', specialty: undefined, phone: '', isActive: true });
      this.save(db);
    }
  }

  // ── GET ───────────────────────────────────────────────────────────────────

  get<T>(path: string, params?: Record<string, any>): Observable<T> {
    const db    = this.db();
    const user  = this.authService.user();
    const role  = user?.role;
    const email = (user?.email || '').toLowerCase();
    let result: any;

    // /patients/me
    if (path === '/patients/me') {
      const p  = this.getOrCreatePatient(db, email, user?.profile);
      const dbAfter = this.db();
      result = {
        ...p,
        appointments:  dbAfter.appointments.filter(a  => a.patientEmail?.toLowerCase() === email),
        prescriptions: dbAfter.prescriptions.filter(r => r.patientEmail?.toLowerCase() === email),
      };
    }

    // /appointments
    else if (path.startsWith('/appointments')) {
      let all = db.appointments;
      if (params?.['date']) all = all.filter(a => a.slot?.date === params['date']);
      if      (role === 'PATIENT')   result = all.filter(a => a.patientEmail?.toLowerCase() === email);
      else if (role === 'DOCTOR')    result = all.filter(a => a.doctorEmail?.toLowerCase()  === email);
      else                           result = all;
    }

    // /prescriptions
    else if (path.startsWith('/prescriptions')) {
      let rxList: any[];
      if      (role === 'PATIENT') rxList = db.prescriptions.filter(r => r.patientEmail?.toLowerCase() === email);
      else if (role === 'DOCTOR')  rxList = db.prescriptions.filter(r => r.doctorEmail?.toLowerCase()  === email);
      else                         rxList = db.prescriptions;
      result = rxList.map(rx => {
        if (!rx.patient) {
          const pat = db.patientProfiles.find(p => p.id === rx.patientId || p.email?.toLowerCase() === rx.patientEmail?.toLowerCase());
          return { ...rx, patient: pat ? { firstName: pat.firstName, lastName: pat.lastName } : { firstName: '—', lastName: '' } };
        }
        return rx;
      });
    }

    // /doctors/me/dashboard
    else if (path === '/doctors/me/dashboard') {
      this.getOrCreateDoctor(db, email, user?.profile);
      const freshDb  = this.db();
      const myAll    = freshDb.appointments.filter(a => a.doctorEmail?.toLowerCase() === email);
      const myToday  = myAll.filter(a => a.slot?.date === today);
      const patients = new Set(myAll.map(a => a.patientEmail)).size;
      result = {
        todayAppointments: myToday,
        stats: { todayTotal: myToday.length, completedToday: myToday.filter(a => a.status === 'COMPLETED').length,
                 pending: myAll.filter(a => a.status === 'PENDING').length, totalPatients: patients },
      };
    }

    // /doctors/me/profile
    else if (path === '/doctors/me/profile') {
      result = this.getOrCreateDoctor(db, email, user?.profile);
    }

    // /doctors/me/* (appointments list)
    else if (path.startsWith('/doctors/me')) {
      result = db.appointments.filter(a => a.doctorEmail?.toLowerCase() === email);
    }

    // /doctors/:id/slots
    else if (path.match(/\/doctors\/[^/]+\/slots/)) {
      const id  = path.split('/')[2];
      const doc = db.doctorProfiles.find(d => d.id === id || d.email?.toLowerCase() === id);
      result = doc?.slots || buildSlots(id, true);
    }

    // /doctors/:id
    else if (path.match(/^\/doctors\/[^/]+$/)) {
      const id = path.split('/')[2];
      result = db.doctorProfiles.find(d => d.id === id || d.email?.toLowerCase() === id) || null;
    }

    // /doctors
    else if (path === '/doctors') {
      result = db.doctorProfiles;
    }

    // /patients (list for secretary/admin)
    else if (path === '/patients') {
      result = db.patientProfiles;
    }

    // /patients/:id  (detail for secretary/admin)
    else if (path.startsWith('/patients/')) {
      const id = path.split('/')[2];
      const p  = db.patientProfiles.find(x => x.id === id || x.email?.toLowerCase() === id);
      const pa = db.appointments.filter(a  => a.patientId === id || a.patientEmail?.toLowerCase() === p?.email?.toLowerCase());
      const pr = db.prescriptions.filter(r => r.patientId === id || r.patientEmail?.toLowerCase() === p?.email?.toLowerCase());
      result = { ...(p || {}), appointments: pa, prescriptions: pr };
    }

    // /medical-records
    else if (path.startsWith('/medical-records') || path.startsWith('/dossier')) {
      if (role === 'PATIENT') result = db.medicalRecords.filter(r => r.patientEmail?.toLowerCase() === email);
      else                    result = db.medicalRecords;
    }

    // /admin/*
    else if (path === '/admin/stats') {
      const byStatus: Record<string,number> = {};
      db.appointments.forEach(a => { byStatus[a.status] = (byStatus[a.status] || 0) + 1; });
      result = {
        totalPatients:        db.patientProfiles.length,
        totalDoctors:         db.doctorProfiles.length,
        totalAppointments:    db.appointments.length,
        monthAppointments:    db.appointments.filter(a => a.slot?.date >= new Date(_D.getFullYear(), _D.getMonth(), 1).toISOString().slice(0, 10)).length,
        pendingInvoices:      db.invoices.filter(i => i.status === 'PENDING').length,
        totalRevenue:         db.invoices.filter(i => i.status === 'PAID').reduce((s: number, i: any) => s + (i.amount || 0), 0),
        noShowRate:           4.2,
        appointmentsByStatus: Object.entries(byStatus).map(([status, _count]) => ({ status, _count })),
      };
    }
    else if (path === '/admin/staff')   result = db.staff;
    else if (path === '/admin/audit')   result = db.auditLogs;
    else if (path === '/admin/finance') result = {
      summary: {
        totalRevenue:   db.invoices.filter(i => i.status === 'PAID').reduce((s: number, i: any) => s + (i.amount || 0), 0),
        paidCount:      db.invoices.filter(i => i.status === 'PAID').length,
        pendingRevenue: db.invoices.filter(i => i.status === 'PENDING').reduce((s: number, i: any) => s + (i.amount || 0), 0),
        avgAmount: 140, byDoctor: [],
      },
      invoices: db.invoices,
    };
    else if (path === '/admin/settings') result = db.settings;

    // /slots
    else if (path === '/slots') {
      const db2 = this.db();
      if (!db2.slots) db2.slots = [];
      let mySlots = db2.slots.filter((s: any) => s.doctorEmail === email);
      if (params?.['date']) {
        mySlots = mySlots.filter((s: any) => s.date === params['date']);
      } else if (params?.['dateFrom'] && params?.['dateTo']) {
        mySlots = mySlots.filter((s: any) => s.date >= params['dateFrom'] && s.date <= params['dateTo']);
      }
      result = mySlots;
    }

    // /doctor/leaves
    else if (path === '/doctor/leaves') {
      const db2 = this.db();
      if (!db2.leaves) db2.leaves = [];
      result = db2.leaves.filter((l: any) => l.doctorEmail === email);
    }

    // /admin/rooms
    else if (path === '/admin/rooms') {
      const db2 = this.db();
      if (!db2.rooms) db2.rooms = [];
      result = db2.rooms;
    }

    else if (path === '/notifications') result = [];
    else if (path.startsWith('/secretary')) {
      if (role === 'SECRETARY') this.ensureSecretaryInStaff(db, email, user?.profile);
      result = db.appointments;
    }

    else result = [];

    return of({ data: result } as T).pipe(delay(320));
  }

  // ── POST ──────────────────────────────────────────────────────────────────

  post<T>(path: string, body: any): Observable<T> {
    if (path.includes('/auth/')) return of({ data: null } as T);
    const db    = this.db();
    const user  = this.authService.user();
    const email = (user?.email || '').toLowerCase();
    const newId = path.replace(/\//g, '-').replace(/^-/, '') + '-' + Date.now();

    if (path === '/appointments') {
      const doc = db.doctorProfiles.find(d => d.id === body.doctorId || d.email?.toLowerCase() === body.doctorId);
      const pat = db.patientProfiles.find(p => p.id === body.patientId || p.email?.toLowerCase() === body.patientId)
               || (user?.role === 'PATIENT' ? this.getOrCreatePatient(db, email, user.profile) : null);
      const record = {
        id: newId,
        patientId:    pat?.id    || body.patientId || '',
        patientEmail: pat?.email || (user?.role === 'PATIENT' ? email : ''),
        doctorEmail:  doc?.email || '',
        status: 'PENDING', motif: body.motif || '',
        slot: { id: 'sl-' + newId, date: body.slot?.date, startTime: body.slot?.startTime, duration: body.slot?.duration || 30 },
        doctor:  doc ? { id: doc.id, firstName: doc.firstName, lastName: doc.lastName, specialty: doc.specialty }
                     : { id: body.doctorId, firstName: '', lastName: '', specialty: '' },
        patient: pat ? { id: pat.id, firstName: pat.firstName, lastName: pat.lastName, allergies: pat.allergies || [] }
                     : { id: body.patientId, firstName: '', lastName: '', allergies: [] },
      };
      db.appointments.push(record);
      this.save(db);
      return of({ data: record, message: 'Créé' } as T).pipe(delay(400));
    }

    if (path === '/prescriptions') {
      const doc = db.doctorProfiles.find(d => d.email?.toLowerCase() === email);
      const pat = db.patientProfiles.find(p => p.id === body.patientId || p.email?.toLowerCase() === body.patientId);
      const record = {
        id: newId, patientId: pat?.id || '', patientEmail: pat?.email || '', doctorEmail: email,
        medication: body.medication || '', dosage: body.dosage || '', duration: body.duration || '',
        instructions: body.instructions || '', status: 'ACTIVE', createdAt: new Date().toISOString(),
        doctor: doc ? { firstName: doc.firstName, lastName: doc.lastName }
                    : { firstName: user?.profile?.firstName || '', lastName: user?.profile?.lastName || '' },
      };
      db.prescriptions.push(record);
      this.save(db);
      return of({ data: record, message: 'Créé' } as T).pipe(delay(400));
    }

    if (path === '/medical-records' || path === '/dossier') {
      const doc = db.doctorProfiles.find(d => d.email?.toLowerCase() === email);
      const pat = db.patientProfiles.find(p => p.id === body.patientId || p.email?.toLowerCase() === body.patientId);
      const record = {
        id: newId, patientId: pat?.id || '', patientEmail: pat?.email || '', doctorEmail: email,
        diagnosis: body.diagnosis || '', notes: body.notes || '', files: [], createdAt: new Date().toISOString(),
        doctor: doc ? { firstName: doc.firstName, lastName: doc.lastName }
                    : { firstName: user?.profile?.firstName || '', lastName: user?.profile?.lastName || '' },
      };
      db.medicalRecords.push(record);
      this.save(db);
      return of({ data: record, message: 'Créé' } as T).pipe(delay(400));
    }

    if (path === '/admin/staff') {
      const member = { id: newId, ...body };
      db.staff.push(member);
      this.save(db);
      return of({ data: member, message: 'Créé' } as T).pipe(delay(400));
    }

    if (path === '/slots') {
      if (!db.slots) db.slots = [];
      const dates: string[] = body.dates || [body.date];
      const created: any[] = [];
      dates.forEach((date: string) => {
        const slot = {
          id: 'sl-' + Date.now() + '-' + Math.random().toString(36).slice(2),
          date, startTime: body.startTime, endTime: body.endTime,
          duration: body.duration || 30, type: body.type || 'GENERAL',
          isAvailable: true, doctorEmail: email,
        };
        db.slots.push(slot);
        created.push(slot);
      });
      this.save(db);
      return of({ data: created, message: 'Créé' } as T).pipe(delay(300));
    }

    if (path === '/doctor/leaves') {
      if (!db.leaves) db.leaves = [];
      const leave = { id: 'lv-' + Date.now(), doctorEmail: email, startDate: body.startDate, endDate: body.endDate, reason: body.reason || '', createdAt: new Date().toISOString() };
      db.leaves.push(leave);
      this.save(db);
      return of({ data: leave, message: 'Créé' } as T).pipe(delay(300));
    }

    if (path === '/admin/rooms') {
      if (!db.rooms) db.rooms = [];
      const room = { id: 'rm-' + Date.now(), name: body.name, capacity: body.capacity || 1, equipment: body.equipment || [] };
      db.rooms.push(room);
      this.save(db);
      return of({ data: room, message: 'Créé' } as T).pipe(delay(300));
    }

    if (path === '/reviews') {
      if (!db.reviews) db.reviews = [];
      const review = { id: 'rv-' + Date.now(), doctorId: body.doctorId, appointmentId: body.appointmentId, rating: body.rating, comment: body.comment || '', patientEmail: email, createdAt: new Date().toISOString() };
      db.reviews.push(review);
      const apptIdx = db.appointments.findIndex(a => a.id === body.appointmentId);
      if (apptIdx !== -1) db.appointments[apptIdx] = { ...db.appointments[apptIdx], review: { rating: body.rating, comment: body.comment || '' } };
      this.save(db);
      return of({ data: review, message: 'Créé' } as T).pipe(delay(300));
    }

    return of({ data: { id: newId, success: true }, message: 'Créé' } as T).pipe(delay(400));
  }

  // ── PUT ───────────────────────────────────────────────────────────────────

  put<T>(path: string, body: any): Observable<T> {
    const db    = this.db();
    const email = (this.authService.user()?.email || '').toLowerCase();

    const updateIn = (arr: any[], id: string, patch: any) => {
      const i = arr.findIndex(x => x.id === id);
      if (i !== -1) arr[i] = { ...arr[i], ...patch };
    };

    if (path.match(/\/appointments\//))      { updateIn(db.appointments,    path.split('/').pop()!, body); }
    if (path.match(/\/prescriptions\//))     { updateIn(db.prescriptions,   path.split('/').pop()!, body); }
    if (path.match(/\/admin\/staff\//))      { updateIn(db.staff,           path.split('/').pop()!, body); }
    if (path === '/admin/settings')          { db.settings = { ...db.settings, ...body }; }

    if (path === '/patients/me') {
      const i = db.patientProfiles.findIndex(p => p.email?.toLowerCase() === email);
      if (i !== -1) db.patientProfiles[i] = { ...db.patientProfiles[i], ...body };
    }
    if (path.match(/\/patients\//) && path !== '/patients/me') {
      updateIn(db.patientProfiles, path.split('/').pop()!, body);
    }
    if (path === '/doctors/me/profile' || path.match(/\/doctors\/(?!me)/)) {
      const i = db.doctorProfiles.findIndex(d => d.email?.toLowerCase() === email);
      if (i !== -1) db.doctorProfiles[i] = { ...db.doctorProfiles[i], ...body };
    }

    this.save(db);
    return of({ data: { success: true }, message: 'Mis à jour' } as T).pipe(delay(350));
  }

  // ── PATCH ─────────────────────────────────────────────────────────────────

  patch<T>(path: string, body: any): Observable<T> {
    return this.put<T>(path, body);
  }

  // ── DELETE ────────────────────────────────────────────────────────────────

  delete<T>(path: string): Observable<T> {
    const db = this.db();
    const id = path.split('/').pop()!;

    if (path.match(/\/appointments\//))  db.appointments  = db.appointments.filter(x => x.id !== id);
    if (path.match(/\/prescriptions\//)) db.prescriptions = db.prescriptions.filter(x => x.id !== id);
    if (path.match(/\/admin\/staff\//))  db.staff         = db.staff.filter(x => x.id !== id);
    if (path.match(/\/slots\//))         { if (db.slots)  db.slots  = db.slots.filter(x => x.id !== id); }
    if (path.match(/\/doctor\/leaves\//))  { if (db.leaves) db.leaves = db.leaves.filter(x => x.id !== id); }
    if (path.match(/\/admin\/rooms\//))  { if (db.rooms)  db.rooms  = db.rooms.filter(x => x.id !== id); }

    this.save(db);
    return of({ data: { success: true }, message: 'Supprimé' } as T).pipe(delay(300));
  }

  // ── UPLOAD ────────────────────────────────────────────────────────────────

  upload<T>(_path: string, _form: FormData): Observable<T> {
    return of({ data: { url: '/mock-upload.pdf', success: true } } as T).pipe(delay(600));
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
  }
}
