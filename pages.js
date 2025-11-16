/**
 * =====================================================
 * PAGES.JS - Pages complexes de l'application
 * =====================================================
 * 
 * Ce fichier contient les fonctions de rendu pour :
 * - Page Chantiers sauvegardés
 * - Page Mes Tuiles
 * - Page Ajouter/Modifier une tuile
 * - Page Calculateur de pureau (interface uniquement)
 */

// ========================================
// RENDU PAGE CHANTIERS SAUVEGARDÉS
// ========================================
function renderPageChantiers() {
    if (AppState.mesChantiers.length === 0) {
        return `
            <div class="container">
                <button class="btn-back" onclick="naviguerVers('menu-calculateur', 'calculateur')">
                    ${icon('arrow-left')}
                    Retour au calculateur
                </button>

                <h2 class="${getTextClass()}">Historique - Chantiers sauvegardés</h2>

                <div class="${getThemeClass('card')} text-center">
                    ${icon('save', 'icon-xl ' + getMutedClass())}
                    <p class="${getTextClass()} mb-2">Aucun chantier sauvegardé</p>
                </div>
            </div>
        `;
    }

    return `
        <div class="container">
            <button class="btn-back" onclick="naviguerVers('menu-calculateur', 'calculateur')">
                ${icon('arrow-left')}
                Retour au calculateur
            </button>

            <h2 class="${getTextClass()}">Historique - Chantiers sauvegardés</h2>

            <div class="space-y-4">
                ${AppState.mesChantiers.map(chantier => `
                    <div class="${getThemeClass('card')}">
                        <div class="flex flex-between mb-3">
                            <div>
                                <h3 class="${getTextClass()}">${chantier.nomChantier}</h3>
                                <p class="${getMutedClass()} text-sm">
                                    Tuile: ${chantier.tuile?.nom || 'Personnalisé'} - ${chantier.date}
                                </p>
                            </div>
                            <button class="btn btn-danger" onclick="supprimerChantier(${chantier.id})">
                                ${icon('trash')}
                            </button>
                        </div>

                        <div class="${getThemeClass('result-section')} grid-cols-2 grid gap-4 mb-4">
                            <div>
                                <p class="${getMutedClass()} text-xs">Rampant 1</p>
                                <p class="${getTextClass()} font-bold">${chantier.rampant1} cm</p>
                            </div>
                            <div>
                                <p class="${getMutedClass()} text-xs">Rampant 2</p>
                                <p class="${getTextClass()} font-bold">${chantier.rampant2} cm</p>
                            </div>
                        </div>

                        <button class="btn btn-primary btn-full" onclick='reprendreChantier(${JSON.stringify(chantier).replace(/'/g, "&apos;")})'>
                            Reprendre ce chantier
                        </button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// ========================================
// RENDU PAGE MES TUILES
// ========================================
function renderPageMesTuiles() {
    const typesLabels = {
        'plate': 'Plate',
        'faible-galbe': 'Faible galbe',
        'grand-galbe': 'Grand galbe'
    };

    if (AppState.mesTuiles.length === 0) {
        return `
            <div class="container">
                <button class="btn-back" onclick="retourMenuCalculateur()">
                    ${icon('arrow-left')}
                    Retour au calculateur
                </button>

                <h2 class="${getTextClass()}">Mes tuiles personnalisées</h2>

                <div class="${getThemeClass('card')} text-center">
                    ${icon('file', 'icon-xl ' + getMutedClass())}
                    <p class="${getTextClass()} mb-2">Aucune tuile enregistrée</p>
                    <button class="btn btn-primary" onclick="naviguerVers('menu-calculateur', 'ajouter-tuile')">
                        ${icon('plus')} Ajouter une tuile
                    </button>
                </div>
            </div>
        `;
    }

    return `
        <div class="container">
            <button class="btn-back" onclick="retourMenuCalculateur()">
                ${icon('arrow-left')}
                Retour au calculateur
            </button>

            <h2 class="${getTextClass()}">Mes tuiles personnalisées</h2>

            <button class="btn btn-primary mb-4" onclick="naviguerVers('menu-calculateur', 'ajouter-tuile')">
                ${icon('plus')} Ajouter une tuile
            </button>

            <div class="space-y-4">
                ${AppState.mesTuiles.map(tuile => `
                    <div class="${getThemeClass('card')}">
                        <div class="flex flex-between mb-3">
                            <div>
                                <h3 class="${getTextClass()}">${tuile.nom}</h3>
                                <p class="${getMutedClass()} text-sm">${tuile.marque} - ${typesLabels[tuile.type]}</p>
                            </div>
                            <div class="flex gap-2">
                                <button class="btn btn-secondary" onclick='editerTuile(${JSON.stringify(tuile)})'>
                                    ${icon('edit')}
                                </button>
                                <button class="btn btn-danger" onclick="supprimerTuilePersonnelle(${tuile.id})">
                                    ${icon('trash')}
                                </button>
                            </div>
                        </div>

                        <div class="${getThemeClass('result-section')} grid-cols-3 grid gap-4 mb-4">
                            <div>
                                <p class="${getMutedClass()} text-xs">Pureau min</p>
                                <p class="${getTextClass()} font-bold">${tuile.pureauMin} cm</p>
                            </div>
                            <div>
                                <p class="${getMutedClass()} text-xs">Pureau max</p>
                                <p class="${getTextClass()} font-bold">${tuile.pureauMax} cm</p>
                            </div>
                            <div>
                                <p class="${getMutedClass()} text-xs">Pureau départ</p>
                                <p class="${getTextClass()} font-bold">${tuile.pureauDepart} cm</p>
                            </div>
                        </div>

                        <button class="btn btn-primary btn-full" onclick='selectionnerTuile(${JSON.stringify(tuile)})'>
                            ${icon('check')} Utiliser cette tuile
                        </button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// ========================================
// RENDU PAGE AJOUTER/MODIFIER TUILE
// ========================================
function renderPageAjouterTuile() {
    const edition = AppState.tuileEnEdition !== null;
    const tuile = edition ? AppState.tuileEnEdition : {
        nom: '',
        marque: '',
        type: 'faible-galbe',
        pureauMin: '',
        pureauMax: '',
        pureauDepart: '',
        espaceFaitage: ''
    };

    return `
        <div class="container">
            <button class="btn-back" onclick="retourMenuCalculateur(); AppState.tuileEnEdition = null;">
                ${icon('arrow-left')}
                Retour au calculateur
            </button>

            <h2 class="${getTextClass()}">${edition ? 'Modifier' : 'Ajouter'} une tuile</h2>

            <div class="${getThemeClass('card')}">
                <form id="form-tuile" onsubmit="return false;">
                    <div class="form-group">
                        <label class="${getThemeClass('form-label')}">Nom de la tuile *</label>
                        <input type="text" id="tuile-nom" class="${getThemeClass('form-input')}" value="${tuile.nom}" placeholder="Ex: Oméga 10" required>
                    </div>

                    <div class="form-group">
                        <label class="${getThemeClass('form-label')}">Marque *</label>
                        <input type="text" id="tuile-marque" class="${getThemeClass('form-input')}" value="${tuile.marque}" placeholder="Ex: Edilians" required>
                    </div>

                    <div class="form-group">
                        <label class="${getThemeClass('form-label')}">Type de tuile *</label>
                        <select id="tuile-type" class="${getThemeClass('form-select')}" required>
                            <option value="plate" ${tuile.type === 'plate' ? 'selected' : ''}>Plate</option>
                            <option value="faible-galbe" ${tuile.type === 'faible-galbe' ? 'selected' : ''}>Faible galbe</option>
                            <option value="grand-galbe" ${tuile.type === 'grand-galbe' ? 'selected' : ''}>Grand galbe</option>
                        </select>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="${getThemeClass('form-label')}">Pureau minimum (cm) *</label>
                            <input type="number" id="tuile-pureau-min" class="${getThemeClass('form-input')}" value="${tuile.pureauMin}" step="0.1" required>
                        </div>

                        <div class="form-group">
                            <label class="${getThemeClass('form-label')}">Pureau maximum (cm) *</label>
                            <input type="number" id="tuile-pureau-max" class="${getThemeClass('form-input')}" value="${tuile.pureauMax}" step="0.1" required>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="${getThemeClass('form-label')}">Pureau de départ (cm) *</label>
                            <input type="number" id="tuile-pureau-depart" class="${getThemeClass('form-input')}" value="${tuile.pureauDepart}" step="0.1" required>
                        </div>

                        <div class="form-group">
                            <label class="${getThemeClass('form-label')}">Espace faîtage (cm) *</label>
                            <input type="number" id="tuile-espace-faitage" class="${getThemeClass('form-input')}" value="${tuile.espaceFaitage}" step="0.1" required>
                        </div>
                    </div>

                    <div class="flex gap-4">
                        <button type="button" class="btn btn-primary btn-full" onclick="soumettreFormulaireTuile(${edition})">
                            ${icon(edition ? 'check' : 'plus')} ${edition ? 'Modifier' : 'Ajouter'}
                        </button>
                        ${edition ? `
                            <button type="button" class="btn btn-secondary" onclick="AppState.tuileEnEdition = null; render();">
                                ${icon('x')} Annuler
                            </button>
                        ` : ''}
                    </div>
                </form>
            </div>
        </div>
    `;
}

// ========================================
// HANDLER FORMULAIRE TUILE
// ========================================
function soumettreFormulaireTuile(edition) {
    const tuile = {
        nom: document.getElementById('tuile-nom').value.trim(),
        marque: document.getElementById('tuile-marque').value.trim(),
        type: document.getElementById('tuile-type').value,
        pureauMin: document.getElementById('tuile-pureau-min').value,
        pureauMax: document.getElementById('tuile-pureau-max').value,
        pureauDepart: document.getElementById('tuile-pureau-depart').value,
        espaceFaitage: document.getElementById('tuile-espace-faitage').value
    };

    // Validation
    if (!tuile.nom || !tuile.marque || !tuile.pureauMin || !tuile.pureauMax || !tuile.pureauDepart || !tuile.espaceFaitage) {
        alert('⚠️ Veuillez remplir tous les champs obligatoires');
        return;
    }

    if (parseFloat(tuile.pureauMin) >= parseFloat(tuile.pureauMax)) {
        alert('⚠️ Le pureau minimum doit être inférieur au pureau maximum');
        return;
    }

    if (edition && AppState.tuileEnEdition) {
        modifierTuilePersonnelle(AppState.tuileEnEdition.id, tuile);
        AppState.tuileEnEdition = null;
        alert('✅ Tuile modifiée avec succès !');
    } else {
        ajouterTuilePersonnelle(tuile);
        alert('✅ Tuile ajoutée avec succès !');
    }

    naviguerVers('menu-calculateur', 'mes-tuiles');
}
