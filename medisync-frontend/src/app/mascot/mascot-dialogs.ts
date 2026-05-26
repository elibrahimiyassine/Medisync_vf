export type MessageType = 'info' | 'success' | 'warning' | 'tip';

export interface MascotMessage {
  icon: string;
  text: string;
  type: MessageType;
}

export const MASCOT_DIALOGS: Record<string, any> = {

  patient: {
    welcome: { icon: 'user',     text: 'Bonjour ! Je suis Medi, votre assistant MediSync.',              type: 'info' },
    success: { icon: 'check',    text: "Parfait ! Tout s'est bien passe.",                               type: 'success' },
    hints: {
      'appointments': { icon: 'calendar',  text: 'Filtrez par specialite pour trouver votre medecin plus vite.',  type: 'tip'  },
      'booking':      { icon: 'settings',  text: 'Filtrez par specialite pour trouver votre medecin plus vite.',  type: 'tip'  },
      'dossier':      { icon: 'folder',    text: 'Cliquez sur une consultation pour voir le compte rendu.',        type: 'tip'  },
      'medical-record': { icon: 'folder',  text: 'Cliquez sur une consultation pour voir le compte rendu.',        type: 'tip'  },
      'prescriptions':  { icon: 'pill',    text: 'Telechargez vos ordonnances en PDF depuis cette page.',          type: 'tip'  },
      'feedback':       { icon: 'star',    text: 'Votre avis aide les autres patients a choisir leur medecin.',    type: 'tip'  },
      'profile':        { icon: 'user',    text: 'Mettez a jour vos coordonnees pour faciliter la prise en charge.', type: 'tip' },
      'default':        { icon: 'info',    text: 'Cliquez sur moi pour un conseil sur cette page.',                type: 'info' },
    },
    pages: {
      'dashboard':      { icon: 'home',      text: 'Voici votre tableau de bord. Vos prochains RDV sont en haut.',   type: 'info'    },
      'appointments':   { icon: 'calendar',  text: 'Cliquez sur "+ Prendre rendez-vous" pour reserver un creneau.',  type: 'info'    },
      'dossier':        { icon: 'folder',    text: 'Retrouvez tout votre historique medical ici.',                    type: 'info'    },
      'medical-record': { icon: 'folder',    text: 'Retrouvez tout votre historique medical ici.',                    type: 'info'    },
      'prescriptions':  { icon: 'pill',      text: 'Toutes vos ordonnances actives sont ici.',                        type: 'info'    },
      'feedback':       { icon: 'star',      text: 'Evaluez vos consultations terminees pour aider la communaute.',   type: 'info'    },
      'profile':        { icon: 'user',      text: 'Gardez vos informations a jour pour un meilleur suivi medical.',  type: 'info'    },
    },
  },

  doctor: {
    welcome: { icon: 'stethoscope', text: 'Bonjour Docteur. Voici votre espace de travail.',             type: 'info'    },
    success: { icon: 'check',       text: 'Enregistre avec succes.',                                     type: 'success' },
    hints: {
      'dashboard':     { icon: 'home',          text: 'Cliquez sur un RDV pour demarrer la consultation directement.',  type: 'tip'  },
      'planning':      { icon: 'grip-vertical', text: 'Gerez vos creneaux et conges depuis ce planning.',               type: 'tip'  },
      'consultation':  { icon: 'file-text',     text: 'Utilisez les modeles pre-remplis pour gagner du temps.',          type: 'tip'  },
      'patients':      { icon: 'users',         text: 'Cliquez sur un patient pour voir son dossier medical complet.',   type: 'tip'  },
      'prescriptions': { icon: 'search',        text: 'Recherchez un medicament par DCI ou nom commercial.',             type: 'tip'  },
      'profile':       { icon: 'user',          text: 'Completez votre biographie pour rassurer vos patients.',          type: 'tip'  },
      'default':       { icon: 'info',          text: 'Cliquez sur moi pour un conseil sur cette page.',                 type: 'info' },
    },
    pages: {
      'dashboard':     { icon: 'home',         text: 'Voici votre planning du jour. Bonne consultation !',               type: 'info'    },
      'planning':      { icon: 'calendar',     text: 'Gerez vos disponibilites et absences depuis cette vue.',           type: 'info'    },
      'consultation':  { icon: 'file-text',    text: 'Dossier patient ouvert. Pensez a sauvegarder le compte rendu.',    type: 'warning' },
      'patients':      { icon: 'users',        text: 'Liste de vos patients. Retournez la carte pour voir le dossier.', type: 'info'    },
      'prescriptions': { icon: 'pill',         text: 'Historique de toutes les ordonnances emises.',                     type: 'info'    },
      'profile':       { icon: 'user',         text: 'Votre profil public est visible par les patients.',                type: 'warning' },
    },
  },

  secretary: {
    welcome: { icon: 'user',  text: 'Bonjour ! Voici votre espace de gestion.',                           type: 'info'    },
    success: { icon: 'check', text: 'Action enregistree avec succes.',                                     type: 'success' },
    hints: {
      'dashboard':     { icon: 'home',         text: 'Retrouvez les RDV du jour et les actions rapides ici.',           type: 'tip'  },
      'appointments':  { icon: 'calendar',     text: 'Cliquez sur "+ Nouveau RDV" pour creer un rendez-vous.',          type: 'tip'  },
      'patients':      { icon: 'user-plus',    text: 'Cliquez sur "+ Creer un patient" pour ajouter un dossier.',       type: 'tip'  },
      'billing':       { icon: 'receipt',      text: 'Saisissez les actes realises avant de generer la facture.',       type: 'tip'  },
      'profile':       { icon: 'user',         text: 'Mettez a jour vos coordonnees professionnelles ici.',             type: 'tip'  },
      'default':       { icon: 'info',         text: 'Cliquez sur moi pour un conseil sur cette page.',                 type: 'info' },
    },
    pages: {
      'dashboard':    { icon: 'home',           text: 'Bienvenue. Consultez le planning du jour et les actions rapides.',   type: 'info'    },
      'appointments': { icon: 'calendar',       text: 'Gerez les rendez-vous, confirmez ou annulez selon les besoins.',    type: 'info'    },
      'patients':     { icon: 'user-plus',      text: 'Registre des patients. Vous pouvez creer un nouveau compte ici.',   type: 'info'    },
      'billing':      { icon: 'triangle-alert', text: "Verifiez les actes saisis avant d'envoyer la facture par e-mail.",  type: 'warning' },
      'profile':      { icon: 'user',           text: 'Mettez a jour vos informations professionnelles.',                  type: 'info'    },
    },
  },

  admin: {
    welcome: { icon: 'layout-dashboard', text: 'Bienvenue. Voici le tableau de bord administrateur.',    type: 'info'    },
    success: { icon: 'check',            text: 'Modification enregistree avec succes.',                   type: 'success' },
    hints: {
      'dashboard': { icon: 'chart-bar',      text: 'Cliquez sur un KPI pour voir le detail complet.',                   type: 'tip'  },
      'staff':     { icon: 'users',          text: 'Gerez les profils, roles et disponibilites du personnel ici.',       type: 'tip'  },
      'finance':   { icon: 'download',       text: 'Exportez les rapports financiers en CSV ou PDF depuis cette page.',  type: 'tip'  },
      'audit':     { icon: 'search',         text: "Le journal d'audit trace toutes les actions sensibles.",             type: 'tip'  },
      'settings':  { icon: 'settings',       text: 'Configurez les tarifs et les informations de la clinique.',          type: 'tip'  },
      'profile':   { icon: 'user',           text: 'Mettez a jour votre profil administrateur.',                          type: 'tip'  },
      'default':   { icon: 'info',           text: 'Cliquez sur moi pour un conseil sur cette page.',                   type: 'info' },
    },
    pages: {
      'dashboard': { icon: 'trending-up',     text: 'Verifiez le taux de no-show et les rappels automatiques.',         type: 'warning' },
      'staff':     { icon: 'users',           text: 'Gerez le personnel de la clinique : medecins et secretaires.',      type: 'info'    },
      'finance':   { icon: 'chart-bar',       text: 'Apercu financier complet. Exportez en CSV pour la comptabilite.',  type: 'info'    },
      'audit':     { icon: 'search',          text: "Toutes les actions sensibles sont tracees et horodatees.",          type: 'info'    },
      'settings':  { icon: 'settings',        text: 'Parametres globaux de la clinique. Sauvegardez apres chaque modif.', type: 'warning' },
      'profile':   { icon: 'user',            text: 'Votre profil administrateur. Acces complet a la plateforme.',       type: 'info'    },
    },
  },
};
