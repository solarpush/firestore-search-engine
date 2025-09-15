/**
 * Exemple d'utilisation du système multi-champs avec vectorisation batch
 * Démontre comment indexer plusieurs champs avec des poids et stocker les vecteurs
 * sous format _vector_[fieldName]
 */

import { firestore } from "firebase-admin";
import { FirestoreSearchEngine } from "../src/FirestoreSearchEngine";
import type {
  FirestoreSearchEngineMultiIndexesProps,
  FirestoreSearchEngineMultiSearchProps,
} from "../src/index";

// Configuration du moteur de recherche avec support multi-champs
const searchEngine = new FirestoreSearchEngine(
  firestore(), // Instance Firestore
  {
    collection: "search_multi_indexes",
    wordMinLength: 2,
    wordMaxLength: 100,
  },
  firestore.FieldValue // Instance FieldValue
);

/**
 * Exemple 1: Indexation multi-champs d'un appartement/résidence
 */
async function indexResidenceMultiField() {
  const multiFieldProps: FirestoreSearchEngineMultiIndexesProps = {
    inputFields: {
      title: {
        weight: 2.0, // Titre plus important
        fuzzySearch: true,
      },
      description: {
        weight: 1.0, // Description poids normal
        fuzzySearch: true,
      },
      address: {
        weight: 1.5, // Adresse importante aussi
        fuzzySearch: false, // Pas de fuzzy pour les adresses
      },
      amenities: {
        weight: 0.8, // Équipements moins prioritaires
        fuzzySearch: true,
      },
    },
    returnedFields: {
      indexedDocumentPath: "residences/res_001",
      title: "Appartement moderne centre-ville",
      description: "Magnifique appartement rénové avec vue sur la ville",
      address: "123 Rue de la Paix, Paris 75001",
      amenities: "Balcon, parking, ascenseur, wifi",
      price: 1500,
      bedrooms: 2,
      surface: 65,
    },
  };

  try {
    await searchEngine.indexesMultiField(multiFieldProps);
    console.log("✅ Indexation multi-champs réussie");
    console.log("Vecteurs stockés sous:");
    console.log("- _vector_title");
    console.log("- _vector_description");
    console.log("- _vector_address");
    console.log("- _vector_amenities");
  } catch (error) {
    console.error("❌ Erreur indexation:", error);
  }
}

/**
 * Exemple 2: Recherche multi-champs avec pondération
 */
async function searchMultiField() {
  const searchProps: FirestoreSearchEngineMultiSearchProps = {
    searchText: "appartement moderne parking centre",
    searchConfig: {
      title: {
        weight: 2.0, // Même pondération que l'indexation
        fuzzySearch: true,
      },
      description: {
        weight: 1.0,
        fuzzySearch: true,
      },
      address: {
        weight: 1.5,
        fuzzySearch: false,
      },
      amenities: {
        weight: 0.8,
        fuzzySearch: true,
      },
    },
    limit: 10,
  };

  try {
    const results = await searchEngine.searchMultiField(searchProps);
    console.log("🔍 Résultats de recherche multi-champs:", results);
    return results;
  } catch (error) {
    console.error("❌ Erreur recherche:", error);
    return [];
  }
}

/**
 * Exemple 3: Indexation batch de plusieurs résidences
 */
async function batchIndexMultiField() {
  const residences = [
    {
      indexedDocumentPath: "residences/res_002",
      title: "Studio lumineux Montmartre",
      description: "Petit studio cosy dans quartier artistique",
      address: "45 Rue Lepic, Paris 75018",
      amenities: "Kitchenette, douche, chauffage",
      price: 900,
      bedrooms: 0,
      surface: 25,
    },
    {
      indexedDocumentPath: "residences/res_003",
      title: "Loft industriel canal Saint-Martin",
      description: "Grand loft avec poutres apparentes et verrière",
      address: "78 Quai de Valmy, Paris 75010",
      amenities: "Terrasse, parking privé, cave à vin",
      price: 2800,
      bedrooms: 3,
      surface: 120,
    },
  ];

  const fieldConfigs = {
    title: { weight: 2.0, fuzzySearch: true },
    description: { weight: 1.0, fuzzySearch: true },
    address: { weight: 1.5, fuzzySearch: false },
    amenities: { weight: 0.8, fuzzySearch: true },
  };

  try {
    // Utilisation du nouveau batch multi-champs
    await searchEngine.indexesAllMultiField({
      documentsToIndexes: residences,
      fieldConfigs,
    });

    console.log("✅ Indexation batch multi-champs réussie");
    console.log(`📊 ${residences.length} résidences indexées`);
  } catch (error) {
    console.error("❌ Erreur indexation batch:", error);
  }
}

/**
 * Exemple 4: Recherche avec différentes stratégies
 */
async function demonstrateSearchStrategies() {
  console.log("\n🧪 Test de différentes stratégies de recherche:\n");

  // Recherche orientée titre (poids fort)
  const titleSearch = await searchEngine.searchMultiField({
    searchText: "loft industriel",
    searchConfig: {
      title: { weight: 3.0, fuzzySearch: true },
      description: { weight: 0.5, fuzzySearch: true },
    },
    limit: 5,
  });
  console.log("🎯 Recherche orientée titre:", titleSearch.length, "résultats");

  // Recherche orientée adresse (pas de fuzzy)
  const addressSearch = await searchEngine.searchMultiField({
    searchText: "canal saint martin",
    searchConfig: {
      address: { weight: 2.0, fuzzySearch: false },
      title: { weight: 1.0, fuzzySearch: true },
    },
    limit: 5,
  });
  console.log(
    "📍 Recherche orientée adresse:",
    addressSearch.length,
    "résultats"
  );

  // Recherche équipements avec fuzzy
  const amenitiesSearch = await searchEngine.searchMultiField({
    searchText: "parkng terasse", // Avec fautes volontaires
    searchConfig: {
      amenities: { weight: 2.0, fuzzySearch: true },
      title: { weight: 0.5, fuzzySearch: false },
    },
    limit: 5,
  });
  console.log(
    "🛠️ Recherche équipements (avec fautes):",
    amenitiesSearch.length,
    "résultats"
  );
}

/**
 * Démonstration complète des fonctionnalités multi-champs
 */
async function fullDemo() {
  console.log(
    "🚀 Démonstration du système multi-champs avec vectorisation batch\n"
  );

  // Étape 1: Indexation d'une résidence
  console.log("1️⃣ Indexation multi-champs simple...");
  await indexResidenceMultiField();
  console.log("");

  // Étape 2: Indexation batch
  console.log("2️⃣ Indexation batch multi-champs...");
  await batchIndexMultiField();
  console.log("");

  // Étape 3: Tests de recherche
  console.log("3️⃣ Tests de recherche multi-champs...");
  await searchMultiField();
  console.log("");

  // Étape 4: Stratégies avancées
  console.log("4️⃣ Stratégies de recherche avancées...");
  await demonstrateSearchStrategies();
  console.log("");

  console.log("✨ Démonstration terminée !");
  console.log("\n📋 Fonctionnalités démontrées:");
  console.log("- ✅ Indexation multi-champs avec poids");
  console.log("- ✅ Vectorisation batch avec fastEmbed");
  console.log("- ✅ Stockage sous _vector_[fieldName]");
  console.log("- ✅ Recherche pondérée multi-champs");
  console.log("- ✅ Fuzzy search configurable par champ");
  console.log("- ✅ Indexation batch optimisée");
}

// Export pour utilisation
export {
  batchIndexMultiField,
  demonstrateSearchStrategies,
  fullDemo,
  indexResidenceMultiField,
  searchMultiField,
};

// Auto-exécution si appelé directement
if (require.main === module) {
  fullDemo().catch(console.error);
}
