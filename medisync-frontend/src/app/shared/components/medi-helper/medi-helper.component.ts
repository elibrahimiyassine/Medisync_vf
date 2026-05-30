import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MediMascotComponent, MediState } from '../medi-mascot/medi-mascot.component';

const HELP_MAP: Record<string, { text: string; state: MediState }> = {
  '/patient/dashboard':    { text: "Bienvenue ! Voici votre espace santé personnel. Tout est ici 🏥", state: 'happy' },
  '/patient/appointments': { text: "Appuyez sur le bouton + pour prendre un nouveau rendez-vous !", state: 'excited' },
  '/patient/dossier':      { text: "Votre historique médical complet. Confidentiel et sécurisé 🔒", state: 'thinking' },
  '/patient/prescriptions':{ text: "Téléchargez vos ordonnances en PDF depuis cette page.", state: 'idle' },
  '/doctor/dashboard':     { text: "Bonjour Docteur ! Voici votre planning du jour.", state: 'happy' },
  '/doctor/planning':      { text: "Cliquez sur un créneau pour le modifier ou l'annuler.", state: 'watching' },
  '/admin/dashboard':      { text: "Surveillez les indicateurs clés de votre clinique en temps réel.", state: 'thinking' },
  '/admin/audit':          { text: "Toutes les actions sensibles sont tracées ici.", state: 'watching' },
};

@Component({
  selector: 'app-medi-helper',
  standalone: true,
  imports: [CommonModule, MediMascotComponent],
  templateUrl: './medi-helper.component.html',
  styleUrls:  ['./medi-helper.component.scss']
})
export class MediHelperComponent implements OnInit {
  isOpen = false;
  currentText  = "Salut ! Je suis Medi, ton assistant. Clique sur moi pour de l'aide 👋";
  currentState: MediState = 'idle';
  hasNewTip = true;

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        const help = HELP_MAP[e.urlAfterRedirects];
        if (help) {
          this.currentText  = help.text;
          this.currentState = help.state;
          this.hasNewTip    = true;
        }
      });
  }

  toggleHelper() {
    this.isOpen    = !this.isOpen;
    this.hasNewTip = false;
  }
}
