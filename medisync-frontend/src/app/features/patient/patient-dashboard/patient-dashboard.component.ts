import { Component, OnInit, AfterViewInit, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface KpiCard {
  label: string;
  value: number;
  suffix?: string;
  icon: string;
  color: string;
  trend: string;
  trendUp: boolean;
}

interface Appointment {
  id: number;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  initials: string;
}

interface Prescription {
  id: number;
  name: string;
  doctor: string;
  date: string;
  dosage: string;
}

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './patient-dashboard.component.html',
  styleUrls:  ['./patient-dashboard.component.scss']
})
export class PatientDashboardComponent implements OnInit, AfterViewInit {
  @ViewChildren('kpiCard') kpiCards!: QueryList<ElementRef>;

  displayValues: number[] = [0, 0, 0, 0];

  kpis: KpiCard[] = [
    { label: 'Prochain RDV',          value: 3,  suffix: 'j', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: '#00D4FF', trend: '+1 ce mois', trendUp: true },
    { label: 'Consultations totales',  value: 12, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: '#7B61FF', trend: '+2 ce trimestre', trendUp: true },
    { label: 'Ordonnances actives',    value: 4,  icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z', color: '#00F5A0', trend: '2 expirées prochainement', trendUp: false },
    { label: 'Documents',             value: 8,  icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z', color: '#FFB800', trend: '+3 récents', trendUp: true },
  ];

  appointments: Appointment[] = [
    { id: 1, doctor: 'Dr. Karim Alaoui',   specialty: 'Cardiologue',    date: '12 Mai 2026', time: '09:30', status: 'confirmed', initials: 'KA' },
    { id: 2, doctor: 'Dr. Sara Benali',    specialty: 'Dermatologue',   date: '18 Mai 2026', time: '14:00', status: 'pending',   initials: 'SB' },
    { id: 3, doctor: 'Dr. Omar Fassi',     specialty: 'Généraliste',    date: '24 Mai 2026', time: '11:15', status: 'confirmed', initials: 'OF' },
  ];

  prescriptions: Prescription[] = [
    { id: 1, name: 'Amoxicilline 500mg',  doctor: 'Dr. Karim Alaoui', date: '28 Avr 2026', dosage: '3x/jour – 7 jours' },
    { id: 2, name: 'Metformine 850mg',    doctor: 'Dr. Sara Benali',  date: '10 Avr 2026', dosage: '2x/jour – 30 jours' },
    { id: 3, name: 'Doliprane 1000mg',    doctor: 'Dr. Omar Fassi',   date: '05 Avr 2026', dosage: 'Si douleur' },
  ];

  statusColor(s: string) {
    return { confirmed: '#00F5A0', pending: '#FFB800', cancelled: '#FF4D6D' }[s] ?? '#5A7A9B';
  }
  statusLabel(s: string) {
    return { confirmed: 'Confirmé', pending: 'En attente', cancelled: 'Annulé' }[s] ?? s;
  }
  statusBadge(s: string) {
    return { confirmed: 'badge-green', pending: 'badge-yellow', cancelled: 'badge-red' }[s] ?? 'badge-muted';
  }

  today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  ngOnInit() {}

  ngAfterViewInit() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const idx = Number((entry.target as HTMLElement).dataset['idx']);
          this.animateCount(idx);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    this.kpiCards.forEach((ref, i) => {
      (ref.nativeElement as HTMLElement).dataset['idx'] = String(i);
      observer.observe(ref.nativeElement);
    });
  }

  animateCount(idx: number) {
    const target = this.kpis[idx].value;
    const steps  = 40;
    let step     = 0;
    const timer  = setInterval(() => {
      step++;
      this.displayValues[idx] = Math.round((step / steps) * target);
      if (step >= steps) {
        this.displayValues[idx] = target;
        clearInterval(timer);
      }
    }, 30);
  }
}
