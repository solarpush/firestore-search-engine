import { GeneratedFunctions } from "./CloudFunctionsManager";

/**
 * Helper pour extraire facilement des fonctions spécifiques du bundle généré
 * Évite d'avoir à connaître les noms exacts des fonctions générées
 */

/**
 * Extrait toutes les fonctions d'une instance spécifique
 */
export function extractInstanceFunctions(
  functions: GeneratedFunctions,
  instanceId: string,
  functionPrefix: string = "search"
): {
  http?: any;
  callable?: any;
  onCreate?: any;
  onUpdate?: any;
  onDelete?: any;
} {
  const capitalizedInstanceId =
    instanceId.charAt(0).toUpperCase() + instanceId.slice(1);
  const baseName = `${functionPrefix}${capitalizedInstanceId}`;

  return {
    http: functions[`${baseName}Http`],
    callable: functions[`${baseName}Callable`],
    onCreate: functions[`${baseName}OnCreate`],
    onUpdate: functions[`${baseName}OnUpdate`],
    onDelete: functions[`${baseName}OnDelete`],
  };
}

/**
 * Extrait seulement les fonctions HTTP de toutes les instances
 */
export function extractHttpFunctions(
  functions: GeneratedFunctions,
  functionPrefix: string = "search"
): Record<string, any> {
  const httpFunctions: Record<string, any> = {};

  Object.entries(functions).forEach(([functionName, functionImpl]) => {
    if (functionName.endsWith("Http")) {
      // Extraire l'instanceId du nom de la fonction
      const instanceId = functionName
        .replace(`${functionPrefix}`, "")
        .replace("Http", "")
        .toLowerCase();

      httpFunctions[instanceId] = functionImpl;
    }
  });

  return httpFunctions;
}

/**
 * Extrait seulement les fonctions callable de toutes les instances
 */
export function extractCallableFunctions(
  functions: GeneratedFunctions,
  functionPrefix: string = "search"
): Record<string, any> {
  const callableFunctions: Record<string, any> = {};

  Object.entries(functions).forEach(([functionName, functionImpl]) => {
    if (functionName.endsWith("Callable")) {
      const instanceId = functionName
        .replace(`${functionPrefix}`, "")
        .replace("Callable", "")
        .toLowerCase();

      callableFunctions[instanceId] = functionImpl;
    }
  });

  return callableFunctions;
}

/**
 * Extrait seulement les triggers Firestore de toutes les instances
 */
export function extractTriggerFunctions(
  functions: GeneratedFunctions,
  functionPrefix: string = "search"
): Record<string, { onCreate?: any; onUpdate?: any; onDelete?: any }> {
  const triggerFunctions: Record<
    string,
    { onCreate?: any; onUpdate?: any; onDelete?: any }
  > = {};

  Object.entries(functions).forEach(([functionName, functionImpl]) => {
    if (
      functionName.includes("OnCreate") ||
      functionName.includes("OnUpdate") ||
      functionName.includes("OnDelete")
    ) {
      let instanceId = functionName.replace(`${functionPrefix}`, "");
      let triggerType: "onCreate" | "onUpdate" | "onDelete";

      if (functionName.includes("OnCreate")) {
        instanceId = instanceId.replace("OnCreate", "");
        triggerType = "onCreate";
      } else if (functionName.includes("OnUpdate")) {
        instanceId = instanceId.replace("OnUpdate", "");
        triggerType = "onUpdate";
      } else {
        instanceId = instanceId.replace("OnDelete", "");
        triggerType = "onDelete";
      }

      instanceId = instanceId.toLowerCase();

      if (!triggerFunctions[instanceId]) {
        triggerFunctions[instanceId] = {};
      }

      triggerFunctions[instanceId][triggerType] = functionImpl;
    }
  });

  return triggerFunctions;
}

/**
 * Crée un export sélectif basé sur les besoins
 */
export function createSelectiveExport(
  functions: GeneratedFunctions,
  options: {
    instances?: string[];
    types?: ("http" | "callable" | "triggers")[];
    functionPrefix?: string;
  } = {}
): GeneratedFunctions {
  const { instances, types, functionPrefix = "search" } = options;
  const selectedFunctions: GeneratedFunctions = {};

  Object.entries(functions).forEach(([functionName, functionImpl]) => {
    // Si des instances spécifiques sont demandées
    if (instances && instances.length > 0) {
      const matchesInstance = instances.some((instanceId) => {
        const capitalizedInstanceId =
          instanceId.charAt(0).toUpperCase() + instanceId.slice(1);
        return functionName.includes(
          `${functionPrefix}${capitalizedInstanceId}`
        );
      });

      if (!matchesInstance) return;
    }

    // Si des types spécifiques sont demandés
    if (types && types.length > 0) {
      const matchesType = types.some((type) => {
        switch (type) {
          case "http":
            return functionName.endsWith("Http");
          case "callable":
            return functionName.endsWith("Callable");
          case "triggers":
            return (
              functionName.includes("OnCreate") ||
              functionName.includes("OnUpdate") ||
              functionName.includes("OnDelete")
            );
          default:
            return false;
        }
      });

      if (!matchesType) return;
    }

    selectedFunctions[functionName] = functionImpl;
  });

  return selectedFunctions;
}
