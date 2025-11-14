# FACTIS - Outil professionnel pour couvreurs

Application web pour calculer le pureau des tuiles avec lecture vocale et sauvegarde des chantiers.

## 📁 Structure des fichiers

```
factis-app/
├── index.html              # Structure HTML principale
├── styles.css              # Tous les styles (Tailwind-like)
├── storage.js              # Gestion du localStorage
├── calculateur.js          # ⭐ MOTEUR DE CALCUL (ISOLÉ)
├── vocal.js                # Gestion de la lecture vocale
├── excel-loader.js         # Chargement des fichiers Excel
├── app.js                  # État global + Navigation + Pages simples
├── pages.js                # Pages complexes (Tuiles, Chantiers)
├── calculateur-ui.js       # Interface du calculateur + Résultats
├── data/
│   ├── tuiles.xlsx         # Catalogue des tuiles (MODIFIABLE)
│   └── lecons.xlsx         # Liste des leçons (MODIFIABLE)
└── README.md               # Cette documentation
```

## 🚀 Démarrage rapide

1. **Ouvrir l'application** : Double-cliquer sur `index.html`
2. **Aucune installation requise** : Tout fonctionne dans le navigateur
3. **Navigateurs supportés** : Chrome, Firefox, Safari, Edge (récents)

## 🎯 Fonctionnalités

### ✅ Implémentées (100%)

- ✅ Navigation complète entre les pages
- ✅ Mode sombre/clair persistant
- ✅ Gestion des tuiles personnalisées (CRUD)
- ✅ **Calculateur de pureau complet**
  - Mode NORMAL : nombre de rangs commun
  - Mode HORS PUREAU : calculs indépendants
  - Détail des rangs avec premier rang et dernier rang
  - Traçage avec cotes cumulées
- ✅ Lecture vocale avec reconnaissance de commandes
- ✅ Sauvegarde des chantiers
- ✅ Conversion degré ↔ pourcentage
- ✅ **Catalogue de tuiles depuis fichier Excel**
- ✅ **Leçons de couverture depuis fichier Excel**

### 📊 Gestion des données Excel

Les tuiles du catalogue et les leçons sont chargées depuis des fichiers Excel locaux :
- `data/tuiles.xlsx` - Catalogue des tuiles modifiable
- `data/lecons.xlsx` - Liste des leçons modifiable

**Pour modifier les données** :
1. Ouvrir le fichier Excel avec Microsoft Excel, LibreOffice, ou Google Sheets
2. Modifier les données (ne pas changer les noms des colonnes !)
3. Sauvegarder
4. Recharger la page web

### ⚠️ Important : Serveur web requis

Les fichiers Excel ne peuvent pas être chargés en mode `file://` (sécurité du navigateur).
Vous devez héberger l'application sur un serveur web :

**Solutions simples** :
```bash
# Avec Python (si installé)
python -m http.server 8000
# Puis ouvrir : http://localhost:8000

# Avec PHP (si installé)
php -S localhost:8000

# Avec Node.js (si installé)
npx http-server -p 8000
```

**Ou** :
- Extension VS Code "Live Server"
- Hébergement web classique (OVH, etc.)

## 📊 MODIFIER LES FICHIERS EXCEL

### Structure du fichier `data/tuiles.xlsx`

| Colonne | Description | Exemple | Obligatoire |
|---------|-------------|---------|-------------|
| Marque | Fabricant de la tuile | Edilians | ✅ |
| Type | Type de tuile | faible-galbe | ✅ |
| Modèle | Nom du modèle | Oméga 10 | ✅ |
| Pureau Min | Pureau minimum en cm | 37 | ✅ |
| Pureau Max | Pureau maximum en cm | 40 | ✅ |
| Pureau Départ | Pureau de départ en cm | 35 | ✅ |
| Espace Faîtage | Espace faîtage en cm | 15 | ✅ |
| URL Image | Lien vers une image | fiches/omega10.jpg | ❌ |
| URL PDF | Lien vers la fiche PDF | fiches/omega10.pdf | ❌ |

**Types de tuiles possibles** :
- `plate`
- `faible-galbe`
- `grand-galbe`

### Structure du fichier `data/lecons.xlsx`

| Colonne | Description | Exemple | Obligatoire |
|---------|-------------|---------|-------------|
| Titre | Titre de la leçon | Pose en rive | ✅ |
| Description | Description courte | Technique de pose... | ✅ |
| URL | Lien vers le PDF | lecons/pose-rive.pdf | ✅ |

### 💡 Conseils pour modifier les Excel

1. **Ne pas changer les noms des colonnes** (en-têtes)
2. Les colonnes peuvent être dans n'importe quel ordre
3. Les champs vides sont acceptés pour URL Image et URL PDF
4. Sauvegarder au format `.xlsx` (pas `.xls` ou `.csv`)
5. Recharger la page web après modification

## 🔧 CORRECTION DU CALCULATEUR

### 📍 Localisation du code

**Le calculateur est TOTALEMENT ISOLÉ dans `calculateur.js`**

Vous pouvez modifier l'algorithme sans toucher au reste de l'application !

### 🎯 Fonction principale à modifier

```javascript
// Fichier : calculateur.js
// Ligne : ~50

CalculateurPureau.calculer(params)
```

Cette fonction contient TOUTE la logique :

1. **Validation des entrées** (ligne ~60)
2. **Calcul des longueurs utiles** (ligne ~80)
3. **Mode NORMAL** (ligne ~100) : cherche un nombre de rangs commun
4. **Mode HORS PUREAU** (ligne ~130) : calculs indépendants

### 🐛 Exemple de correction

**Problème** : Le pureau calculé n'est pas correct

**Solution** : Cherchez dans `calculateur.js`

```javascript
// LIGNE ~150 - Fonction chercherSolutionNormale
const pureau1 = longueurUtile1 / nbRangs;
const pureau2 = longueurUtile2 / nbRangs;
```

→ Modifiez uniquement cette fonction !

### 📊 Debug du calculateur

```javascript
// Ajoutez des console.log dans calculateur.js
console.log('🔍 Longueurs utiles:', { longueurUtile1, longueurUtile2 });
console.log('📊 Bornes rangs:', { rangsMin, rangsMax });
console.log('✅ Solution trouvée:', solutionNormale);
```

→ Ouvrez la **Console du navigateur** (F12) pour voir les logs

## 📐 Architecture du code

### 🎨 Principe de navigation

**Navigation par état simple** (pas de React Router)

```javascript
// app.js - État global
AppState = {
    page: 'accueil',           // Page actuelle
    sousPage: null,             // Sous-page si nécessaire
    modeSombre: false,
    mesTuiles: [],
    mesChantiers: []
}

// Navigation
function naviguerVers(page, sousPage) {
    AppState.page = page;
    AppState.sousPage = sousPage;
    render();  // Re-affiche la page
}
```

### 💾 Gestion des données

**localStorage** (persistance)

```javascript
// storage.js
Storage.saveTuiles(mesTuiles);       // Sauvegarder
Storage.loadTuiles();                 // Charger
```

**Données stockées** :
- `modeSombre` : boolean
- `mes-tuiles` : array d'objets
- `mes-chantiers` : array d'objets

### 🔄 Flux de calcul

```
1. Utilisateur remplit le formulaire
   → calculateur-ui.js : lancerCalcul()

2. Appel du moteur de calcul
   → calculateur.js : CalculateurPureau.calculer(params)

3. Affichage des résultats
   → calculateur-ui.js : afficherResultats(resultat)

4. Lecture vocale (optionnel)
   → vocal.js : Vocal.demarrerLecture()
```

## 🎙️ Lecture vocale

### Commandes vocales supportées

- **"suivant"** → Passe à la cote suivante
- **"répète"** ou **"répéter"** → Répète la cote actuelle
- **"avant"** ou **"précédent"** → Revient à la cote précédente
- **"stop"** ou **"arrêt"** → Arrête la lecture

### Modification de la voix

```javascript
// vocal.js - Ligne ~30
const utterance = new SpeechSynthesisUtterance(texte);
utterance.lang = 'fr-FR';
utterance.rate = 0.9;     // ← Vitesse (0.1 à 2)
utterance.pitch = 1.0;    // ← Tonalité (0 à 2)
```

## 🎨 Personnalisation du style

### Modifier les couleurs

```css
/* styles.css - Ligne ~15 */
:root {
    --color-blue-600: #2563eb;    /* ← Couleur primaire */
    --color-red-600: #dc2626;     /* ← Couleur danger */
    /* etc. */
}
```

### Modifier un composant

```css
/* Exemple : Modifier les cartes */
.card {
    border-radius: 0.75rem;    /* ← Arrondi */
    padding: 2rem;             /* ← Espacement interne */
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);  /* ← Ombre */
}
```

## 📦 Structure des données

### Objet Tuile

```javascript
{
    id: 1234567890,              // timestamp
    nom: "Oméga 10",
    marque: "Edilians",
    type: "faible-galbe",        // "plate" | "faible-galbe" | "grand-galbe"
    pureauMin: "37",             // string
    pureauMax: "40",
    pureauDepart: "35",
    espaceFaitage: "15",
    dateAjout: "08/11/2025"
}
```

### Objet Chantier

```javascript
{
    id: 1234567890,
    nomChantier: "Maison Dupont",
    date: "08/11/2025",
    rampant1: "200",
    rampant2: "250",
    premierRang1: "10",
    premierRang2: "10",
    espaceFaitage1: "15",
    espaceFaitage2: "15",
    pureauMin: "35",
    pureauMax: "44",
    tuile: { ...objetTuile },
    resultat: { ...objetResultat }
}
```

### Objet Résultat

```javascript
{
    rampant1: {
        nombreRangs: 6,
        pureauCalcule: "38.00",
        detailRangs: {              // Seulement en mode hors pureau
            premierRang: 10,
            rangsComplets: 4,
            pureauComplet: 38,
            dernierRang: 28         // ou null si pile-poil
        },
        rangsSupplementaires: null, // Mode normal uniquement
        coteRestante: null,
        tracage: ["10.00", "48.00", "86.00", ...]
    },
    rampant2: { ... },
    nombreRangsCommun: 6,           // ou null si différents
    horsPureau: false               // true si mode hors pureau
}
```

## 🔧 Ajouter une fonctionnalité

### 1. Ajouter une nouvelle page

```javascript
// app.js - Ajouter le rendu
function renderMaNouvellePage() {
    return `
        <div class="container">
            <h2>Ma nouvelle page</h2>
        </div>
    `;
}

// Dans render()
if (AppState.page === 'ma-nouvelle-page') {
    contenu = renderMaNouvellePage();
}
```

### 2. Ajouter un champ au formulaire tuile

```javascript
// pages.js - Dans renderPageAjouterTuile()
<div class="form-group">
    <label>Mon nouveau champ</label>
    <input type="text" id="nouveau-champ" class="form-input">
</div>

// Dans soumettreFormulaireTuile()
const tuile = {
    ...
    nouveauChamp: document.getElementById('nouveau-champ').value
};
```

### 3. Modifier l'algorithme de calcul

**UNIQUEMENT dans `calculateur.js`** !

```javascript
// calculateur.js - Ligne ~150
chercherSolutionNormale(longueurUtile1, longueurUtile2, rangsMin, rangsMax, pureauMin, pureauMax) {
    // ← MODIFIER ICI
    // Votre nouvelle logique
}
```

## 🐛 Debugging

### Outils du navigateur

1. **Console** (F12) : Voir les logs et erreurs
2. **Inspecteur** : Examiner le HTML/CSS
3. **Stockage** : Voir le localStorage

### Console logs utiles

```javascript
// Voir l'état actuel
console.log('État:', AppState);

// Voir les données stockées
console.log('Tuiles:', Storage.loadTuiles());
console.log('Chantiers:', Storage.loadChantiers());

// Debugger le calcul
console.log('Paramètres:', params);
console.log('Résultat:', resultat);
```

### Réinitialiser les données

```javascript
// Dans la console du navigateur
Storage.clearAll();
location.reload();
```

## ⚡ Performance

### Optimisations appliquées

- ✅ Pas de re-render inutiles
- ✅ localStorage mis à jour uniquement quand nécessaire
- ✅ Calculs lourds isolés dans une fonction
- ✅ Pas de dépendances externes lourdes

### Bonnes pratiques

- Code lisible et commenté
- Fonctions courtes et spécialisées
- Séparation des responsabilités
- Pas de variables globales (sauf AppState)

## 📄 Licence

© 2025 CHAPEL - SARL Toitures Des Garrigues 34160  
Tous droits réservés

---

**Version** : 2.0.0 (avec Excel)
**Date** : Novembre 2025  
**Auteur** : Claude (Anthropic)
