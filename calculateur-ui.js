/**
 * =====================================================
 * CALCULATEUR-UI.JS - Interface du calculateur
 * =====================================================
 * 
 * Ce fichier contient :
 * - Le rendu de l'interface du calculateur
 * - L'affichage des résultats
 * - L'intégration avec le module vocal
 */

// Variable globale pour stocker le dernier résultat
let dernierResultat = null;

// ========================================
// RENDU PAGE CALCULATEUR PUREAU
// ========================================
function renderCalculateurPureau() {
    const chantierRepris = AppState.chantierRepris;
    const tuile = AppState.tuileSelectionnee;

    // Valeurs par défaut ou reprises
    const valeurs = chantierRepris || {
        nomChantier: '',
        rampant1: '',
        rampant2: '',
        premierRang1: tuile?.pureauDepart || '',
        premierRang2: tuile?.pureauDepart || '',
        espaceFaitage1: tuile?.espaceFaitage || '',
        espaceFaitage2: tuile?.espaceFaitage || '',
        pureauMin: tuile?.pureauMin || '',
        pureauMax: tuile?.pureauMax || ''
    };

    // Réinitialiser le chantier repris après utilisation
    if (chantierRepris) {
        AppState.chantierRepris = null;
    }

    // Préparer la liste combinée de tuiles
    const toutesLesTuiles = [
        ...AppState.mesTuiles.map(t => ({...t, source: 'Mes tuiles'})),
        ...TUILES_CATALOGUE.map(t => ({...t, source: 'Catalogue'}))
    ];

    return `
        <div class="container">
            <button class="btn-back" onclick="retourMenuCalculateur()">
                ${icon('arrow-left')}
                Retour au calculateur
            </button>

            <div class="flex flex-between mb-4">
                <h2 class="${getTextClass()}">Calculateur de pureau</h2>
                <button class="btn btn-secondary" onclick="naviguerVers('chantiers')">
                    ${icon('save')} Historique
                </button>
            </div>

            <!-- Barre de recherche de tuile -->
            ${toutesLesTuiles.length > 0 ? `
                <div class="${getThemeClass('card')} mb-4">
                    <div class="form-group">
                        <label class="${getThemeClass('form-label')}">🔧 Rechercher une tuile pré-enregistrée</label>
                        <div class="search-tuile-container">
                            <input 
                                type="text" 
                                id="search-tuile" 
                                class="${getThemeClass('search-tuile-input')}" 
                                placeholder="Tapez un nom de tuile, marque ou modèle..."
                                autocomplete="off"
                                oninput="rechercherTuile(this.value)"
                                onfocus="rechercherTuile(this.value)"
                            >
                            <span class="search-icon">${icon('file')}</span>
                            <div id="tuiles-suggestions" class="tuiles-suggestions hidden"></div>
                        </div>
                    </div>
                    ${tuile ? `
                        <div class="alert alert-success">
                            ✓ Tuile sélectionnée : <strong>${tuile.nom}</strong> (${tuile.marque})
                            <button class="btn btn-secondary" style="margin-left: 1rem; padding: 0.25rem 0.75rem;" onclick="deselectionnerTuile()">
                                ${icon('x')} Désélectionner
                            </button>
                        </div>
                    ` : ''}
                </div>
            ` : `
                <div class="${getThemeClass('info-block')} mb-4">
                    <p class="${getTextClass()}">
                        💡 Aucune tuile enregistrée. Ajoutez des tuiles dans vos paramètres ou modifiez le fichier Excel pour avoir des suggestions.
                    </p>
                </div>
            `}

            <div class="${getThemeClass('card')}">
                <form id="form-calculateur" onsubmit="return false;">
                    <div class="form-group">
                        <label class="${getThemeClass('form-label')}">Nom du chantier</label>
                        <input type="text" id="nom-chantier" class="${getThemeClass('form-input')}" value="${valeurs.nomChantier}" placeholder="Ex: Maison Dupont">
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="${getThemeClass('form-label')}">Rampant 1 (cm) *</label>
                            <input type="number" id="rampant-1" class="${getThemeClass('form-input')}" value="${valeurs.rampant1}" step="0.1" required>
                        </div>

                        <div class="form-group">
                            <label class="${getThemeClass('form-label')}">Rampant 2 (cm) *</label>
                            <input type="number" id="rampant-2" class="${getThemeClass('form-input')}" value="${valeurs.rampant2}" step="0.1" required>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="${getThemeClass('form-label')}">Premier rang R1 (cm) *</label>
                            <input type="number" id="premier-rang-1" class="${getThemeClass('form-input')}" value="${valeurs.premierRang1}" step="0.1" required>
                        </div>

                        <div class="form-group">
                            <label class="${getThemeClass('form-label')}">Premier rang R2 (cm) *</label>
                            <input type="number" id="premier-rang-2" class="${getThemeClass('form-input')}" value="${valeurs.premierRang2}" step="0.1" required>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="${getThemeClass('form-label')}">Espace faîtage R1 (cm) *</label>
                            <input type="number" id="espace-faitage-1" class="${getThemeClass('form-input')}" value="${valeurs.espaceFaitage1}" step="0.1" required>
                        </div>

                        <div class="form-group">
                            <label class="${getThemeClass('form-label')}">Espace faîtage R2 (cm) *</label>
                            <input type="number" id="espace-faitage-2" class="${getThemeClass('form-input')}" value="${valeurs.espaceFaitage2}" step="0.1" required>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="${getThemeClass('form-label')}">Pureau minimum (cm) *</label>
                            <input type="number" id="pureau-min" class="${getThemeClass('form-input')}" value="${valeurs.pureauMin}" step="0.1" required>
                        </div>

                        <div class="form-group">
                            <label class="${getThemeClass('form-label')}">Pureau maximum (cm) *</label>
                            <input type="number" id="pureau-max" class="${getThemeClass('form-input')}" value="${valeurs.pureauMax}" step="0.1" required>
                        </div>
                    </div>

                    <button type="button" class="btn btn-primary btn-full" onclick="lancerCalcul()">
                        ${icon('calculator')} Calculer
                    </button>
                </form>
            </div>

            <div id="zone-resultats"></div>
        </div>
    `;
}

// ========================================
// LANCER LE CALCUL
// ========================================
function lancerCalcul() {
    const params = {
        rampant1: parseFloat(document.getElementById('rampant-1').value),
        rampant2: parseFloat(document.getElementById('rampant-2').value),
        premierRang1: parseFloat(document.getElementById('premier-rang-1').value),
        premierRang2: parseFloat(document.getElementById('premier-rang-2').value),
        espaceFaitage1: parseFloat(document.getElementById('espace-faitage-1').value),
        espaceFaitage2: parseFloat(document.getElementById('espace-faitage-2').value),
        pureauMin: parseFloat(document.getElementById('pureau-min').value),
        pureauMax: parseFloat(document.getElementById('pureau-max').value)
    };

    console.log('📊 Lancement du calcul avec:', params);

    // Appel du calculateur
    const resultat = CalculateurPureau.calculer(params);

    if (resultat.erreur) {
        alert('❌ Erreur : ' + resultat.erreur);
        return;
    }

    console.log('✅ Résultat du calcul:', resultat);

    // Sauvegarder le résultat
    dernierResultat = {
        params: params,
        resultat: resultat
    };

    // Afficher les résultats
    afficherResultats(resultat);
}

// ========================================
// AFFICHAGE DES RÉSULTATS
// ========================================
function afficherResultats(resultat) {
    const zone = document.getElementById('zone-resultats');
    
    let html = '';

    // Alerte si mode hors pureau
    if (resultat.horsPureau) {
        html += `
            <div class="alert alert-warning">
                ⚠️ <strong>Configuration hors pureau</strong><br>
                Les deux rampants n'ont pas pu être calculés avec le même nombre de rangs.
            </div>
        `;
    }

    // Résultats pour chaque rampant
    html += renderResultatRampant('Rampant 1', resultat.rampant1, resultat.nombreRangsCommun);
    html += renderResultatRampant('Rampant 2', resultat.rampant2, resultat.nombreRangsCommun);

    // Bouton sauvegarder
    html += `
        <div class="${getThemeClass('card')} mt-4">
            <button class="btn btn-primary btn-full" onclick="sauvegarderLeChantier()">
                ${icon('save')} Sauvegarder ce chantier
            </button>
        </div>
    `;

    zone.innerHTML = html;
}

// ========================================
// RENDU RÉSULTAT POUR UN RAMPANT
// ========================================
function renderResultatRampant(nom, resultat, nombreRangsCommun) {
    const etatVocal = Vocal.obtenirEtat();
    const enLecture = etatVocal.enCours && etatVocal.rampant === (nom === 'Rampant 1' ? 'rampant1' : 'rampant2');

    return `
        <div class="${getThemeClass('card')} mt-4">
            <h3 class="${getTextClass()} mb-4">${nom}</h3>
            <!-- Légende des commandes vocales -->
            <div class="${getThemeClass('result-section')} mb-4">
                <h4 class="${getTextClass()} mb-2">🎤 Commandes vocales</h4>
                <div class="grid-cols-2 grid gap-2">
                    <div>
                        <span class="badge badge-blue">Suivante</span>
                        <span class="${getMutedClass()} text-sm"> - Cote suivante</span>
                    </div>
                    <div>
                        <span class="badge badge-blue">Retour</span>
                        <span class="${getMutedClass()} text-sm"> - Cote précédente</span>
                    </div>
                    <div>
                        <span class="badge badge-blue">Relire</span>
                        <span class="${getMutedClass()} text-sm"> - Répéter la cote</span>
                    </div>
                    <div>
                        <span class="badge badge-blue">Stop</span>
                        <span class="${getMutedClass()} text-sm"> - Arrêter</span>
                    </div>
                </div>
            </div>


            <div class="${getThemeClass('result-section')}">
                <div class="result-grid">
                    <div class="result-item">
                        <p class="${getMutedClass()} text-xs">Nombre de rangs</p>
                        <p class="${getTextClass()} font-bold text-lg">${resultat.nombreRangs}</p>
                        ${nombreRangsCommun ? '<p class="text-green text-xs">Commun aux 2 rampants</p>' : ''}
                    </div>

                    <div class="result-item">
                        <p class="${getMutedClass()} text-xs">Pureau calculé</p>
                        <p class="${getTextClass()} font-bold text-lg">${resultat.pureauCalcule} cm</p>
                    </div>
                </div>

                ${resultat.detailRangs ? `
                    <div class="mt-4">
                        <p class="${getTextClass()} font-bold mb-2">📋 Détail des rangs :</p>
                        <ul class="${getTextClass()}">
                            <li>• 1 rang de ${resultat.detailRangs.premierRang} cm (premier rang)</li>
                            ${resultat.detailRangs.rangsComplets > 0 ? `
                                <li>• ${resultat.detailRangs.rangsComplets} rang(s) de ${resultat.detailRangs.pureauComplet} cm</li>
                            ` : ''}
                            ${resultat.detailRangs.dernierRang ? `
                                <li>• 1 rang de ${resultat.detailRangs.dernierRang} cm (dernier rang)</li>
                            ` : ''}
                        </ul>
                    </div>
                ` : ''}

                ${resultat.rangsSupplementaires ? `
                    <div class="alert alert-info mt-4">
                        💡 ${resultat.rangsSupplementaires} rang(s) supplémentaire(s) possible(s) - 
                        Cote restante: ${resultat.coteRestante} cm
                    </div>
                ` : ''}
            </div>

            <div class="mt-4">
                <div class="flex flex-between mb-2">
                    <h4 class="${getTextClass()}">📏 Traçage (cotes cumulées)</h4>
                    ${enLecture ? `
                        <button class="btn btn-danger" onclick="arreterLectureVocale()">
                            ${icon('x')} Arrêter (${etatVocal.progression})
                        </button>
                    ` : `
                        <button class="btn btn-primary" onclick="demarrerLectureVocale('${nom === 'Rampant 1' ? 'rampant1' : 'rampant2'}')">
                            ${icon('volume')} Lire
                        </button>
                    `}
                </div>

                <div class="${getThemeClass('result-section')}">
                    <ul class="tracage-list">
                        ${resultat.tracage.map((cote, index) => `
                            <li class="${getThemeClass('tracage-item')}">
                                <span class="${getTextClass()} font-bold">${index + 1}.</span>
                                <span class="${getTextClass()}">${cote} cm</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        </div>
    `;
}

// ========================================
// GESTION LECTURE VOCALE
// ========================================
function demarrerLectureVocale(rampant) {
    if (!dernierResultat) return;

    const resultatRampant = dernierResultat.resultat[rampant];
    Vocal.demarrerLecture(rampant, resultatRampant.tracage, () => {
        // Callback pour mettre à jour l'affichage
        afficherResultats(dernierResultat.resultat);
    });

    // Mettre à jour l'affichage
    afficherResultats(dernierResultat.resultat);
}

function arreterLectureVocale() {
    Vocal.arreterLecture();
    afficherResultats(dernierResultat.resultat);
}

// ========================================
// SAUVEGARDER LE CHANTIER
// ========================================
function sauvegarderLeChantier() {
    if (!dernierResultat) return;

    const nomChantier = document.getElementById('nom-chantier').value.trim() || 'Chantier sans nom';

    const chantier = {
        nomChantier: nomChantier,
        rampant1: dernierResultat.params.rampant1,
        rampant2: dernierResultat.params.rampant2,
        premierRang1: dernierResultat.params.premierRang1,
        premierRang2: dernierResultat.params.premierRang2,
        espaceFaitage1: dernierResultat.params.espaceFaitage1,
        espaceFaitage2: dernierResultat.params.espaceFaitage2,
        pureauMin: dernierResultat.params.pureauMin,
        pureauMax: dernierResultat.params.pureauMax,
        tuile: AppState.tuileSelectionnee,
        resultat: dernierResultat.resultat
    };

    sauvegarderChantier(chantier);
}

// ========================================
// RECHERCHE ET SÉLECTION DE TUILE
// ========================================

// Variable globale pour stocker les tuiles disponibles
let tuilesDisponibles = [];

/**
 * Recherche de tuiles en temps réel
 */
function rechercherTuile(query) {
    // Préparer la liste complète si vide
    if (tuilesDisponibles.length === 0) {
        tuilesDisponibles = [
            ...AppState.mesTuiles.map(t => ({...t, source: 'Mes tuiles'})),
            ...TUILES_CATALOGUE.map(t => ({...t, source: 'Catalogue'}))
        ];
    }

    const suggestionsDiv = document.getElementById('tuiles-suggestions');
    
    // Si la recherche est vide, masquer les suggestions
    if (!query || query.trim() === '') {
        suggestionsDiv.classList.add('hidden');
        return;
    }

    // Filtrer les tuiles selon la recherche
    const queryLower = query.toLowerCase().trim();
    const resultats = tuilesDisponibles.filter(tuile => {
        return (
            tuile.nom.toLowerCase().includes(queryLower) ||
            tuile.marque.toLowerCase().includes(queryLower) ||
            tuile.type.toLowerCase().includes(queryLower)
        );
    });

    // Afficher les résultats
    if (resultats.length === 0) {
        suggestionsDiv.innerHTML = `
            <div class="no-results ${AppState.modeSombre ? 'dark' : ''}">
                Aucune tuile trouvée pour "${query}"
            </div>
        `;
        suggestionsDiv.classList.remove('hidden');
    } else {
        const typesLabels = {
            'plate': 'Plate',
            'faible-galbe': 'Faible galbe',
            'grand-galbe': 'Grand galbe'
        };

        suggestionsDiv.innerHTML = resultats.map((tuile, index) => `
            <div class="tuile-suggestion-item ${AppState.modeSombre ? 'dark' : ''}" onclick="selectionnerTuileRecherche(${tuilesDisponibles.indexOf(tuile)})">
                <div class="tuile-suggestion-name ${AppState.modeSombre ? 'text-light' : 'text-dark'}">
                    ${tuile.nom}
                </div>
                <div class="tuile-suggestion-info ${AppState.modeSombre ? 'dark' : ''}">
                    ${tuile.marque} • ${typesLabels[tuile.type] || tuile.type} • ${tuile.source}
                </div>
            </div>
        `).join('');
        suggestionsDiv.classList.remove('hidden');
    }
}

/**
 * Sélectionner une tuile depuis la recherche
 */
function selectionnerTuileRecherche(index) {
    const tuile = tuilesDisponibles[index];
    if (!tuile) return;

    // Stocker la tuile sélectionnée
    AppState.tuileSelectionnee = tuile;

    // Pré-remplir les champs
    document.getElementById('premier-rang-1').value = tuile.pureauDepart || '';
    document.getElementById('premier-rang-2').value = tuile.pureauDepart || '';
    document.getElementById('espace-faitage-1').value = tuile.espaceFaitage || '';
    document.getElementById('espace-faitage-2').value = tuile.espaceFaitage || '';
    document.getElementById('pureau-min').value = tuile.pureauMin || '';
    document.getElementById('pureau-max').value = tuile.pureauMax || '';

    // Mettre à jour le champ de recherche
    document.getElementById('search-tuile').value = `${tuile.nom} (${tuile.marque})`;

    // Masquer les suggestions
    document.getElementById('tuiles-suggestions').classList.add('hidden');

    console.log('✅ Tuile chargée:', tuile.nom);

    // Recharger la page pour afficher l'alerte de confirmation
    render();
}

/**
 * Désélectionner la tuile
 */
function deselectionnerTuile() {
    AppState.tuileSelectionnee = null;
    
    // Vider les champs
    if (document.getElementById('search-tuile')) {
        document.getElementById('search-tuile').value = '';
    }
    document.getElementById('premier-rang-1').value = '';
    document.getElementById('premier-rang-2').value = '';
    document.getElementById('espace-faitage-1').value = '';
    document.getElementById('espace-faitage-2').value = '';
    document.getElementById('pureau-min').value = '';
    document.getElementById('pureau-max').value = '';

    render();
}

// Fermer les suggestions quand on clique ailleurs
document.addEventListener('click', (e) => {
    const suggestionsDiv = document.getElementById('tuiles-suggestions');
    const searchInput = document.getElementById('search-tuile');
    
    if (suggestionsDiv && searchInput && 
        !suggestionsDiv.contains(e.target) && 
        e.target !== searchInput) {
        suggestionsDiv.classList.add('hidden');
    }
});

// ========================================
// ATTACHEMENT DES EVENT LISTENERS
// ========================================
function attachEventListeners() {
    // Conversion degrés/pourcentage (si sur la page)
    const inputDegres = document.getElementById('input-degres');
    const inputPourcentage = document.getElementById('input-pourcentage');

    if (inputDegres && inputPourcentage) {
        inputDegres.addEventListener('input', () => {
            const degres = parseFloat(inputDegres.value);
            if (!isNaN(degres) && degres >= 0 && degres <= 90) {
                const pourcentage = Math.tan(degres * Math.PI / 180) * 100;
                inputPourcentage.value = pourcentage.toFixed(2);
                
                const resultat = document.getElementById('resultat-conversion');
                const texte = document.getElementById('texte-resultat-conversion');
                resultat.classList.remove('hidden');
                texte.textContent = `${degres}° = ${pourcentage.toFixed(2)}%`;
            }
        });

        inputPourcentage.addEventListener('input', () => {
            const pourcentage = parseFloat(inputPourcentage.value);
            if (!isNaN(pourcentage) && pourcentage >= 0) {
                const degres = Math.atan(pourcentage / 100) * 180 / Math.PI;
                inputDegres.value = degres.toFixed(2);
                
                const resultat = document.getElementById('resultat-conversion');
                const texte = document.getElementById('texte-resultat-conversion');
                resultat.classList.remove('hidden');
                texte.textContent = `${pourcentage}% = ${degres.toFixed(2)}°`;
            }
        });
    }
}
