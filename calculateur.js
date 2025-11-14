/**
 * =====================================================
 * CALCULATEUR.JS - Moteur de calcul du pureau
 * =====================================================
 * 
 * ⚠️ FICHIER INDÉPENDANT - Peut être modifié sans toucher au reste de l'application
 * 
 * Ce fichier contient TOUTE la logique de calcul du pureau.
 * Il est isolé du reste de l'application pour faciliter :
 * - Le débogage
 * - Les corrections
 * - Les modifications de l'algorithme
 * 
 * PRINCIPE DE FONCTIONNEMENT :
 * 
 * 1. MODE NORMAL : cherche un nombre de rangs COMMUN aux 2 rampants
 *    avec un pureau dans l'intervalle [min, max]
 * 
 * 2. MODE HORS PUREAU : si aucun nombre de rangs commun possible
 *    - Teste si chaque rampant peut avoir un pureau "pile-poil"
 *    - Optimise pour respecter au maximum les contraintes
 * 
 * STRUCTURE DES DONNÉES :
 * 
 * Entrée (objet params) :
 * {
 *   rampant1: float (cm),
 *   rampant2: float (cm),
 *   premierRang1: float (cm),
 *   premierRang2: float (cm),
 *   espaceFaitage1: float (cm),
 *   espaceFaitage2: float (cm),
 *   pureauMin: float (cm),
 *   pureauMax: float (cm)
 * }
 * 
 * Sortie (objet résultat) :
 * {
 *   rampant1: { ... },
 *   rampant2: { ... },
 *   nombreRangsCommun: int ou null,
 *   horsPureau: boolean
 * }
 */

const CalculateurPureau = {
    /**
     * ========================================
     * FONCTION PRINCIPALE DE CALCUL
     * ========================================
     * 
     * @param {Object} params - Paramètres de calcul
     * @returns {Object|null} - Résultat du calcul ou null si erreur
     */
    calculer(params) {
        // ÉTAPE 1 : Validation des entrées
        const validation = this.validerEntrees(params);
        if (!validation.valide) {
            return { erreur: validation.message };
        }

        const {
            rampant1,
            rampant2,
            premierRang1,
            premierRang2,
            espaceFaitage1,
            espaceFaitage2,
            pureauMin,
            pureauMax
        } = params;

        // ÉTAPE 2 : Calcul des longueurs utiles (sans premier rang ni faîtage)
        const longueurUtile1 = rampant1 - premierRang1 - espaceFaitage1;
        const longueurUtile2 = rampant2 - premierRang2 - espaceFaitage2;

        console.log('🔍 Longueurs utiles:', { longueurUtile1, longueurUtile2 });

        // ÉTAPE 3 : Calcul des bornes pour le nombre de rangs
        const rangsMin = Math.max(
            Math.ceil(longueurUtile1 / pureauMax),
            Math.ceil(longueurUtile2 / pureauMax)
        );
        const rangsMax = Math.min(
            Math.floor(longueurUtile1 / pureauMin),
            Math.floor(longueurUtile2 / pureauMin)
        );

        console.log('📊 Bornes rangs:', { rangsMin, rangsMax });

        // ÉTAPE 4 : Tentative MODE NORMAL (nombre de rangs commun)
        const solutionNormale = this.chercherSolutionNormale(
            longueurUtile1,
            longueurUtile2,
            rangsMin,
            rangsMax,
            pureauMin,
            pureauMax
        );

        if (solutionNormale) {
            console.log('✅ Solution NORMALE trouvée:', solutionNormale);
            
            // Génération des résultats pour chaque rampant
            const resultat = {
                rampant1: this.genererResultatRampant(
                    longueurUtile1,
                    premierRang1,
                    espaceFaitage1,
                    rampant1,
                    solutionNormale.pureau1,
                    solutionNormale.nombreRangs,
                    false,
                    null
                ),
                rampant2: this.genererResultatRampant(
                    longueurUtile2,
                    premierRang2,
                    espaceFaitage2,
                    rampant2,
                    solutionNormale.pureau2,
                    solutionNormale.nombreRangs,
                    false,
                    null
                ),
                nombreRangsCommun: solutionNormale.nombreRangs,
                horsPureau: false
            };

            return resultat;
        }

        // ÉTAPE 5 : MODE HORS PUREAU (pas de solution normale)
        console.log('⚠️ Passage en mode HORS PUREAU');
        
        const solutionHorsPureau = this.chercherSolutionHorsPureau(
            longueurUtile1,
            longueurUtile2,
            pureauMin,
            pureauMax
        );

        console.log('🔧 Solution HORS PUREAU:', solutionHorsPureau);

        const resultat = {
            rampant1: this.genererResultatRampant(
                longueurUtile1,
                premierRang1,
                espaceFaitage1,
                rampant1,
                solutionHorsPureau.config1.pureau,
                solutionHorsPureau.config1.nombreRangs,
                true,
                solutionHorsPureau.config1
            ),
            rampant2: this.genererResultatRampant(
                longueurUtile2,
                premierRang2,
                espaceFaitage2,
                rampant2,
                solutionHorsPureau.config2.pureau,
                solutionHorsPureau.config2.nombreRangs,
                true,
                solutionHorsPureau.config2
            ),
            nombreRangsCommun: null,
            horsPureau: true
        };

        return resultat;
    },

    /**
     * ========================================
     * VALIDATION DES ENTRÉES
     * ========================================
     */
    validerEntrees(params) {
        const champs = [
            'rampant1', 'rampant2', 'premierRang1', 'premierRang2',
            'espaceFaitage1', 'espaceFaitage2', 'pureauMin', 'pureauMax'
        ];

        for (const champ of champs) {
            if (!params[champ] || isNaN(params[champ]) || params[champ] <= 0) {
                return {
                    valide: false,
                    message: `Le champ "${champ}" est invalide ou manquant`
                };
            }
        }

        if (params.pureauMin >= params.pureauMax) {
            return {
                valide: false,
                message: 'Le pureau minimum doit être inférieur au pureau maximum'
            };
        }

        return { valide: true };
    },

    /**
     * ========================================
     * MODE NORMAL : Cherche nombre de rangs commun
     * ========================================
     */
    chercherSolutionNormale(longueurUtile1, longueurUtile2, rangsMin, rangsMax, pureauMin, pureauMax) {
        // Parcourt tous les nombres de rangs possibles
        for (let nbRangs = rangsMin; nbRangs <= rangsMax; nbRangs++) {
            const pureau1 = longueurUtile1 / nbRangs;
            const pureau2 = longueurUtile2 / nbRangs;

            // Vérifie si les deux pureauxsont dans l'intervalle [min, max]
            if (pureau1 >= pureauMin && pureau1 <= pureauMax &&
                pureau2 >= pureauMin && pureau2 <= pureauMax) {
                return {
                    nombreRangs: nbRangs,
                    pureau1: pureau1,
                    pureau2: pureau2
                };
            }
        }

        return null; // Pas de solution normale
    },

    /**
     * ========================================
     * MODE HORS PUREAU : Optimisation séparée
     * ========================================
     */
    chercherSolutionHorsPureau(longueurUtile1, longueurUtile2, pureauMin, pureauMax) {
        // Test "pile-poil" pour chaque rampant
        const pilePoilR1 = this.trouverPilePoil(longueurUtile1, pureauMin, pureauMax);
        const pilePoilR2 = this.trouverPilePoil(longueurUtile2, pureauMin, pureauMax);

        console.log('🎯 Pile-poil R1:', pilePoilR1);
        console.log('🎯 Pile-poil R2:', pilePoilR2);

        // CAS A : Les deux ont pile-poil (mais nbRangs différents)
        if (pilePoilR1 && pilePoilR2) {
            return {
                config1: pilePoilR1,
                config2: pilePoilR2
            };
        }

        // CAS B : Un seul a pile-poil
        if (pilePoilR1 && !pilePoilR2) {
            const config2 = this.forcerPureauProche(longueurUtile2, pureauMax);
            return {
                config1: pilePoilR1,
                config2: config2
            };
        }

        if (pilePoilR2 && !pilePoilR1) {
            const config1 = this.forcerPureauProche(longueurUtile1, pureauMax);
            return {
                config1: config1,
                config2: pilePoilR2
            };
        }

        // CAS C : Aucun n'a pile-poil
        // On optimise chaque rampant indépendamment
        const config1 = this.forcerPureauProche(longueurUtile1, pureauMax);
        const config2 = this.forcerPureauProche(longueurUtile2, pureauMax);

        return {
            config1: config1,
            config2: config2
        };
    },

    /**
     * ========================================
     * Trouve un pureau "pile-poil" (dernier rang = 0)
     * ========================================
     */
    trouverPilePoil(longueurUtile, pureauMin, pureauMax) {
        // Teste tous les nombres de rangs possibles
        const rangsMinPossible = Math.ceil(longueurUtile / pureauMax);
        const rangsMaxPossible = Math.floor(longueurUtile / pureauMin);

        for (let nbRangs = rangsMinPossible; nbRangs <= rangsMaxPossible; nbRangs++) {
            const pureau = longueurUtile / nbRangs;

            // Vérifie si le pureau tombe pile-poil dans l'intervalle
            if (pureau >= pureauMin && pureau <= pureauMax) {
                // C'est pile-poil !
                return {
                    nombreRangs: nbRangs,
                    pureau: pureau,
                    pilePoil: true,
                    dernierRang: 0
                };
            }
        }

        return null; // Pas de pile-poil possible
    },

    /**
     * ========================================
     * Force un pureau proche du maximum
     * ========================================
     */
    forcerPureauProche(longueurUtile, pureauMax) {
        // Utilise pureauMax - 5% comme cible
        const pureauCible = pureauMax * 0.95;
        
        const nbRangsComplets = Math.floor(longueurUtile / pureauCible);
        const longueurCouverte = nbRangsComplets * pureauCible;
        const dernierRang = longueurUtile - longueurCouverte;

        return {
            nombreRangs: dernierRang > 0 ? nbRangsComplets + 1 : nbRangsComplets,
            pureau: pureauCible,
            pilePoil: false,
            nbRangsComplets: nbRangsComplets,
            dernierRang: dernierRang > 0 ? dernierRang : 0
        };
    },

    /**
     * ========================================
     * GÉNÉRATION DU RÉSULTAT POUR UN RAMPANT
     * ========================================
     */
    genererResultatRampant(longueurUtile, premierRang, espaceFaitage, rampantTotal, pureau, nombreRangs, horsPureau, config) {
        const resultat = {
            nombreRangs: nombreRangs,
            pureauCalcule: pureau.toFixed(2),
            detailRangs: null,
            rangsSupplementaires: null,
            coteRestante: null,
            tracage: []
        };

        // MODE HORS PUREAU : Détails des rangs
        if (horsPureau && config) {
            if (config.pilePoil) {
                // Pile-poil : tous les rangs ont le même pureau
                resultat.detailRangs = {
                    premierRang: premierRang,
                    rangsComplets: nombreRangs,
                    pureauComplet: pureau.toFixed(2),
                    dernierRang: null
                };
            } else {
                // Pas pile-poil : détail avec dernier rang différent
                resultat.detailRangs = {
                    premierRang: premierRang,
                    rangsComplets: config.nbRangsComplets,
                    pureauComplet: pureau.toFixed(2),
                    dernierRang: config.dernierRang > 0 ? config.dernierRang.toFixed(2) : null
                };
            }
        }

        // MODE NORMAL : Rangs supplémentaires possibles
        if (!horsPureau) {
            const longueurAvecRangs = premierRang + (pureau * nombreRangs);
            const coteRestante = rampantTotal - longueurAvecRangs;
            
            if (coteRestante >= pureau) {
                const rangsSupp = Math.floor(coteRestante / pureau);
                resultat.rangsSupplementaires = rangsSupp;
                resultat.coteRestante = (coteRestante - (rangsSupp * pureau)).toFixed(2);
            }
        }

        // GÉNÉRATION DU TRAÇAGE (cotes cumulées)
        resultat.tracage = this.genererTracage(premierRang, pureau, nombreRangs, espaceFaitage, rampantTotal, horsPureau, config);

        return resultat;
    },

    /**
     * ========================================
     * GÉNÉRATION DU TRAÇAGE
     * ========================================
     */
    genererTracage(premierRang, pureau, nombreRangs, espaceFaitage, rampantTotal, horsPureau, config) {
        const tracage = [];
        const limite = rampantTotal - espaceFaitage;

        // Première cote : premier rang
        tracage.push(premierRang.toFixed(2));

        if (horsPureau && config && !config.pilePoil && config.dernierRang > 0) {
            // MODE HORS PUREAU avec dernier rang différent
            
            // Rangs complets
            for (let i = 1; i <= config.nbRangsComplets; i++) {
                const cote = premierRang + (pureau * i);
                if (cote <= limite) {
                    tracage.push(cote.toFixed(2));
                }
            }

            // Dernier rang (différent)
            const coteDernierRang = premierRang + (pureau * config.nbRangsComplets) + config.dernierRang;
            if (coteDernierRang <= limite) {
                tracage.push(coteDernierRang.toFixed(2));
            }
        } else {
            // MODE NORMAL ou PILE-POIL : tous les rangs identiques
            for (let i = 1; i <= nombreRangs; i++) {
                const cote = premierRang + (pureau * i);
                if (cote <= limite) {
                    tracage.push(cote.toFixed(2));
                }
            }
        }

        return tracage;
    }
};
