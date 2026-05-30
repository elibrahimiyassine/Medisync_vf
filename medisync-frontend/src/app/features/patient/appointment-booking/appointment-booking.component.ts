import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MediMascotComponent } from '../../../shared/components/medi-mascot/medi-mascot.component';
import { ToastService } from '../../../shared/services/toast.service';

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  languages: string[];
  rating: number;
  sector: string;
  initials: string;
  color: string;
  available: number;
}

interface Slot {
  id: string;
  day: string;
  date: string;
  time: string;
  hour: number;
  ring: number;
  angle: number;
  x: number;
  y: number;
  available: boolean;
  selected: boolean;
}

@Component({
  selector: 'app-appointment-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, MediMascotComponent],
  templateUrl: './appointment-booking.component.html',
  styleUrls:  ['./appointment-booking.component.scss']
})
export class AppointmentBookingComponent {
  currentStep = 1;
  selectedDoctor: Doctor | null = null;
  selectedSlot: Slot | null = null;
  hoveredSlot: Slot | null = null;
  motif = '';
  forThird = false;
  showSuccess = false;

  searchQuery = '';
  selectedSpecialty = '';

  specialties = ['Généraliste', 'Cardiologue', 'Dermatologue', 'Pédiatre', 'Ophtalmologue', 'Neurologie'];

  doctors: Doctor[] = [
    { id: 1, name: 'Dr. Karim Alaoui',   specialty: 'Cardiologue',    languages: ['FR', 'AR'],      rating: 4.9, sector: 'Secteur 2', initials: 'KA', color: '#00D4FF', available: 8 },
    { id: 2, name: 'Dr. Sara Benali',    specialty: 'Dermatologue',   languages: ['FR', 'EN', 'AR'], rating: 4.7, sector: 'Secteur 1', initials: 'SB', color: '#7B61FF', available: 5 },
    { id: 3, name: 'Dr. Omar Fassi',     specialty: 'Généraliste',    languages: ['FR', 'AR'],      rating: 4.8, sector: 'Secteur 1', initials: 'OF', color: '#00F5A0', available: 12 },
    { id: 4, name: 'Dr. Leila Rahimi',   specialty: 'Pédiatre',       languages: ['FR'],            rating: 4.6, sector: 'Secteur 3', initials: 'LR', color: '#FFB800', available: 3 },
    { id: 5, name: 'Dr. Hamid Tazi',     specialty: 'Ophtalmologue',  languages: ['FR', 'EN'],      rating: 4.5, sector: 'Secteur 2', initials: 'HT', color: '#FF4D6D', available: 6 },
    { id: 6, name: 'Dr. Nadia Chraibi',  specialty: 'Neurologie',     languages: ['FR', 'AR', 'EN'],rating: 4.9, sector: 'Secteur 1', initials: 'NC', color: '#00D4FF', available: 4 },
  ];

  get filteredDoctors() {
    return this.doctors.filter(d => {
      const matchSearch = !this.searchQuery ||
        d.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        d.specialty.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchSpec = !this.selectedSpecialty || d.specialty === this.selectedSpecialty;
      return matchSearch && matchSpec;
    });
  }

  // Orbit data
  rings: { radius: number; dayLabel: string; date: string; dayKey: string }[] = [];
  allSlots: Slot[] = [];

  selectDoctor(doc: Doctor) {
    this.selectedDoctor = doc;
    this.generateOrbitSlots();
    this.currentStep = 2;
  }

  generateOrbitSlots() {
    const radii = [90, 120, 150, 180, 210, 240, 270];
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const now = new Date();

    this.rings = radii.map((r, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() + i + 1);
      return {
        radius: r,
        dayLabel: days[d.getDay() === 0 ? 6 : d.getDay() - 1],
        date: d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        dayKey: d.toISOString().split('T')[0],
      };
    });

    this.allSlots = [];
    const hours = [8, 9, 10, 11, 14, 15, 16, 17, 18];

    this.rings.forEach((ring, ri) => {
      hours.forEach(h => {
        const angle = ((h - 8) / 12) * 360 - 90;
        const rad   = (angle * Math.PI) / 180;
        const x     = Math.cos(rad) * ring.radius;
        const y     = Math.sin(rad) * ring.radius;
        const avail = Math.random() > 0.35;
        this.allSlots.push({
          id:        `${ring.dayKey}-${h}`,
          day:       ring.dayLabel,
          date:      ring.date,
          time:      `${h}:00`,
          hour:      h,
          ring:      ri,
          angle,
          x, y,
          available: avail,
          selected:  false,
        });
      });
    });
  }

  selectSlot(slot: Slot) {
    if (!slot.available) return;
    this.allSlots.forEach(s => s.selected = false);
    slot.selected  = true;
    this.selectedSlot = slot;
  }

  goToStep(n: number) { this.currentStep = n; }

  confirm() {
    this.showSuccess = true;
    setTimeout(() => {
      this.showSuccess = false;
      this.currentStep = 1;
      this.selectedDoctor = null;
      this.selectedSlot   = null;
    }, 3500);
  }

  stars(rating: number) {
    return Array.from({ length: 5 }, (_, i) => i < Math.round(rating));
  }
}
