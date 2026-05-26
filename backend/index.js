const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
const verifyToken = require('./authMiddleware');

const app = express();
app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());

app.post('/api/auth/register', async (req, res) => {
    const { nom, prenom, email, mot_de_passe, role } = req.body;
    
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(mot_de_passe, salt);

        await db.query(
            'INSERT INTO UTILISATEUR (nom, prenom, email, mot_de_passe, role) VALUES (?, ?, ?, ?, ?)',
            [nom, prenom, email, hashedPassword, role]
        );

        res.status(201).json({ message: "Utilisateur créé avec succès !" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, mot_de_passe } = req.body;

    try {
        const [users] = await db.query('SELECT * FROM UTILISATEUR WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ message: "Utilisateur non trouvé !" });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
        if (!isMatch) {
            return res.status(400).json({ message: "Mot de passe incorrect !" });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            "Secret_MediSync",
            { expiresIn: '24h' }
        );

        res.status(200).json({
            token: token,
            role: user.role,
            message: "Connexion réussie !"
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/planning', verifyToken, (req, res) => {
    res.status(200).json({
        message: "Bienvenue dans l'espace Planning !",
        utilisateur_info: req.user
    });
});

app.post('/api/rendez-vous', verifyToken, async (req, res) => {
    const { patient_id, medecin_id, salle_id, date_heure, duree_min, motif, statut, pour_tiers } = req.body;

    try {
        const [conflits] = await db.query(
            'SELECT medecin_id, salle_id FROM rendez_vous WHERE date_heure = ? AND (medecin_id = ? OR salle_id = ?)',
            [date_heure, medecin_id, salle_id]
        );

        if (conflits.length > 0) {
            let medecinOccupe = false;
            let salleOccupee = false;

            for (let rdv of conflits) {
                if (rdv.medecin_id === medecin_id) medecinOccupe = true;
                if (rdv.salle_id === salle_id) salleOccupee = true;
            }

            if (medecinOccupe && salleOccupee) {
                return res.status(409).json({ 
                    message: "Le médecin et la salle sont tous les deux occupés à cette heure-là !" 
                });
            } else if (medecinOccupe) {
                return res.status(409).json({ 
                    message: "Le médecin est déjà occupé à cette heure-là !" 
                });
            } else if (salleOccupee) {
                return res.status(409).json({ 
                    message: "La salle est déjà occupée à cette heure-là !" 
                });
            }
        }

        await db.query(
            'INSERT INTO rendez_vous (patient_id, medecin_id, salle_id, date_heure, duree_min, motif, statut, pour_tiers) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [patient_id, medecin_id, salle_id, date_heure, duree_min, motif, statut, pour_tiers]
        );
        res.status(201).json({ message: "Rendez-vous ajouté avec succès !" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/rendez-vous', verifyToken, async (req, res) => {
    try {
        const [rendezVous] = await db.query('SELECT * FROM rendez_vous');
        res.status(200).json(rendezVous);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/rendez-vous/:id', verifyToken, async (req, res) => {
    const rdvId = req.params.id;
    const { date_heure, duree_min, motif, statut } = req.body;

    try {
        await db.query(
            'UPDATE rendez_vous SET date_heure = ?, duree_min = ?, motif = ?, statut = ? WHERE id = ?',
            [date_heure, duree_min, motif, statut, rdvId]
        );
        res.status(200).json({ message: "Rendez-vous modifié avec succès !" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/rendez-vous/:id', verifyToken, async (req, res) => {
    const rdvId = req.params.id;

    try {
        await db.query('DELETE FROM rendez_vous WHERE id = ?', [rdvId]);
        res.status(200).json({ message: "Rendez-vous supprimé avec succès !" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ==========================================
// API - GESTION DES ORDONNANCES
// ==========================================

// 1. Ajouter une ordonnance (Création)
app.post('/api/ordonnances', verifyToken, async (req, res) => {
    const { consultation_id, medecin_id, patient_id, date_emission, date_expiration, instructions } = req.body;

    try {
        await db.query(
            'INSERT INTO ordonnance (consultation_id, medecin_id, patient_id, date_emission, date_expiration, instructions) VALUES (?, ?, ?, ?, ?, ?)',
            [consultation_id, medecin_id, patient_id, date_emission, date_expiration, instructions]
        );
        res.status(201).json({ message: "Ordonnance ajoutée avec succès !" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Afficher toutes les ordonnances (Lecture)
app.get('/api/ordonnances', verifyToken, async (req, res) => {
    try {
        const [ordonnances] = await db.query('SELECT * FROM ordonnance');
        res.status(200).json(ordonnances);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 3. Modifier une ordonnance (Mise à jour)
app.put('/api/ordonnances/:id', verifyToken, async (req, res) => {
    const ordonnanceId = req.params.id;
    const { date_expiration, instructions } = req.body;

    try {
        await db.query(
            'UPDATE ordonnance SET date_expiration = ?, instructions = ? WHERE id = ?',
            [date_expiration, instructions, ordonnanceId]
        );
        res.status(200).json({ message: "Ordonnance modifiée avec succès !" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Supprimer une ordonnance (Suppression)
app.delete('/api/ordonnances/:id', verifyToken, async (req, res) => {
    const ordonnanceId = req.params.id;

    try {
        await db.query('DELETE FROM ordonnance WHERE id = ?', [ordonnanceId]);
        res.status(200).json({ message: "Ordonnance supprimée avec succès !" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 5. Ajouter un médicament à une ordonnance précise
app.post('/api/ordonnances/:id/medicaments', verifyToken, async (req, res) => {
    const ordonnance_id = req.params.id;
    
    const { nom_medicament, dosage, frequence, duree_jours } = req.body;

    try {
        await db.query(
            'INSERT INTO medicament_ordonnance (ordonnance_id, nom_medicament, dosage, frequence, duree_jours) VALUES (?, ?, ?, ?, ?)',
            [ordonnance_id, nom_medicament, dosage, frequence, duree_jours]
        );
        res.status(201).json({ message: "Médicament ajouté à l'ordonnance avec succès !" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.get('/api/ordonnances/:id/details', verifyToken, async (req, res) => {
    const ordonnance_id = req.params.id;

    try {
        const [ordonnances] = await db.query('SELECT * FROM ordonnance WHERE id = ?', [ordonnance_id]);
        
        if (ordonnances.length === 0) {
            return res.status(404).json({ message: "Ordonnance introuvable !" });
        }

        const [medicaments] = await db.query('SELECT * FROM medicament_ordonnance WHERE ordonnance_id = ?', [ordonnance_id]);

        res.status(200).json({
            details_ordonnance: ordonnances[0],
            liste_medicaments: medicaments
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.post('/api/consultations', verifyToken, async (req, res) => {
    const { rendez_vous_id, medecin_id, patient_id, compte_rendu, date_consultation, diagnostic } = req.body;

    try {
        await db.query(
            'INSERT INTO consultation (rendez_vous_id, medecin_id, patient_id, compte_rendu, date_consultation, diagnostic) VALUES (?, ?, ?, ?, ?, ?)',
            [rendez_vous_id, medecin_id, patient_id, compte_rendu, date_consultation, diagnostic]
        );
        res.status(201).json({ message: "Consultation ajoutée avec succès !" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/consultations', verifyToken, async (req, res) => {
    try {
        const [consultations] = await db.query('SELECT * FROM consultation');
        res.status(200).json(consultations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/consultations/:id', verifyToken, async (req, res) => {
    const consultationId = req.params.id;

    try {
        const [consultation] = await db.query('SELECT * FROM consultation WHERE id = ?', [consultationId]);
        
        if (consultation.length === 0) {
            return res.status(404).json({ message: "Consultation introuvable !" });
        }
        res.status(200).json(consultation[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/consultations/:id', verifyToken, async (req, res) => {
    const consultationId = req.params.id;
    const { compte_rendu, diagnostic } = req.body;

    try {
        await db.query(
            'UPDATE consultation SET compte_rendu = ?, diagnostic = ? WHERE id = ?',
            [compte_rendu, diagnostic, consultationId]
        );
        res.status(200).json({ message: "Consultation modifiée avec succès !" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/consultations/:id', verifyToken, async (req, res) => {
    const consultationId = req.params.id;

    try {
        await db.query('DELETE FROM consultation WHERE id = ?', [consultationId]);
        res.status(200).json({ message: "Consultation supprimée avec succès !" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.post('/api/dossiers', verifyToken, async (req, res) => {
    const { patient_id, antecedents, allergies, traitements } = req.body;
    try {
        await db.query(
            'INSERT INTO dossier_medical (patient_id, antecedents, allergies, traitements) VALUES (?, ?, ?, ?)',
            [patient_id, antecedents, allergies, traitements]
        );
        res.status(201).json({ message: "Dossier médical créé avec succès !" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/dossiers/patient/:patient_id', verifyToken, async (req, res) => {
    const patient_id = req.params.patient_id;
    try {
        const [dossier] = await db.query('SELECT * FROM dossier_medical WHERE patient_id = ?', [patient_id]);
        if (dossier.length === 0) {
            return res.status(404).json({ message: "Dossier introuvable pour ce patient !" });
        }
        res.status(200).json(dossier[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/dossiers/:id', verifyToken, async (req, res) => {
    const id = req.params.id;
    const { antecedents, allergies, traitements } = req.body;
    try {
        await db.query(
            'UPDATE dossier_medical SET antecedents = ?, allergies = ?, traitements = ? WHERE id = ?',
            [antecedents, allergies, traitements, id]
        );
        res.status(200).json({ message: "Dossier médical mis à jour avec succès !" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.post('/api/factures', verifyToken, async (req, res) => {
    const { rendez_vous_id, patient_id, secretaire_id, montant_total, montant_paye, statut_paiement, date_emission } = req.body;
    try {
        await db.query(
            'INSERT INTO facture (rendez_vous_id, patient_id, secretaire_id, montant_total, montant_paye, statut_paiement, date_emission) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [rendez_vous_id, patient_id, secretaire_id, montant_total, montant_paye, statut_paiement, date_emission]
        );
        res.status(201).json({ message: "Facture créée avec succès !" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/factures', verifyToken, async (req, res) => {
    try {
        const [factures] = await db.query('SELECT * FROM facture');
        res.status(200).json(factures);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/factures/:id', verifyToken, async (req, res) => {
    const factureId = req.params.id;
    try {
        const [facture] = await db.query('SELECT * FROM facture WHERE id = ?', [factureId]);
        if (facture.length === 0) {
            return res.status(404).json({ message: "Facture introuvable !" });
        }
        res.status(200).json(facture[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/factures/:id', verifyToken, async (req, res) => {
    const factureId = req.params.id;
    const { montant_paye, statut_paiement } = req.body;
    try {
        await db.query(
            'UPDATE facture SET montant_paye = ?, statut_paiement = ? WHERE id = ?',
            [montant_paye, statut_paiement, factureId]
        );
        res.status(200).json({ message: "Facture mise à jour avec succès !" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/factures/:id', verifyToken, async (req, res) => {
    const factureId = req.params.id;
    try {
        await db.query('DELETE FROM facture WHERE id = ?', [factureId]);
        res.status(200).json({ message: "Facture supprimée avec succès !" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.post('/api/avis', verifyToken, async (req, res) => {
    const { patient_id, medecin_id, rendez_vous_id, note, commentaire } = req.body;
    try {
        await db.query(
            'INSERT INTO avis (patient_id, medecin_id, rendez_vous_id, note, commentaire) VALUES (?, ?, ?, ?, ?)',
            [patient_id, medecin_id, rendez_vous_id, note, commentaire]
        );
        res.status(201).json({ message: "Avis ajouté avec succès !" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/avis/medecin/:id', verifyToken, async (req, res) => {
    try {
        const [avis] = await db.query('SELECT * FROM avis WHERE medecin_id = ?', [req.params.id]);
        res.status(200).json(avis);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/audit', verifyToken, async (req, res) => {
    const { utilisateur_id, action, ressource, ressource_id, ip_address } = req.body;
    try {
        await db.query(
            'INSERT INTO audit_log (utilisateur_id, action, ressource, ressource_id, ip_address) VALUES (?, ?, ?, ?, ?)',
            [utilisateur_id, action, ressource, ressource_id, ip_address]
        );
        res.status(201).json({ message: "Action loggée." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/audit', verifyToken, async (req, res) => {
    try {
        const [logs] = await db.query('SELECT * FROM audit_log ORDER BY created_at DESC');
        res.status(200).json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/notifications', verifyToken, async (req, res) => {
    const { utilisateur_id, rendez_vous_id, type, message } = req.body;
    try {
        await db.query(
            'INSERT INTO notification (utilisateur_id, rendez_vous_id, type, message, date_envoi) VALUES (?, ?, ?, ?, NOW())',
            [utilisateur_id, rendez_vous_id, type, message]
        );
        res.status(201).json({ message: "Notification créée !" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/notifications/utilisateur/:id', verifyToken, async (req, res) => {
    try {
        const [notifs] = await db.query('SELECT * FROM notification WHERE utilisateur_id = ? ORDER BY date_envoi DESC', [req.params.id]);
        res.status(200).json(notifs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/disponibilites', verifyToken, async (req, res) => {
    const { medecin_id, jour_semaine, heure_debut, heure_fin, duree_creneau } = req.body;
    try {
        await db.query(
            'INSERT INTO disponibilite (medecin_id, jour_semaine, heure_debut, heure_fin, duree_creneau) VALUES (?, ?, ?, ?, ?)',
            [medecin_id, jour_semaine, heure_debut, heure_fin, duree_creneau]
        );
        res.status(201).json({ message: "Disponibilité ajoutée !" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/disponibilites/medecin/:id', verifyToken, async (req, res) => {
    try {
        const [dispos] = await db.query('SELECT * FROM disponibilite WHERE medecin_id = ?', [req.params.id]);
        res.status(200).json(dispos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/actes', verifyToken, async (req, res) => {
    const { facture_id, libelle, tarif, quantite, code_nomenclature } = req.body;
    try {
        await db.query(
            'INSERT INTO acte_medical (facture_id, libelle, tarif, quantite, code_nomenclature) VALUES (?, ?, ?, ?, ?)',
            [facture_id, libelle, tarif, quantite, code_nomenclature]
        );
        res.status(201).json({ message: "Acte médical ajouté à la facture !" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/documents', verifyToken, async (req, res) => {
    const { dossier_id, consultation_id, nom_fichier, chemin, format, taille_octets } = req.body;
    try {
        await db.query(
            'INSERT INTO document_medical (dossier_id, consultation_id, nom_fichier, chemin, format, taille_octets) VALUES (?, ?, ?, ?, ?, ?)',
            [dossier_id, consultation_id, nom_fichier, chemin, format, taille_octets]
        );
        res.status(201).json({ message: "Document médical enregistré !" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// API - GESTION DU STAFF (ADMIN)
// ==========================================

app.get('/api/admin/staff', verifyToken, async (req, res) => {
    try {
        const [staff] = await db.query(
            "SELECT id, nom, prenom, email, role, created_at FROM utilisateur WHERE role IN ('medecin','secretaire','DOCTOR','SECRETARY')"
        );
        res.status(200).json({ data: staff });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/staff', verifyToken, async (req, res) => {
    const { nom, prenom, email, mot_de_passe, role } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(mot_de_passe || 'Doctor123!', salt);
        await db.query(
            'INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, role) VALUES (?, ?, ?, ?, ?)',
            [nom, prenom, email, hashedPassword, role]
        );
        res.status(201).json({ message: "Membre du personnel ajouté !" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/staff/:id', verifyToken, async (req, res) => {
    try {
        await db.query('DELETE FROM utilisateur WHERE id = ?', [req.params.id]);
        res.status(200).json({ message: "Membre supprimé !" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = 3000; 
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});