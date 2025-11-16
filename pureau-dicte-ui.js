/**
 * =====================================================
 * PUREAU-DICTE-UI.JS - Interface du pureau dicté
 * =====================================================
 * 
 * Gère l'affichage et les interactions pour le calculateur
 * de pureau dicté.
 */

// ========================================
// RENDU PAGE PUREAU DICTÉ
// ========================================
function renderPagePureauxDicte() {
    return `
        <div class="container">
            <button class="btn-back" onclick="retourMenuOutils()">
                ${icon('arrow-left')}
                Retour aux outils
            </button>

            <div class="flex flex-between mb-4">
                <h2 class="${getTextClass()}">Pureau Dicté</h2>
                <button class="btn btn-secondary" onclick="naviguerVers('menu-outils', 'historique-pureau-dicte')">
                    ${icon('save')} Historique
                </button>
            </div>

            ${renderFormulairePureauxDicte()}
            ${AppState.resultatPureauxDicte ? renderResultatPureauxDicte() : ''}
        </div>
    `;
}

// ========================================
// FORMULAIRE
// ========================================
function renderFormulairePureauxDicte() {
    // Récupérer les valeurs du chantier repris s'il existe
    const chantier = AppState.chantierPureauxDicteRepris;
    const valeurs = chantier ? {
        nomChantier: chantier.nomChantier + ' (copie)',
        premierRang: chantier.premierRang,
        pureau: chantier.pureau,
        nombreRangs: chantier.nombreRangs
    } : {
        nomChantier: '',
        premierRang: '',
        pureau: '',
        nombreRangs: ''
    };
    
    // Réinitialiser le chantier repris après utilisation
    if (chantier) {
        AppState.chantierPureauxDicteRepris = null;
    }
    
    return `
        <div class="${getThemeClass('card')}">
            <h3 class="${getTextClass()} mb-4">Nouveau calcul</h3>
            
            <form id="form-pureau-dicte" onsubmit="return false;">
                <div class="form-group">
                    <label class="${getThemeClass('form-label')}">Nom du chantier (optionnel)</label>
                    <input type="text" id="pd-nom-chantier" class="${getThemeClass('form-input')}" 
                           placeholder="Ex: Chantier Dupont" value="${valeurs.nomChantier}">
                </div>

                <div class="form-group">
                    <label class="${getThemeClass('form-label')}">Espacement du premier rang / Épaisseur du liteau d'accroche (cm) *</label>
                    <input type="number" id="pd-premier-rang" class="${getThemeClass('form-input')}" 
                           placeholder="Ex: 4" step="0.1" min="0" required value="${valeurs.premierRang}">
                </div>

                <div class="form-group">
                    <label class="${getThemeClass('form-label')}">Pureau (cm) *</label>
                    <input type="number" id="pd-pureau" class="${getThemeClass('form-input')}" 
                           placeholder="Ex: 35" step="0.1" required value="${valeurs.pureau}">
                </div>

                <div class="form-group">
                    <label class="${getThemeClass('form-label')}">Nombre de rangs *</label>
                    <input type="number" id="pd-nombre-rangs" class="${getThemeClass('form-input')}" 
                           placeholder="Ex: 10" min="1" max="100" required value="${valeurs.nombreRangs}">
                </div>

                <button type="button" class="btn btn-primary btn-full" onclick="lancerCalculPureauxDicte()">
                    ${icon('check')} Calculer
                </button>
            </form>
        </div>
    `;
}

// ========================================
// RÉSULTATS
// ========================================
function renderResultatPureauxDicte() {
    const resultat = AppState.resultatPureauxDicte;
    
    return `
        <div class="${getThemeClass('card')} mt-6">
            <h3 class="${getTextClass()} mb-4">Résultats - ${resultat.nomChantier}</h3>

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

            <!-- Paramètres -->
            <div class="${getThemeClass('result-section')} mb-4">
                <div class="grid-cols-3 grid gap-4">
                    <div>
                        <p class="${getMutedClass()} text-xs">Premier rang</p>
                        <p class="${getTextClass()} font-bold">${resultat.premierRang} cm</p>
                    </div>
                    <div>
                        <p class="${getMutedClass()} text-xs">Pureau</p>
                        <p class="${getTextClass()} font-bold">${resultat.pureau} cm</p>
                    </div>
                    <div>
                        <p class="${getMutedClass()} text-xs">Nombre de rangs</p>
                        <p class="${getTextClass()} font-bold">${resultat.nombreRangs}</p>
                    </div>
                </div>
            </div>

            <!-- Cotes générées -->
            <div class="${getThemeClass('result-section')} mb-4">
                <h4 class="${getTextClass()} mb-3">📏 Cotes (${resultat.cotes.length} rangs)</h4>
                
                <div class="mb-4">
                    ${resultat.cotes.map((cote, index) => `
                        <span class="badge ${index === 0 ? 'badge-blue' : 'badge-gray'} mr-2 mb-2">
                            ${cote} cm
                        </span>
                    `).join('')}
                </div>

                <!-- Boutons lecture vocale -->
                <div class="flex gap-2">
                    ${Vocal.lectureEnCours === 'pureau-dicte' ? `
                        <button class="btn btn-danger" onclick="arreterLecturePureauxDicte()">
                            ${icon('x')} Arrêter la lecture
                        </button>
                    ` : `
                        <button class="btn btn-primary" onclick="demarrerLecturePureauxDicte()">
                            ${icon('volume-2')} Lire les cotes
                        </button>
                    `}
                </div>
            </div>

            <!-- Sauvegarde -->
            <button class="btn btn-primary btn-full" onclick="sauvegarderChantierPureauxDicte()">
                ${icon('save')} Sauvegarder ce chantier
            </button>
        </div>
    `;
}

// ========================================
// HISTORIQUE
// ========================================
function renderPageHistoriquePureauxDicte() {
    if (AppState.mesChantiersPureauxDicte.length === 0) {
        return `
            <div class="container">
                <button class="btn-back" onclick="naviguerVers('menu-outils', 'pureau-dicte')">
                    ${icon('arrow-left')}
                    Retour au pureau dicté
                </button>

                <h2 class="${getTextClass()}">Historique - Pureau Dicté</h2>

                <div class="${getThemeClass('card')} text-center">
                    ${icon('save', 'icon-xl ' + getMutedClass())}
                    <p class="${getTextClass()} mb-2">Aucun chantier sauvegardé</p>
                </div>
            </div>
        `;
    }

    return `
        <div class="container">
            <button class="btn-back" onclick="naviguerVers('menu-outils', 'pureau-dicte')">
                ${icon('arrow-left')}
                Retour au pureau dicté
            </button>

            <h2 class="${getTextClass()}">Historique - Pureau Dicté</h2>

            <div class="space-y-4">
                ${AppState.mesChantiersPureauxDicte.map(chantier => `
                    <div class="${getThemeClass('card')}">
                        <div class="flex flex-between mb-3">
                            <div>
                                <h3 class="${getTextClass()}">${chantier.nomChantier}</h3>
                                <p class="${getMutedClass()} text-sm">${chantier.date}</p>
                            </div>
                            <button class="btn btn-danger" onclick="supprimerChantierPureauxDicte(${chantier.id})">
                                ${icon('trash')}
                            </button>
                        </div>

                        <div class="${getThemeClass('result-section')} grid-cols-3 grid gap-4 mb-4">
                            <div>
                                <p class="${getMutedClass()} text-xs">Premier rang</p>
                                <p class="${getTextClass()} font-bold">${chantier.premierRang} cm</p>
                            </div>
                            <div>
                                <p class="${getMutedClass()} text-xs">Pureau</p>
                                <p class="${getTextClass()} font-bold">${chantier.pureau} cm</p>
                            </div>
                            <div>
                                <p class="${getMutedClass()} text-xs">Rangs</p>
                                <p class="${getTextClass()} font-bold">${chantier.nombreRangs}</p>
                            </div>
                        </div>

                        <button class="btn btn-primary btn-full" onclick='reprendreChantierPureauxDicte(${JSON.stringify(chantier).replace(/'/g, "&apos;")})'>
                            Reprendre ce chantier
                        </button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// ========================================
// ACTIONS
// ========================================

function lancerCalculPureauxDicte() {
    const params = {
        nomChantier: document.getElementById('pd-nom-chantier').value.trim(),
        premierRang: parseFloat(document.getElementById('pd-premier-rang').value),
        pureau: parseFloat(document.getElementById('pd-pureau').value),
        nombreRangs: parseInt(document.getElementById('pd-nombre-rangs').value)
    };

    console.log('🔍 Paramètres pureau dicté:', params);

    const resultat = CalculateurPureauxDicte.calculer(params);

    if (resultat.erreur) {
        alert('❌ ' + resultat.erreur);
        return;
    }

    AppState.resultatPureauxDicte = resultat;
    render();
}

function demarrerLecturePureauxDicte() {
    const cotes = AppState.resultatPureauxDicte.cotes;
    
    Vocal.demarrerLecture('pureau-dicte', cotes, () => {
        render();
    });
    
    render();
}

function arreterLecturePureauxDicte() {
    Vocal.arreterLecture();
    render();
}

function sauvegarderChantierPureauxDicte() {
    const chantier = {
        id: Date.now(),
        ...AppState.resultatPureauxDicte
    };

    AppState.mesChantiersPureauxDicte.push(chantier);
    Storage.saveChantiersPureauxDicte(AppState.mesChantiersPureauxDicte);

    alert('✅ Chantier sauvegardé !');
}

function supprimerChantierPureauxDicte(id) {
    if (!confirm('Supprimer ce chantier ?')) return;

    AppState.mesChantiersPureauxDicte = AppState.mesChantiersPureauxDicte.filter(c => c.id !== id);
    Storage.saveChantiersPureauxDicte(AppState.mesChantiersPureauxDicte);
    render();
}

function reprendreChantierPureauxDicte(chantier) {
    // Stocker les données dans AppState pour les récupérer après le render
    AppState.chantierPureauxDicteRepris = chantier;
    
    naviguerVers('menu-outils', 'pureau-dicte');
}
