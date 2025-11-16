/**
 * =====================================================
 * PUREAU-DICTE.JS - Calculateur de pureau dicté
 * =====================================================
 * 
 * ⚠️ FICHIER INDÉPENDANT - Isolé du reste de l'application
 * 
 * Ce fichier contient la logique du calculateur "Pureau Dicté"
 * qui génère des cotes à partir d'un espacement initial et d'un pureau fixe.
 * 
 * PRINCIPE :
 * Première cote = Premier rang + Pureau
 * Cotes suivantes = Cote précédente + Pureau
 * 
 * EXEMPLE :
 * Premier rang: 4cm, Pureau: 35cm, Nb rangs: 3
 * → 39cm, 74cm, 109cm
 */

const CalculateurPureauxDicte = {
    /**
     * Calcule les cotes pour le pureau dicté
     * @param {Object} params - Paramètres de calcul
     * @returns {Object} - Résultat avec les cotes
     */
    calculer(params) {
        // Validation
        const validation = this.validerEntrees(params);
        if (!validation.valide) {
            return { erreur: validation.message };
        }

        const {
            nomChantier,
            premierRang,
            pureau,
            nombreRangs
        } = params;

        // Génération des cotes
        const cotes = [];
        
        for (let i = 0; i < nombreRangs; i++) {
            const cote = premierRang + (pureau * (i + 1));
            cotes.push(cote.toFixed(1));
        }

        console.log('✅ Cotes générées:', cotes);

        return {
            nomChantier,
            premierRang,
            pureau,
            nombreRangs,
            cotes,
            date: new Date().toLocaleDateString('fr-FR')
        };
    },

    /**
     * Validation des entrées
     */
    validerEntrees(params) {
        // Si pas de nom de chantier, utiliser une valeur par défaut
        if (!params.nomChantier || params.nomChantier.trim() === '') {
            params.nomChantier = 'Chantier du ' + new Date().toLocaleDateString('fr-FR');
        }

        // Validation du premier rang (peut être 0)
        if (params.premierRang === undefined || params.premierRang === null || 
            isNaN(params.premierRang) || params.premierRang < 0) {
            return {
                valide: false,
                message: 'Le premier rang doit être un nombre positif ou zéro'
            };
        }

        // Validation des autres champs (doivent être > 0)
        const champsPositifs = ['pureau', 'nombreRangs'];
        
        for (const champ of champsPositifs) {
            if (!params[champ] || isNaN(params[champ]) || params[champ] <= 0) {
                return {
                    valide: false,
                    message: `Le champ "${champ}" est invalide ou manquant`
                };
            }
        }

        if (params.nombreRangs > 100) {
            return {
                valide: false,
                message: 'Le nombre de rangs ne peut pas dépasser 100'
            };
        }

        return { valide: true };
    }
};
