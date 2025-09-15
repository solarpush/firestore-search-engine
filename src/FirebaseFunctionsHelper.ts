import type { FirebaseFunctionsHost } from "./CloudFunctionsManager";

/**
 * Helper pour créer l'objet FirebaseFunctionsHost automatiquement
 * avec les imports Firebase Functions v2
 *
 * @example
 * ```typescript
 * import { createFirebaseFunctionsHost } from "./FirebaseFunctionsHelper";
 * import { CloudFunctionsManager } from "./CloudFunctionsManager";
 *
 * const manager = new CloudFunctionsManager({
 *   firestoreInstance: firestore(),
 *   fieldValueInstance: firestore.FieldValue,
 *   firebaseFunctions: createFirebaseFunctionsHost(),
 *   // ... autres configs
 * });
 * ```
 */
export function createFirebaseFunctionsHost(): FirebaseFunctionsHost {
  // Imports dynamiques pour éviter les erreurs si les packages ne sont pas installés
  try {
    const {
      onDocumentCreated,
      onDocumentUpdated,
      onDocumentDeleted,
    } = require("firebase-functions/v2/firestore");

    const { onCall, onRequest } = require("firebase-functions/v2/https");

    return {
      onDocumentCreated,
      onDocumentUpdated,
      onDocumentDeleted,
      onCall,
      onRequest,
    };
  } catch (error) {
    throw new Error(
      `Impossible d'importer les fonctions Firebase Functions. ` +
        `Assurez-vous que le package 'firebase-functions' est installé. ` +
        `Erreur: ${error}`
    );
  }
}

/**
 * Helper pour créer un host personnalisé avec seulement certaines fonctions
 * Utile pour les tests ou des environnements spécifiques
 */
export function createCustomFirebaseFunctionsHost(
  customFunctions: Partial<FirebaseFunctionsHost>
): FirebaseFunctionsHost {
  const defaultHost = createFirebaseFunctionsHost();

  return {
    ...defaultHost,
    ...customFunctions,
  };
}

/**
 * Helper pour créer un mock host pour les tests
 */
export function createMockFirebaseFunctionsHost(): FirebaseFunctionsHost {
  const mockFunction = () => () => {};

  return {
    onDocumentCreated: mockFunction,
    onDocumentUpdated: mockFunction,
    onDocumentDeleted: mockFunction,
    onCall: mockFunction,
    onRequest: mockFunction,
  };
}
