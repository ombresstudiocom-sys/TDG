/**
 * =====================================================
 * APP.JS - Application principale FACTIS
 * =====================================================
 * 
 * Ce fichier contient :
 * - L'état global de l'application
 * - La logique de navigation entre les pages
 * - Toutes les fonctions de rendu des pages
 * 
 * NAVIGATION : Système simple par état
 * - page : 'accueil', 'menu-outils', 'menu-calculateur', etc.
 * - sousPage : null, 'calculateur', 'ajouter-tuile', 'mes-tuiles'
 */

// ========================================
// ÉTAT GLOBAL DE L'APPLICATION
// ========================================
const AppState = {
    page: 'accueil',
    sousPage: null,
    modeSombre: false,
    mesTuiles: [],
    mesChantiers: [],
    mesChantiersPureauxDicte: [],
    tuileSelectionnee: null,
    tuileEnEdition: null,
    resultatPureauxDicte: null,
    chantierPureauxDicteRepris: null
};

// ========================================
// DONNÉES
// ========================================
// Ces données seront remplacées par le chargement des fichiers Excel
let TUILES_CATALOGUE = [];
let LECONS_PDF = [];

// ========================================
// INITIALISATION DE L'APPLICATION
// ========================================
async function initApp() {
    console.log('🚀 Initialisation de FACTIS');

    // Charger les données depuis localStorage
    AppState.modeSombre = Storage.loadModeSombre();
    AppState.mesTuiles = Storage.loadTuiles();
    AppState.mesChantiers = Storage.loadChantiers();
    AppState.mesChantiersPureauxDicte = Storage.loadChantiersPureauxDicte();

    // Charger les données depuis les fichiers Excel
    await chargerDonneesExcel();

    // Appliquer le mode sombre si nécessaire
    appliquerTheme();

    // Afficher la page d'accueil
    render();
}

// ========================================
// CHARGEMENT DES DONNÉES EXCEL
// ========================================
async function chargerDonneesExcel() {
    console.log('📊 Chargement des données Excel...');

    try {
        // Charger les tuiles du catalogue
        const tuiles = await ExcelLoader.chargerTuiles();
        if (tuiles && tuiles.length > 0) {
            TUILES_CATALOGUE = tuiles;
            console.log('✅ Catalogue de tuiles chargé:', tuiles.length, 'tuiles');
        }

        // Charger les leçons
        const lecons = await ExcelLoader.chargerLecons();
        if (lecons && lecons.length > 0) {
            LECONS_PDF = lecons;
            console.log('✅ Leçons chargées:', lecons.length, 'leçons');
        }
    } catch (error) {
        console.error('❌ Erreur lors du chargement des données Excel:', error);
        // Utiliser des données par défaut en cas d'erreur
        LECONS_PDF = [
            { titre: 'Pose en rive', description: 'Technique de pose des rives droites et gauches', url: '#' },
            { titre: 'Raccord de faîtage', description: 'Installation et étanchéité du faîtage', url: '#' },
            { titre: 'Noues et arêtiers', description: 'Traitement des lignes de pente', url: '#' },
            { titre: 'Ventilation de toiture', description: 'Systèmes de ventilation et aération', url: '#' },
            { titre: 'Pose chatière', description: 'Installation des éléments de ventilation', url: '#' }
        ];
    }
}

// ========================================
// GESTION DU THÈME
// ========================================
function toggleModeSombre() {
    AppState.modeSombre = !AppState.modeSombre;
    Storage.saveModeSombre(AppState.modeSombre);
    appliquerTheme();
    render();
}

function appliquerTheme() {
    const app = document.getElementById('app');
    const footer = document.getElementById('footer');
    
    if (AppState.modeSombre) {
        app.classList.remove('light');
        app.classList.add('dark');
        footer.classList.add('dark');
    } else {
        app.classList.remove('dark');
        app.classList.add('light');
        footer.classList.remove('dark');
    }
}

// ========================================
// NAVIGATION
// ========================================
function naviguerVers(page, sousPage = null) {
    AppState.page = page;
    AppState.sousPage = sousPage;
    render();
}

function retourAccueil() {
    naviguerVers('accueil');
}

function retourMenuOutils() {
    naviguerVers('menu-outils');
}

function retourMenuCalculateur() {
    naviguerVers('menu-calculateur');
}

// ========================================
// GESTION DES TUILES
// ========================================
function ajouterTuilePersonnelle(tuile) {
    const nouvelleTuile = {
        ...tuile,
        id: Date.now(),
        dateAjout: new Date().toLocaleDateString('fr-FR')
    };
    AppState.mesTuiles.push(nouvelleTuile);
    Storage.saveTuiles(AppState.mesTuiles);
}

function modifierTuilePersonnelle(id, tuileModifiee) {
    const index = AppState.mesTuiles.findIndex(t => t.id === id);
    if (index !== -1) {
        AppState.mesTuiles[index] = {
            ...tuileModifiee,
            id: id,
            dateAjout: AppState.mesTuiles[index].dateAjout
        };
        Storage.saveTuiles(AppState.mesTuiles);
    }
}

function supprimerTuilePersonnelle(id) {
    AppState.mesTuiles = AppState.mesTuiles.filter(t => t.id !== id);
    Storage.saveTuiles(AppState.mesTuiles);
    render();
}

function selectionnerTuile(tuile) {
    AppState.tuileSelectionnee = tuile;
    naviguerVers('menu-calculateur', 'calculateur');
}

function editerTuile(tuile) {
    AppState.tuileEnEdition = tuile;
    naviguerVers('menu-calculateur', 'ajouter-tuile');
}

// ========================================
// GESTION DES CHANTIERS
// ========================================
function sauvegarderChantier(chantier) {
    const nouveauChantier = {
        ...chantier,
        id: Date.now(),
        date: new Date().toLocaleDateString('fr-FR')
    };
    AppState.mesChantiers.push(nouveauChantier);
    Storage.saveChantiers(AppState.mesChantiers);
    alert('✅ Chantier sauvegardé avec succès !');
}

function supprimerChantier(id) {
    if (confirm('Voulez-vous vraiment supprimer ce chantier ?')) {
        AppState.mesChantiers = AppState.mesChantiers.filter(c => c.id !== id);
        Storage.saveChantiers(AppState.mesChantiers);
        render();
    }
}

function reprendreChantier(chantier) {
    AppState.tuileSelectionnee = chantier.tuile;
    naviguerVers('menu-calculateur', 'calculateur');
    
    // Pré-remplir le formulaire (sera géré dans le render du calculateur)
    AppState.chantierRepris = chantier;
}

// ========================================
// RENDU PRINCIPAL
// ========================================
function render() {
    const app = document.getElementById('app');
    
    // Déterminer quelle page afficher
    let contenu = '';

    if (AppState.page === 'accueil') {
        contenu = renderPageAccueil();
    } else if (AppState.page === 'menu-outils') {
        if (!AppState.sousPage) {
            contenu = renderPageMenuOutils();
        } else if (AppState.sousPage === 'pureau-dicte') {
            contenu = renderPagePureauxDicte();
        } else if (AppState.sousPage === 'historique-pureau-dicte') {
            contenu = renderPageHistoriquePureauxDicte();
        }
    } else if (AppState.page === 'menu-calculateur') {
        if (!AppState.sousPage) {
            contenu = renderPageMenuCalculateur();
        } else if (AppState.sousPage === 'calculateur') {
            contenu = renderCalculateurPureau();
        } else if (AppState.sousPage === 'ajouter-tuile') {
            contenu = renderPageAjouterTuile();
        } else if (AppState.sousPage === 'mes-tuiles') {
            contenu = renderPageMesTuiles();
        }
    } else if (AppState.page === 'conversion-degres') {
        contenu = renderPageConversionDegres();
    } else if (AppState.page === 'chantiers') {
        contenu = renderPageChantiers();
    } else if (AppState.page === 'lecons') {
        contenu = renderPageLecons();
    } else if (AppState.page === 'catalogue') {
        contenu = renderPageCatalogue();
    } else if (AppState.page === 'soutenir') {
        contenu = renderPageSoutenir();
    }

    app.innerHTML = contenu;
    attachEventListeners();
}

// ========================================
// UTILITAIRES HTML
// ========================================
function getThemeClass(base = '') {
    return base + ' ' + (AppState.modeSombre ? 'dark' : 'light');
}

function getTextClass() {
    return AppState.modeSombre ? 'text-light' : 'text-dark';
}

function getMutedClass() {
    return AppState.modeSombre ? 'text-muted' : 'text-gray';
}

// Icône SVG simple (remplacement de lucide-react)
function icon(name, className = 'icon') {
    const icons = {
        'calculator': '<svg class="' + className + '" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="16" y2="18"/></svg>',
        'book': '<svg class="' + className + '" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
        'file': '<svg class="' + className + '" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
        'heart': '<svg class="' + className + '" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
        'arrow-left': '<svg class="' + className + '" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
        'moon': '<svg class="' + className + '" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
        'sun': '<svg class="' + className + '" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
        'wrench': '<svg class="' + className + '" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
        'trending-up': '<svg class="' + className + '" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
        'save': '<svg class="' + className + '" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',
        'plus': '<svg class="' + className + '" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
        'edit': '<svg class="' + className + '" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
        'trash': '<svg class="' + className + '" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
        'check': '<svg class="' + className + '" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>',
        'x': '<svg class="' + className + '" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
        'download': '<svg class="' + className + '" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
        'volume': '<svg class="' + className + '" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>'
    };
    return icons[name] || '';
}

// ========================================
// RENDU PAGE ACCUEIL
// ========================================
function renderPageAccueil() {
    const cartes = [
        { icon: 'wrench', color: 'green', titre: 'Outils de calcul', desc: 'Calculateurs professionnels', page: 'menu-outils' },
        { icon: 'book', color: 'purple', titre: 'Leçons de couverture', desc: 'Guides techniques', page: 'lecons' },
        { icon: 'file', color: 'orange', titre: 'Catalogue de tuiles', desc: 'Fiches techniques', page: 'catalogue' },
        { icon: 'heart', color: 'red', titre: 'Nous soutenir', desc: 'Aidez-nous à améliorer', page: 'soutenir' }
    ];

    return `
        <div class="container">
            <div class="${getThemeClass('card')} text-center relative">
                <button class="btn-icon theme-toggle" onclick="toggleModeSombre()">
                    ${AppState.modeSombre ? icon('sun') : icon('moon')}
                </button>
                
                <img src="logo.png" alt="Toitures Des Garrigues" class="logo-home">
                <p class="${getMutedClass()}">Outil professionnel pour couvreurs</p>
            </div>

            <!-- Boutons principaux (déplacés en premier) -->
            <div class="grid grid-2">
                ${cartes.map(carte => `
                    <button class="${getThemeClass('card')} ${getThemeClass('card-app')} card-button card-clickable" onclick="naviguerVers('${carte.page}')">
                        <div class="card-icon-wrapper">
                            ${icon(carte.icon, 'icon-xl text-' + carte.color)}
                        </div>
                        <h3 class="${getTextClass()}">${carte.titre}</h3>
                        <p class="${getMutedClass()} text-sm">${carte.desc}</p>
                    </button>
                `).join('')}
            </div>

            <!-- Bloc À propos -->
            <div class="${getThemeClass('info-block')}">
                <h3 class="${getTextClass()}">📝 À propos de cet outil</h3>
                <p class="${getTextClass()}">
                    Application professionnelle conçue pour les couvreurs. 
                    Calculez précisément le pureau de vos tuiles, gérez votre catalogue, 
                    sauvegardez vos chantiers et accédez à des leçons techniques. 
                    Utilisable sur smartphone et tablette pour un usage sur chantier.
                </p>
            </div>

            <!-- Bloc Nouveautés -->
            <div class="${getThemeClass('info-block')}">
                <h3 class="${getTextClass()}">🔔 Nouveautés - Version 2.0</h3>
                <ul class="${getTextClass()}">
                    <li>✅ Catalogue de tuiles modifiable via Excel</li>
                    <li>✅ Leçons de couverture depuis fichiers Excel</li>
                    <li>✅ Commandes vocales améliorées (suivant, répète, stop)</li>
                    <li>✅ Mode hors pureau avec détail des rangs</li>
                    <li>✅ Interface modernisée et optimisée mobile</li>
                </ul>
            </div>
        </div>
    `;
}

// ========================================
// RENDU PAGE MENU OUTILS
// ========================================
function renderPageMenuOutils() {
    const outils = [
        { icon: 'calculator', color: 'green', titre: 'Calculateur de pureau', desc: 'Calcul précis du pureau', page: 'menu-calculateur' },
        { icon: 'wrench', color: 'blue', titre: 'Pureau Dicté', desc: 'Génération de cotes avec pureau fixe', page: 'menu-outils', sousPage: 'pureau-dicte' },
        { icon: 'trending-up', color: 'green', titre: 'Calcul degré en pourcentage', desc: 'Conversion degré ↔ %', page: 'conversion-degres' },
        { icon: 'save', color: 'purple', titre: 'Chantiers sauvegardés', desc: `${AppState.mesChantiers.length} chantier(s)`, page: 'chantiers' }
    ];

    return `
        <div class="container">
            <button class="btn-back" onclick="retourAccueil()">
                ${icon('arrow-left')}
                Retour à l'accueil
            </button>

            <h2 class="${getTextClass()}">Outils de calcul</h2>

            <div class="grid grid-2">
                ${outils.map(outil => `
                    <button class="${getThemeClass('card')} ${getThemeClass('card-app')} card-button card-clickable" onclick="naviguerVers('${outil.page}'${outil.sousPage ? ", '" + outil.sousPage + "'" : ''})">
                        <div class="card-icon-wrapper">
                            ${icon(outil.icon, 'icon-xl text-' + outil.color)}
                        </div>
                        <h3 class="${getTextClass()}">${outil.titre}</h3>
                        <p class="${getMutedClass()} text-sm">${outil.desc}</p>
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

// ========================================
// RENDU PAGE MENU CALCULATEUR
// ========================================
function renderPageMenuCalculateur() {
    return `
        <div class="container">
            <button class="btn-back" onclick="retourMenuOutils()">
                ${icon('arrow-left')}
                Retour aux outils
            </button>

            <h2 class="${getTextClass()}">Calculateur de pureau</h2>

            <div class="space-y-4">
                <!-- GROS BOUTON LANCER LE CALCULATEUR -->
                <button class="${getThemeClass('card')} ${getThemeClass('card-app')} card-button card-clickable" onclick="naviguerVers('menu-calculateur', 'calculateur')" style="min-height: 120px;">
                    <div class="card-icon-wrapper">
                        ${icon('calculator', 'icon-xl text-green')}
                    </div>
                    <h3 class="${getTextClass()}" style="font-size: 1.5rem; margin-bottom: 0.5rem;">Lancer le calculateur</h3>
                    <p class="${getMutedClass()} text-sm">Calcul automatique de pureau & rang</p>
                </button>

                <!-- BOUTONS GESTION TUILES -->
                <div class="grid grid-2 gap-4">
                    <button class="${getThemeClass('card')} card-button card-clickable" onclick="naviguerVers('menu-calculateur', 'ajouter-tuile')">
                        <div class="card-icon-wrapper">
                            ${icon('plus', 'icon-lg text-blue')}
                        </div>
                        <h3 class="${getTextClass()}">Ajouter une tuile</h3>
                        <p class="${getMutedClass()} text-sm">Créer une tuile personnalisée</p>
                    </button>

                    <button class="${getThemeClass('card')} card-button card-clickable" onclick="naviguerVers('menu-calculateur', 'mes-tuiles')">
                        <div class="card-icon-wrapper">
                            ${icon('file', 'icon-lg text-purple')}
                        </div>
                        <h3 class="${getTextClass()}">Mes tuiles (${AppState.mesTuiles.length})</h3>
                        <p class="${getMutedClass()} text-sm">Gérer les tuiles enregistrées</p>
                    </button>
                </div>

                <!-- TUILES ENREGISTREES -->
                ${AppState.mesTuiles.length > 0 ? `
                    <div class="${getThemeClass('card')}">
                        <h3 class="${getTextClass()} mb-3">📌 Mes tuiles personnalisées</h3>
                        <div class="grid grid-2 gap-4">
                            ${AppState.mesTuiles.map(tuile => `
                                <button class="${getThemeClass('btn-secondary')} btn" onclick='selectionnerTuile(${JSON.stringify(tuile)})'>
                                    ${tuile.nom} (${tuile.marque})
                                </button>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- TUILES DU CATALOGUE -->
                ${TUILES_CATALOGUE.length > 0 ? `
                    <div class="${getThemeClass('card')}">
                        <h3 class="${getTextClass()} mb-3">📚 Tuiles du catalogue</h3>
                        <div class="grid grid-2 gap-4">
                            ${TUILES_CATALOGUE.slice(0, 6).map(tuile => `
                                <button class="${getThemeClass('btn-secondary')} btn" onclick='selectionnerTuile(${JSON.stringify(tuile)})'>
                                    ${tuile.nom} (${tuile.marque})
                                </button>
                            `).join('')}
                        </div>
                        ${TUILES_CATALOGUE.length > 6 ? `
                            <p class="${getMutedClass()} text-sm text-center mt-3">
                                + ${TUILES_CATALOGUE.length - 6} autres tuiles dans le catalogue
                            </p>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// ========================================
// RENDU PAGE CONVERSION DEGRÉS
// ========================================
function renderPageConversionDegres() {
    return `
        <div class="container">
            <button class="btn-back" onclick="retourMenuOutils()">
                ${icon('arrow-left')}
                Retour aux outils
            </button>

            <h2 class="${getTextClass()}">Conversion degré ↔ pourcentage</h2>

            <div class="${getThemeClass('card')}">
                <div class="form-group">
                    <label class="${getThemeClass('form-label')}">Degrés (°)</label>
                    <input type="number" id="input-degres" class="${getThemeClass('form-input')}" placeholder="Exemple: 45" step="0.1">
                </div>

                <div class="form-group">
                    <label class="${getThemeClass('form-label')}">Pourcentage (%)</label>
                    <input type="number" id="input-pourcentage" class="${getThemeClass('form-input')}" placeholder="Exemple: 100" step="0.1">
                </div>

                <div id="resultat-conversion" class="alert alert-info hidden">
                    <p id="texte-resultat-conversion"></p>
                </div>
            </div>
        </div>
    `;
}

// ========================================
// RENDU PAGE LEÇONS
// ========================================
function renderPageLecons() {
    return `
        <div class="container">
            <button class="btn-back" onclick="retourAccueil()">
                ${icon('arrow-left')}
                Retour à l'accueil
            </button>

            <h2 class="${getTextClass()}">Leçons de couverture</h2>

            ${LECONS_PDF.length === 0 ? `
                <div class="${getThemeClass('card')} text-center">
                    ${icon('book', 'icon-xl ' + getMutedClass())}
                    <p class="${getTextClass()} mb-2">Aucune leçon disponible</p>
                    <p class="${getMutedClass()} text-sm">Vérifiez que le fichier data/lecons.xlsx est présent</p>
                </div>
            ` : `
                <div class="space-y-4">
                    ${LECONS_PDF.map(lecon => `
                        <div class="${getThemeClass('card')} flex flex-between">
                            <div>
                                <h3 class="${getTextClass()}">${lecon.titre}</h3>
                                <p class="${getMutedClass()} text-sm">${lecon.description}</p>
                            </div>
                            <a href="${lecon.url}" target="_blank" class="btn btn-primary flex gap-2">
                                ${icon('download')}
                                PDF
                            </a>
                        </div>
                    `).join('')}
                </div>
            `}
        </div>
    `;
}

// ========================================
// RENDU PAGE CATALOGUE
// ========================================
function renderPageCatalogue() {
    const typesLabels = {
        'plate': 'Plate',
        'faible-galbe': 'Faible galbe',
        'grand-galbe': 'Grand galbe'
    };

    return `
        <div class="container">
            <button class="btn-back" onclick="retourAccueil()">
                ${icon('arrow-left')}
                Retour à l'accueil
            </button>

            <h2 class="${getTextClass()}">Catalogue de tuiles</h2>

            ${TUILES_CATALOGUE.length === 0 ? `
                <div class="${getThemeClass('card')} text-center">
                    ${icon('file', 'icon-xl ' + getMutedClass())}
                    <p class="${getTextClass()} mb-2">Aucune tuile dans le catalogue</p>
                    <p class="${getMutedClass()} text-sm">Vérifiez que le fichier data/tuiles.xlsx est présent</p>
                </div>
            ` : `
                <div class="space-y-4">
                    ${TUILES_CATALOGUE.map(tuile => `
                        <div class="${getThemeClass('card')}">
                            <div class="flex flex-between mb-3">
                                <div>
                                    <h3 class="${getTextClass()}">${tuile.nom}</h3>
                                    <p class="${getMutedClass()} text-sm">${tuile.marque} - ${typesLabels[tuile.type] || tuile.type}</p>
                                </div>
                                ${tuile.urlPdf && tuile.urlPdf !== '#' ? `
                                    <a href="${tuile.urlPdf}" target="_blank" class="btn btn-primary flex gap-2">
                                        ${icon('download')}
                                        Fiche PDF
                                    </a>
                                ` : ''}
                            </div>

                            <div class="${getThemeClass('result-section')} grid-cols-3 grid gap-4">
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

                            ${tuile.urlImage && tuile.urlImage !== '#' ? `
                                <div class="mt-4">
                                    <img src="${tuile.urlImage}" alt="${tuile.nom}" style="max-width: 200px; border-radius: 8px;">
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            `}
        </div>
    `;
}

// ========================================
// RENDU PAGE SOUTENIR
// ========================================
function renderPageSoutenir() {
    return `
        <div class="container-small">
            <button class="btn-back" onclick="retourAccueil()">
                ${icon('arrow-left')}
                Retour à l'accueil
            </button>

            <div class="${getThemeClass('card')} text-center">
                ${icon('heart', 'icon-xl text-red')}
                <h2 class="${getTextClass()}">Nous soutenir</h2>
                <p class="${getTextClass()} mb-6">
                    Cet outil est gratuit et développé pour faciliter le travail des couvreurs professionnels. 
                    Si vous trouvez cette application utile, vous pouvez soutenir son développement.
                </p>
                <a href="#" target="_blank" class="btn btn-danger">
                    Faire un don
                </a>
                <p class="${getMutedClass()} text-sm mt-4">
                    Merci pour votre soutien ! 🙏
                </p>
            </div>

            <div class="${getThemeClass('info-block')} mt-6">
                <h3 class="${getTextClass()}">💡 Proposer une amélioration</h3>
                <p class="${getTextClass()} mb-4">
                    Vous avez une idée pour améliorer cet outil ? Une fonctionnalité manquante ? 
                    Un bug à signaler ? N'hésitez pas à nous faire part de vos suggestions !
                </p>
                <p class="${getTextClass()}">
                    <strong>Contact :</strong> 
                    <a href="mailto:contact@toituresdesgarrigues.fr" class="text-green" style="text-decoration: underline;">
                        contact@toituresdesgarrigues.fr
                    </a>
                </p>
                <p class="${getMutedClass()} text-sm mt-3">
                    Nous lisons tous les messages et tenons compte de vos retours pour les futures mises à jour.
                </p>
            </div>
        </div>
    `;
}

// Démarrage de l'application au chargement de la page
document.addEventListener('DOMContentLoaded', initApp);
