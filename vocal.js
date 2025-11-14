/**
 * =====================================================
 * VOCAL.JS - Gestion de la lecture vocale
 * =====================================================
 * 
 * Ce fichier gère :
 * - La synthèse vocale (lecture des cotes)
 * - La reconnaissance vocale (commandes : suivant, répète, avant, stop)
 * 
 * APIs utilisées :
 * - Web Speech Synthesis API
 * - Web Speech Recognition API
 */

const Vocal = {
    // État de la lecture en cours
    lectureEnCours: null, // 'rampant1' ou 'rampant2' ou null
    indexCote: 0,
    tracage: [],
    recognition: null,
    rampantActuel: '',

    /**
     * Vérifie la disponibilité de l'API vocale
     */
    verifierDisponibilite() {
        if (!('speechSynthesis' in window)) {
            console.warn('⚠️ Synthèse vocale non supportée');
            return false;
        }
        return true;
    },

    /**
     * Lit une cote spécifique
     */
    lireCote(cote, rampant, index, total) {
        if (!this.verifierDisponibilite()) return;

        window.speechSynthesis.cancel(); // Arrête toute lecture en cours

        const texte = `${rampant}, cote ${cote} centimètres. Cote ${index} sur ${total}`;
        const utterance = new SpeechSynthesisUtterance(texte);
        utterance.lang = 'fr-FR';
        utterance.rate = 0.9; // Vitesse légèrement ralentie pour clarté
        utterance.pitch = 1.0;

        console.log('🔊 Lecture:', texte);

        window.speechSynthesis.speak(utterance);
    },

    /**
     * Démarre la lecture d'un rampant
     */
    demarrerLecture(rampant, tracage, callback) {
        if (!this.verifierDisponibilite()) {
            alert('La synthèse vocale n\'est pas supportée par votre navigateur');
            return;
        }

        this.lectureEnCours = rampant;
        this.indexCote = 0;
        this.tracage = tracage;
        this.rampantActuel = rampant;

        console.log('▶️ Démarrage lecture:', rampant, 'Cotes:', tracage.length);

        // Lire la première cote
        this.lireCote(
            tracage[0],
            rampant === 'rampant1' ? 'Rampant 1' : 'Rampant 2',
            1,
            tracage.length
        );

        // Démarrer la reconnaissance vocale
        this.demarrerReconnaissance(callback);
    },

    /**
     * Arrête la lecture
     */
    arreterLecture() {
        console.log('⏹️ Arrêt lecture');

        window.speechSynthesis.cancel();
        
        if (this.recognition) {
            this.recognition.stop();
            this.recognition = null;
        }

        this.lectureEnCours = null;
        this.indexCote = 0;
        this.tracage = [];
    },

    /**
     * Cote suivante
     */
    coteSuivante(callback) {
        if (this.indexCote < this.tracage.length - 1) {
            this.indexCote++;
            console.log('➡️ Cote suivante:', this.indexCote);
            
            this.lireCote(
                this.tracage[this.indexCote],
                this.rampantActuel === 'rampant1' ? 'Rampant 1' : 'Rampant 2',
                this.indexCote + 1,
                this.tracage.length
            );

            if (callback) callback();
        } else {
            console.log('✅ Fin de la lecture');
            // Lecture terminée
            const utterance = new SpeechSynthesisUtterance('Fin de la lecture');
            utterance.lang = 'fr-FR';
            window.speechSynthesis.speak(utterance);
        }
    },

    /**
     * Répéter la cote actuelle
     */
    repeterCote(callback) {
        console.log('🔁 Répétition cote:', this.indexCote);
        
        this.lireCote(
            this.tracage[this.indexCote],
            this.rampantActuel === 'rampant1' ? 'Rampant 1' : 'Rampant 2',
            this.indexCote + 1,
            this.tracage.length
        );

        if (callback) callback();
    },

    /**
     * Cote précédente
     */
    cotePrecedente(callback) {
        if (this.indexCote > 0) {
            this.indexCote--;
            console.log('⬅️ Cote précédente:', this.indexCote);
            
            this.lireCote(
                this.tracage[this.indexCote],
                this.rampantActuel === 'rampant1' ? 'Rampant 1' : 'Rampant 2',
                this.indexCote + 1,
                this.tracage.length
            );

            if (callback) callback();
        }
    },

    /**
     * Démarre la reconnaissance vocale pour les commandes
     */
    demarrerReconnaissance(callback) {
        // Vérifier la disponibilité
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.warn('⚠️ Reconnaissance vocale non supportée');
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'fr-FR';
        this.recognition.continuous = true;
        this.recognition.interimResults = false;

        this.recognition.onresult = (event) => {
            const dernierResultat = event.results[event.results.length - 1];
            const commande = dernierResultat[0].transcript.toLowerCase().trim();
            
            console.log('🎤 Commande reconnue:', commande);

            // Traitement des commandes
            if (commande.includes('suivant')) {
                this.coteSuivante(callback);
            } else if (commande.includes('répète') || commande.includes('répéter')) {
                this.repeterCote(callback);
            } else if (commande.includes('avant') || commande.includes('précédent') || commande.includes('precedent')) {
                this.cotePrecedente(callback);
            } else if (commande.includes('stop') || commande.includes('arrêt') || commande.includes('arret')) {
                this.arreterLecture();
                if (callback) callback();
            }
        };

        this.recognition.onerror = (event) => {
            console.error('❌ Erreur reconnaissance vocale:', event.error);
            // Ne pas redemander l'autorisation si elle a été refusée
            if (event.error === 'not-allowed') {
                console.warn('⚠️ Autorisation micro refusée');
                this.lectureEnCours = null;
            }
        };

        this.recognition.onend = () => {
            // Redémarrer automatiquement si la lecture est toujours en cours
            if (this.lectureEnCours) {
                console.log('🔄 Redémarrage reconnaissance vocale');
                setTimeout(() => {
                    if (this.lectureEnCours && this.recognition) {
                        try {
                            this.recognition.start();
                        } catch (e) {
                            // Si erreur (déjà démarré), ignorer
                            if (e.name !== 'InvalidStateError') {
                                console.error('❌ Erreur redémarrage:', e);
                            }
                        }
                    }
                }, 100);
            }
        };

        try {
            this.recognition.start();
            console.log('🎤 Reconnaissance vocale démarrée');
        } catch (e) {
            console.error('❌ Erreur démarrage reconnaissance:', e);
            // Si le micro est déjà en cours d'utilisation, ignorer
            if (e.name !== 'InvalidStateError') {
                alert('Erreur : Impossible de démarrer la reconnaissance vocale. Vérifiez les permissions du micro.');
            }
        }
    },

    /**
     * Obtient l'état actuel de la lecture
     */
    obtenirEtat() {
        return {
            enCours: this.lectureEnCours !== null,
            rampant: this.lectureEnCours,
            indexCote: this.indexCote,
            totalCotes: this.tracage.length,
            progression: this.tracage.length > 0 ? 
                `${this.indexCote + 1}/${this.tracage.length}` : 
                '0/0'
        };
    }
};
