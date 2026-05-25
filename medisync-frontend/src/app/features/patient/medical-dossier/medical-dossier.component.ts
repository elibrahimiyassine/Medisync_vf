import { Component, AfterViewInit, QueryList, ViewChildren, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

type EntryType = 'consultation' | 'prescription' | 'lab' | 'imaging' | 'document';

interface MedicalEntry {
  id: number;
  type: EntryType;
  date: string;
  doctor: string;
  specialty: string;
  title: string;
  preview: string;
  expanded: boolean;
}

@Component({
  selector: 'app-medical-dossier',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './medical-dossier.component.html',
  styleUrls:  ['./medical-dossier.component.scss']
})
export class MedicalDossierComponent implements AfterViewInit {
  @ViewChildren('timelineEntry') entries!: QueryList<ElementRef>;

  isDragOver = false;
  uploadProgress = 0;
  isUploading = false;

  timelineEntries: MedicalEntry[] = [
    { id: 1, type: 'consultation', date: '28 Avr 2026', doctor: 'Dr. Karim Alaoui', specialty: 'Cardiologue', title: 'Bilan cardiaque annuel', preview: 'Tension normale, rythme cardiaque régulier. Pas d\'anomalie détectée. Prochaine consultation recommandée dans 12 mois.', expanded: false },
    { id: 2, type: 'prescription',  date: '28 Avr 2026', doctor: 'Dr. Karim Alaoui', specialty: 'Cardiologue', title: 'Ordonnance — Amoxicilline 500mg', preview: 'Amoxicilline 500mg — 3 prises/jour pendant 7 jours. Doliprane 1g si douleur.', expanded: false },
    { id: 3, type: 'lab',           date: '15 Avr 2026', doctor: 'Dr. Sara Benali',  specialty: 'Dermatologue', title: 'Bilan biologique complet', preview: 'NFS normale. Glycémie à 0.92 g/L. Cholestérol total 1.85 g/L. Créatinine normale.', expanded: false },
    { id: 4, type: 'imaging',       date: '10 Mar 2026', doctor: 'Dr. Omar Fassi',   specialty: 'Généraliste', title: 'Radio thoracique', preview: 'Champs pulmonaires libres. Pas d\'opacité suspecte. Silhouette cardio-médiastinale normale.', expanded: false },
    { id: 5, type: 'consultation',  date: '20 Jan 2026', doctor: 'Dr. Leila Rahimi', specialty: 'Pédiatre',    title: 'Consultation de suivi', preview: 'Développement normal. Vaccins à jour. Poids et taille dans les normes.', expanded: false },
    { id: 6, type: 'document',      date: '05 Jan 2026', doctor: 'Dr. Omar Fassi',   specialty: 'Généraliste', title: 'Certificat médical', preview: 'Certificat attestant l\'aptitude aux activités sportives pour l\'année 2026.', expanded: false },
  ];

  typeConfig: Record<EntryType, { icon: string; color: string; label: string }> = {
    consultation: { icon: '🩺', color: '#00D4FF', label: 'Consultation' },
    prescription:  { icon: '💊', color: '#7B61FF', label: 'Ordonnance'   },
    lab:           { icon: '🧪', color: '#00F5A0', label: 'Labo'         },
    imaging:       { icon: '🔬', color: '#FFB800', label: 'Imagerie'     },
    document:      { icon: '📄', color: '#5A7A9B', label: 'Document'     },
  };

  badgeClass: Record<EntryType, string> = {
    consultation: 'badge-cyan',
    prescription:  'badge-violet',
    lab:           'badge-green',
    imaging:       'badge-yellow',
    document:      'badge-muted',
  };

  ngAfterViewInit() {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          el.style.animationDelay = `${i * 80}ms`;
          el.classList.add('visible');
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.15 });

    this.entries.forEach(ref => obs.observe(ref.nativeElement));
  }

  toggleExpand(entry: MedicalEntry) {
    entry.expanded = !entry.expanded;
  }

  onDragOver(e: DragEvent) { e.preventDefault(); this.isDragOver = true; }
  onDragLeave() { this.isDragOver = false; }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.isDragOver = false;
    const file = e.dataTransfer?.files[0];
    if (file) this.simulateUpload(file.name);
  }

  onFileInput(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) this.simulateUpload(file.name);
  }

  simulateUpload(name: string) {
    this.isUploading  = true;
    this.uploadProgress = 0;
    const t = setInterval(() => {
      this.uploadProgress += Math.random() * 15;
      if (this.uploadProgress >= 100) {
        this.uploadProgress = 100;
        clearInterval(t);
        setTimeout(() => { this.isUploading = false; this.uploadProgress = 0; }, 800);
      }
    }, 120);
  }
}
