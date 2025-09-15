import type {
  CloudFunctionsConfig,
  SearchEngineInstanceConfig,
} from "./CloudFunctionsManager";
import type {
  SearchEnginesConfig,
  SearchEnginesInputConfig,
} from "./ConfigTypes";

/**
 * Charge la configuration depuis un module déjà importé (synchrone)
 *
 * @param config - Configuration déjà importée
 * @returns Configuration transformée pour CloudFunctionsManager
 *
 * @example
 * ```typescript
 * import searchConfig from './search-engines.config.js';
 *
 * const { globalConfig, instancesConfig } = loadConfigFromModule(searchConfig);
 * ```
 */
export function loadConfigFromModule(config: SearchEnginesInputConfig): {
  globalConfig: CloudFunctionsConfig;
  instancesConfig: SearchEngineInstanceConfig[];
} {
  if (!config) {
    throw new Error("Configuration manquante");
  }

  if (!config.globalConfig) {
    throw new Error("globalConfig manquant dans la configuration");
  }

  if (!config.searchEngines || typeof config.searchEngines !== "object") {
    throw new Error("searchEngines manquant ou invalide dans la configuration");
  }

  // Transformer la configuration globale (on ajoute les dépendances Firebase plus tard)
  const globalConfig: any = {
    ...config.globalConfig,
    // Les dépendances Firebase seront ajoutées par CloudFunctionsManager
    // Convertir l'API de recherche avancée en endpoint standard
    unifiedEndpoint: config.globalConfig.searchApi
      ? {
          enabled: config.globalConfig.searchApi.enabled,
          basePath: config.globalConfig.searchApi.basePath,
          instanceParam: config.globalConfig.searchApi.instanceParam,
          requireAuth: !!config.globalConfig.searchApi.authCallback,
          region: config.globalConfig.searchApi.region,
          allowedInstances: config.globalConfig.searchApi.allowedInstances,
        }
      : undefined,
  };

  // Transformer les instances
  const searchEnginesEntries = Object.entries(config.searchEngines);

  if (searchEnginesEntries.length === 0) {
    console.warn("⚠️ Aucun moteur de recherche configuré dans searchEngines");
  }

  const instancesConfig: SearchEngineInstanceConfig[] =
    searchEnginesEntries.map(([instanceId, engineConfig]) => {
      if (!instanceId || typeof instanceId !== "string") {
        throw new Error(`instanceId invalide: ${instanceId}`);
      }

      if (!engineConfig || typeof engineConfig !== "object") {
        throw new Error(
          `Configuration invalide pour l'instance "${instanceId}": ${engineConfig}`
        );
      }

      const { endpoints, ...restConfig } = engineConfig;

      const transformedInstance: SearchEngineInstanceConfig = {
        instanceId,
        ...restConfig,
        // Convertir les endpoints avancés en endpoints standards
        endpoints: endpoints
          ? {
              search: endpoints.search
                ? {
                    enabled: endpoints.search.enabled,
                    path: endpoints.search.path,
                    requireAuth: !!endpoints.search.authCallback,
                  }
                : undefined,
              callable: endpoints.callable
                ? {
                    enabled: endpoints.callable.enabled,
                    requireAuth: !!endpoints.callable.authCallback,
                  }
                : undefined,
            }
          : undefined,
      };

      return transformedInstance;
    });

  // Validation finale
  if (!Array.isArray(instancesConfig)) {
    throw new Error(
      "Erreur lors de la transformation: instancesConfig n'est pas un tableau"
    );
  }

  console.log(
    `✅ Configuration transformée: ${instancesConfig.length} instance(s) trouvée(s)`
  );
  instancesConfig.forEach((instance) => {
    console.log(
      `  - ${instance.instanceId}: collection="${instance.collection}"`
    );
  });

  return {
    globalConfig,
    instancesConfig,
  };
}

/**
 * Version synchrone simplifiée qui charge depuis un require/import direct
 *
 * @param configPath - Chemin vers le fichier de configuration (pour require)
 * @returns Configuration transformée
 *
 * @example
 * ```typescript
 * const { globalConfig, instancesConfig } = loadConfigSync('./search-engines.config.js');
 * ```
 */
export function loadConfigSync(configPath: string): {
  globalConfig: CloudFunctionsConfig;
  instancesConfig: SearchEngineInstanceConfig[];
} {
  try {
    // Utiliser require pour un chargement synchrone
    const configModule = require(configPath);
    const config: SearchEnginesInputConfig =
      configModule.default || configModule;

    return loadConfigFromModule(config);
  } catch (error) {
    throw new Error(
      `Erreur lors du chargement synchrone de la configuration: ${error}`
    );
  }
}

/**
 * Valide une configuration déjà chargée
 */
export function validateConfig(config: SearchEnginesConfig): void {
  if (!config.globalConfig) {
    throw new Error("Configuration globale manquante");
  }

  if (!config.searchEngines || Object.keys(config.searchEngines).length === 0) {
    throw new Error("Aucun moteur de recherche configuré");
  }

  // Validation de chaque instance
  for (const [instanceId, engineConfig] of Object.entries(
    config.searchEngines
  )) {
    if (!engineConfig.collection) {
      throw new Error(`Collection manquante pour le moteur "${instanceId}"`);
    }

    // Validation des triggers si présents
    if (engineConfig.triggers) {
      const hasAnyTrigger =
        engineConfig.triggers.onCreate ||
        engineConfig.triggers.onUpdate ||
        engineConfig.triggers.onDelete;

      if (hasAnyTrigger && !engineConfig.documentConfig) {
        throw new Error(
          `Configuration du document requise pour les triggers du moteur "${instanceId}"`
        );
      }

      if (hasAnyTrigger && !engineConfig.triggers.documentsPath) {
        throw new Error(
          `documentsPath requis pour les triggers du moteur "${instanceId}"`
        );
      }
    }
  }
}

/**
 * Charge et valide la configuration de manière synchrone
 */
export function loadAndValidateConfigSync(configPath: string): {
  globalConfig: CloudFunctionsConfig;
  instancesConfig: SearchEngineInstanceConfig[];
} {
  const result = loadConfigSync(configPath);

  // Valider la configuration transformée
  const configForValidation: SearchEnginesConfig = {
    globalConfig: result.globalConfig as any,
    searchEngines: result.instancesConfig.reduce((acc, instance) => {
      const { instanceId, ...rest } = instance;
      acc[instanceId] = rest as any;
      return acc;
    }, {} as any),
  };

  validateConfig(configForValidation);

  return result;
}
