# 🚨 Guide de résolution de l'erreur "e is not iterable"

## Problème

```
TypeError: e is not iterable
    at exports.CloudFunctionsManager.generateFunctions
```

## Cause

Le paramètre `instancesConfig` passé à `generateFunctions()` n'est pas un tableau.

## Solutions

### 1. 🔍 Diagnostic avec ConfigDebugger (RECOMMANDÉ)

```typescript
import { ConfigDebugger } from "firestore-search-engine";

// Debug de votre configuration
try {
  ConfigDebugger.debugConfig(instancesConfig, "Mon projet");
} catch (error) {
  console.error("Problème détecté:", error.message);
}
```

### 2. ✅ Solution avec loadConfigFromTS

```typescript
import {
  CloudFunctionsManager,
  ConfigDebugger,
  loadConfigFromTS,
} from "firestore-search-engine";

async function setupFunctions() {
  // Injection des dépendances Firebase
  const dependencies = {
    firestoreInstance: getFirestore(),
    fieldValueInstance: FieldValue,
    firebaseFunctions: {
      onDocumentCreated,
      onDocumentUpdated,
      onDocumentDeleted,
      onCall,
      onRequest,
    },
  };

  // Chargement avec debugging
  const configResult = await loadConfigFromTS(
    "./search-engines.config.js",
    dependencies
  );
  const { globalConfig, instancesConfig } =
    ConfigDebugger.debugConfigLoading(configResult);

  const manager = new CloudFunctionsManager(globalConfig);

  // Génération sécurisée
  return ConfigDebugger.safeGenerateAutoExports(manager, instancesConfig);
}
```

### 3. ✅ Solution avec tableau direct

```typescript
const instancesConfig = [
  {
    instanceId: "users",
    collection: "users_search_index",
    documentConfig: {
      indexedKey: "displayName",
      returnedKeys: ["email"],
      documentsPath: "users/{userId}",
    },
    endpoints: { search: { enabled: true } },
    triggers: { onCreate: true },
  },
];

const manager = new CloudFunctionsManager(globalConfig);
const autoExports = ConfigDebugger.safeGenerateAutoExports(
  manager,
  instancesConfig
);
```

### 4. ✅ Factory function (évite les problèmes Firebase)

```javascript
// search-engines.config.js
export default function createConfig(dependencies) {
  const { firestoreInstance, fieldValueInstance, firebaseFunctions } =
    dependencies;

  return {
    globalConfig: {
      firestoreInstance,
      fieldValueInstance,
      firebaseFunctions,
      functionPrefix: "search",
    },
    searchEngines: {
      users: {
        collection: "users_search_index",
        // ... configuration
      },
    },
  };
}
```

## Debugging step by step

### Étape 1: Vérifier le type de instancesConfig

```typescript
console.log("Type:", typeof instancesConfig);
console.log("Est un tableau:", Array.isArray(instancesConfig));
console.log("Longueur:", instancesConfig?.length);
```

### Étape 2: Vérifier la structure

```typescript
if (
  instancesConfig &&
  typeof instancesConfig === "object" &&
  !Array.isArray(instancesConfig)
) {
  console.log("Keys:", Object.keys(instancesConfig));

  // Peut-être avez-vous passé l'objet complet au lieu du tableau ?
  if (instancesConfig.instancesConfig) {
    console.log("✅ Found nested instancesConfig");
    // Utilisez instancesConfig.instancesConfig à la place
  }
}
```

### Étape 3: Validation avec ConfigDebugger

```typescript
import { ConfigDebugger } from "firestore-search-engine";

try {
  const validated = ConfigDebugger.debugConfig(instancesConfig, "Debug");
  console.log("✅ Configuration valide");
} catch (error) {
  console.error("❌ Configuration invalide:", error.message);
}
```

## Erreurs courantes

### ❌ Passer l'objet complet au lieu du tableau

```typescript
// INCORRECT
const config = await loadConfigFromTS("./config.js");
manager.generateFunctions(config); // ❌ config est un objet

// CORRECT
const { instancesConfig } = await loadConfigFromTS("./config.js");
manager.generateFunctions(instancesConfig); // ✅ instancesConfig est un tableau
```

### ❌ Problème d'initialisation Firebase

```typescript
// INCORRECT - Firebase pas initialisé
const config = {
  globalConfig: {
    firestoreInstance: getFirestore(), // ❌ Erreur si Firebase pas initialisé
  },
};

// CORRECT - Factory function
export default function (dependencies) {
  return {
    globalConfig: {
      firestoreInstance: dependencies.firestoreInstance, // ✅ Injecté
    },
  };
}
```

### ❌ Configuration malformée

```typescript
// INCORRECT
const instancesConfig = {
  users: { collection: "users" }, // ❌ Objet au lieu de tableau
};

// CORRECT
const instancesConfig = [
  { instanceId: "users", collection: "users" }, // ✅ Tableau avec instanceId
];
```

## Test rapide

```typescript
// Ajoutez ceci dans votre code pour tester
console.log("🔍 Test configuration:");
console.log("instancesConfig type:", typeof instancesConfig);
console.log("instancesConfig is array:", Array.isArray(instancesConfig));
console.log("instancesConfig length:", instancesConfig?.length);
console.log("First item:", instancesConfig?.[0]);
```

## Support

Si le problème persiste:

1. Utilisez `ConfigDebugger.debugConfig()`
2. Vérifiez que votre configuration suit la structure attendue
3. Assurez-vous que Firebase est correctement initialisé
