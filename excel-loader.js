/**
 * =====================================================
 * EXCEL-LOADER.JS - Chargement des fichiers Excel
 * =====================================================
 * 
 * Ce fichier gère le chargement des fichiers Excel locaux :
 * - data/tuiles.xlsx
 * - data/lecons.xlsx
 * 
 * Utilise la bibliothèque SheetJS (xlsx.js) pour lire les fichiers
 */

const ExcelLoader = {
    /**
     * Charge un fichier Excel et retourne les données
     * @param {string} url - Chemin vers le fichier Excel
     * @param {string} sheetName - Nom de la feuille (optionnel, prend la première si non spécifié)
     * @returns {Promise<Array>} - Tableau d'objets représentant les lignes
     */
    async chargerFichier(url, sheetName = null) {
        try {
            console.log('📂 Chargement du fichier Excel:', url);

            // Télécharger le fichier
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            // Convertir en ArrayBuffer
            const arrayBuffer = await response.arrayBuffer();

            // Lire avec SheetJS
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });

            // Déterminer quelle feuille utiliser
            const sheet = sheetName 
                ? workbook.Sheets[sheetName] 
                : workbook.Sheets[workbook.SheetNames[0]];

            if (!sheet) {
                throw new Error(`Feuille "${sheetName || 'première feuille'}" non trouvée`);
            }

            // Convertir en JSON
            const data = XLSX.utils.sheet_to_json(sheet);

            console.log('✅ Fichier Excel chargé:', data.length, 'lignes');
            return data;

        } catch (error) {
            console.error('❌ Erreur lors du chargement du fichier Excel:', error);
            return null;
        }
    },

    /**
     * Charge le fichier des tuiles
     * @returns {Promise<Array>} - Tableau de tuiles
     */
    async chargerTuiles() {
        console.log('🔧 Chargement des tuiles depuis Excel...');
        const data = await this.chargerFichier('data/tuiles.xlsx');

        if (!data) {
            console.warn('⚠️ Impossible de charger les tuiles, utilisation des données par défaut');
            return [];
        }

        // Transformer les données Excel en format de l'application
        const tuiles = data.map((row, index) => ({
            id: `excel-${Date.now()}-${index}`,
            marque: row['Marque'] || row['marque'] || '',
            type: row['Type'] || row['type'] || 'faible-galbe',
            nom: row['Modèle'] || row['Modele'] || row['modele'] || row['nom'] || '',
            pureauMin: String(row['Pureau Min'] || row['pureauMin'] || row['Min'] || '35'),
            pureauMax: String(row['Pureau Max'] || row['pureauMax'] || row['Max'] || '44'),
            pureauDepart: String(row['Pureau Départ'] || row['Pureau Depart'] || row['pureauDepart'] || row['Départ'] || row['Depart'] || '33'),
            espaceFaitage: String(row['Espace Faîtage'] || row['Espace Faitage'] || row['espaceFaitage'] || row['Faîtage'] || row['Faitage'] || '15'),
            urlImage: row['URL Image'] || row['urlImage'] || row['Image'] || null,
            urlPdf: row['URL PDF'] || row['urlPdf'] || row['PDF'] || null,
            dateAjout: new Date().toLocaleDateString('fr-FR')
        }));

        console.log('✅ Tuiles chargées:', tuiles.length);
        return tuiles;
    },

    /**
     * Charge le fichier des leçons
     * @returns {Promise<Array>} - Tableau de leçons
     */
    async chargerLecons() {
        console.log('📚 Chargement des leçons depuis Excel...');
        const data = await this.chargerFichier('data/lecons.xlsx');

        if (!data) {
            console.warn('⚠️ Impossible de charger les leçons, utilisation des données par défaut');
            return [
                { titre: 'Pose en rive', description: 'Technique de pose des rives droites et gauches', url: '#' },
                { titre: 'Raccord de faîtage', description: 'Installation et étanchéité du faîtage', url: '#' },
                { titre: 'Noues et arêtiers', description: 'Traitement des lignes de pente', url: '#' },
                { titre: 'Ventilation de toiture', description: 'Systèmes de ventilation et aération', url: '#' },
                { titre: 'Pose chatière', description: 'Installation des éléments de ventilation', url: '#' }
            ];
        }

        // Transformer les données Excel en format de l'application
        const lecons = data.map(row => ({
            titre: row['Titre'] || row['titre'] || '',
            description: row['Description'] || row['description'] || '',
            url: row['URL'] || row['url'] || row['URL PDF'] || row['PDF'] || '#'
        }));

        console.log('✅ Leçons chargées:', lecons.length);
        return lecons;
    },

    /**
     * Vérifie si SheetJS est disponible
     */
    verifierDisponibilite() {
        if (typeof XLSX === 'undefined') {
            console.error('❌ SheetJS (XLSX) non chargé ! Vérifiez que le script est bien inclus dans index.html');
            return false;
        }
        console.log('✅ SheetJS disponible');
        return true;
    }
};

// Vérifier la disponibilité au chargement
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        setTimeout(() => {
            ExcelLoader.verifierDisponibilite();
        }, 100);
    });
}
