import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import {
  CloudFunctionsManager,
  createFirebaseFunctionsHost,
  loadAndValidateConfigSync,
} from "firestore-search-engine";
import { resolve } from "path";

/**
 * Utilisation SYNCHRONE - pas d'async/await nécessaire !
 */
function setupSearchFunctions() {
  try {
    console.log("🔧 Configuration synchrone des fonctions de recherche...");

    // Chargement SYNCHRONE de la configuration
    const configPath = resolve("./search-engines-sync.config.js");
    const { globalConfig, instancesConfig } =
      loadAndValidateConfigSync(configPath);

    console.log("✅ Configuration chargée synchrone:", {
      instances: instancesConfig.map((i) => i.instanceId),
      count: instancesConfig.length,
    });

    // Créer le gestionnaire avec injection des dépendances Firebase
    const manager = new CloudFunctionsManager({
      ...globalConfig,
      firestoreInstance: getFirestore(),
      fieldValueInstance: admin.firestore.FieldValue,
      firebaseFunctions: createFirebaseFunctionsHost(),
    });

    // Génération SYNCHRONE des fonctions
    const autoExports = manager.generateAutoExports(instancesConfig);

    console.log("🚀 Fonctions générées:", Object.keys(autoExports.functions));
    console.log("📦 Utilitaires:", Object.keys(autoExports.utils));

    return autoExports;
  } catch (error) {
    console.error("❌ Erreur lors de la configuration:", error);
    throw error;
  }
}

// Export direct - pas de Promise !
export const searchFunctions = setupSearchFunctions();

/* 
🎯 AVANTAGES DE LA VERSION SYNCHRONE :

✅ Pas d'async/await requis
✅ Fonctionne avec require() et import
✅ Chargement instantané au démarrage
✅ Compatible avec Firebase Functions emulator
✅ Pas de problèmes d'import dynamique

📋 FONCTIONS GÉNÉRÉES :

- searchResidence (endpoint HTTP)
- searchResidenceCallable (callable function)  
- searchTriggerResidenceOnCreate (trigger création)
- searchTriggerResidenceOnUpdate (trigger modification)
- searchTriggerResidenceOnDelete (trigger suppression)
- searchApi (API de recherche avec middlewares)

🌐 ENDPOINT UNIFIÉ :

GET /searchApi?type=residence&searchValue=villa&limit=10
POST /searchApi 
Body: { "type": "residence", "searchValue": "appartement", "limit": 5 }

🛠️ ROUTES ADDITIONNELLES :

GET /searchApi/health - Status du service
GET /searchApi/info - Documentation

💡 UTILISATION DANS VOTRE PROJET :

const configPath = resolve("./search-engines-sync.config.js")
const {globalConfig, instancesConfig} = loadAndValidateConfigSync(configPath) // ✅ SYNCHRONE !
const manager = new CloudFunctionsManager({
  ...globalConfig,
  firestoreInstance: getFirestore(),
  fieldValueInstance: admin.firestore.FieldValue,
  firebaseFunctions: createFirebaseFunctionsHost(),
})

const autoExports = manager.generateAutoExports(instancesConfig)
*/
