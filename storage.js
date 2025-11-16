/**
 * ========================================
 * STORAGE.JS - Gestion du localStorage
 * ========================================
 * 
 * Ce fichier centralise toutes les opérations de sauvegarde
 * et de chargement des données dans localStorage.
 * 
 * DONNÉES STOCKÉES :
 * - modeSombre : boolean
 * - mes-tuiles : array d'objets tuiles
 * - mes-chantiers : array d'objets chantiers
 */

const Storage = {
    /**
     * Sauvegarde le mode sombre
     */
    saveModeSombre(mode) {
        localStorage.setItem('modeSombre', JSON.stringify(mode));
    },

    /**
     * Charge le mode sombre
     */
    loadModeSombre() {
        const saved = localStorage.getItem('modeSombre');
        return saved ? JSON.parse(saved) : false;
    },

    /**
     * Sauvegarde les tuiles personnelles
     */
    saveTuiles(tuiles) {
        localStorage.setItem('mes-tuiles', JSON.stringify(tuiles));
    },

    /**
     * Charge les tuiles personnelles
     */
    loadTuiles() {
        const saved = localStorage.getItem('mes-tuiles');
        return saved ? JSON.parse(saved) : [];
    },

    /**
     * Sauvegarde les chantiers
     */
    saveChantiers(chantiers) {
        localStorage.setItem('mes-chantiers', JSON.stringify(chantiers));
    },

    /**
     * Charge les chantiers
     */
    loadChantiers() {
        const saved = localStorage.getItem('mes-chantiers');
        return saved ? JSON.parse(saved) : [];
    },

    /**
     * Sauvegarde les chantiers pureau dicté
     */
    saveChantiersPureauxDicte(chantiers) {
        localStorage.setItem('mes-chantiers-pureau-dicte', JSON.stringify(chantiers));
    },

    /**
     * Charge les chantiers pureau dicté
     */
    loadChantiersPureauxDicte() {
        const saved = localStorage.getItem('mes-chantiers-pureau-dicte');
        return saved ? JSON.parse(saved) : [];
    },

    /**
     * Efface toutes les données (pour debug)
     */
    clearAll() {
        localStorage.removeItem('modeSombre');
        localStorage.removeItem('mes-tuiles');
        localStorage.removeItem('mes-chantiers');
        localStorage.removeItem('mes-chantiers-pureau-dicte');
    }
};
