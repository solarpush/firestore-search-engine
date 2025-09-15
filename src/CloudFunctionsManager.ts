import type { Firestore } from "@google-cloud/firestore";
import { firestore } from "firebase-admin";
import type { CallableRequest } from "firebase-functions/https";
import type { EventHandlerOptions } from "firebase-functions/options";
import type { SearchApiConfig } from "./ConfigTypes";
import { FirestoreSearchEngine } from "./FirestoreSearchEngine";
import type {
  FirestoreSearchEngineConfig,
  PathWithSubCollectionsMaxDepth4,
} from "./index";

/**
 * Type pour les fonctions Firebase Functions fournies par l'hôte
 */
export interface FirebaseFunctionsHost {
  onDocumentCreated: any;
  onDocumentUpdated: any;
  onDocumentDeleted: any;
  onCall: any;
  onRequest: any;
}

/**
 * Configuration pour une instance de moteur de recherche
 */
export interface SearchEngineInstanceConfig
  extends FirestoreSearchEngineConfig {
  /**
   * Identifiant unique de l'instance
   */
  instanceId: string;

  /**
   * Nom de la collection à indexer
   */
  collection: string;

  /**
   * Configuration du document à indexer
   */
  documentConfig?: {
    indexedKey: string;
    returnedKeys: string[];
    documentsPath: PathWithSubCollectionsMaxDepth4;
  };

  /**
   * Configuration des endpoints
   */
  endpoints?: {
    search?: {
      enabled: boolean;
      path?: string;
      requireAuth?: boolean;
    };
    callable?: {
      enabled: boolean;
      requireAuth?: boolean;
    };
  };

  /**
   * Configuration des triggers Firestore
   */
  triggers?: {
    onCreate?: boolean;
    onUpdate?: boolean;
    onDelete?: boolean;
    documentsPath?: PathWithSubCollectionsMaxDepth4;
  };

  /**
   * Options pour les event handlers
   */
  eventHandlerOptions?: EventHandlerOptions;
}

/**
 * Configuration pour un endpoint unifié
 */
export interface UnifiedEndpointConfig {
  /**
   * Si l'endpoint unifié est activé
   */
  enabled: boolean;

  /**
   * Chemin de base pour l'endpoint unifié (ex: "/search")
   */
  basePath?: string;

  /**
   * Nom du paramètre pour identifier l'instance (ex: "type")
   */
  instanceParam?: string;

  /**
   * Si l'authentification est requise
   */
  requireAuth?: boolean;

  /**
   * Région pour déployer l'endpoint unifié
   */
  region?: string;

  /**
   * Liste des instances autorisées pour cet endpoint unifié
   */
  allowedInstances?: string[];
}

/**
 * Configuration globale pour le gestionnaire de Cloud Functions
 */
export interface CloudFunctionsConfig {
  /**
   * Instance Firestore partagée
   */
  firestoreInstance: Firestore;

  /**
   * Instance FieldValue partagée
   */
  fieldValueInstance: typeof firestore.FieldValue;

  /**
   * Fonctions Firebase Functions fournies par l'hôte
   */
  firebaseFunctions: FirebaseFunctionsHost;

  /**
   * Préfixe pour les noms de fonctions
   */
  functionPrefix?: string;

  /**
   * Région par défaut pour les fonctions
   */
  defaultRegion?: string;

  /**
   * Configuration par défaut appliquée à toutes les instances
   */
  defaultConfig?: Partial<SearchEngineInstanceConfig>;

  /**
   * Configuration pour l'endpoint unifié
   */
  unifiedEndpoint?: UnifiedEndpointConfig;

  /**
   * Configuration de l'API de recherche (nouvelle version)
   */
  searchApi?: SearchApiConfig;
}

/**
 * Type pour les fonctions générées
 */
export interface GeneratedFunctions {
  [functionName: string]: any;
}

/**
 * Interface pour les exports automatiques
 */
export interface AutoExports {
  functions: GeneratedFunctions;
  manager: CloudFunctionsManager;
  utils: {
    searchInEngine: (
      engineId: string,
      query: string,
      options?: { limit?: number; distanceThreshold?: number }
    ) => Promise<any>;
    indexAllInEngine: (
      engineId: string,
      collectionPath: string
    ) => Promise<any>;
    clearEngineIndexes: (engineId: string) => Promise<any>;
    getEngineStats: (engineId: string) => Promise<any>;
    getAllEnginesStats: () => Promise<any>;
  };
}

/**
 * Gestionnaire de Cloud Functions pour Firestore Search Engine
 *
 * @example
 * ```typescript
 * import {
 *   onDocumentCreated,
 *   onDocumentUpdated,
 *   onDocumentDeleted
 * } from "firebase-functions/v2/firestore";
 * import { onCall, onRequest } from "firebase-functions/v2/https";
 *
 * const functionsManager = new CloudFunctionsManager({
 *   firestoreInstance: firestore(),
 *   fieldValueInstance: firestore.FieldValue,
 *   firebaseFunctions: {
 *     onDocumentCreated,
 *     onDocumentUpdated,
 *     onDocumentDeleted,
 *     onCall,
 *     onRequest
 *   },
 *   functionPrefix: 'search',
 *   defaultRegion: 'europe-west3'
 * });
 *
 * const functions = functionsManager.generateFunctions([
 *   {
 *     instanceId: 'users',
 *     collection: 'users_search_index',
 *     documentConfig: {
 *       indexedKey: 'name',
 *       returnedKeys: ['email', 'avatar'],
 *       documentsPath: 'users/{userId}'
 *     },
 *     endpoints: {
 *       search: { enabled: true, path: '/users/search' },
 *       callable: { enabled: true, requireAuth: true }
 *     },
 *     triggers: {
 *       onCreate: true,
 *       onUpdate: true,
 *       onDelete: true,
 *       documentsPath: 'users/{userId}'
 *     }
 *   },
 *   {
 *     instanceId: 'products',
 *     collection: 'products_search_index',
 *     documentConfig: {
 *       indexedKey: 'title',
 *       returnedKeys: ['price', 'category'],
 *       documentsPath: 'products/{productId}'
 *     }
 *   }
 * ]);
 *
 * export const {
 *   searchUsersHttp,
 *   searchUsersCallable,
 *   searchUsersOnCreate,
 *   searchUsersOnUpdate,
 *   searchUsersOnDelete,
 *   searchProductsHttp,
 *   searchProductsCallable
 * } = functions;
 * ```
 */
export class CloudFunctionsManager {
  private instances: Map<string, FirestoreSearchEngine> = new Map();

  constructor(private readonly config: CloudFunctionsConfig) {}

  /**
   * Génère toutes les Cloud Functions basées sur la configuration
   */
  generateFunctions(
    instancesConfig: SearchEngineInstanceConfig[]
  ): GeneratedFunctions {
    const functions: GeneratedFunctions = {};

    // Validation robuste du paramètre
    if (!instancesConfig) {
      throw new Error("instancesConfig est requis pour generateFunctions");
    }

    if (!Array.isArray(instancesConfig)) {
      throw new Error(
        `instancesConfig doit être un tableau, reçu: ${typeof instancesConfig}. ` +
          `Valeur: ${JSON.stringify(instancesConfig)}`
      );
    }

    if (instancesConfig.length === 0) {
      console.warn("⚠️ Aucune instance de moteur de recherche configurée");
      return functions;
    }

    // Créer les instances de moteurs de recherche
    for (const instanceConfig of instancesConfig) {
      if (!instanceConfig || typeof instanceConfig !== "object") {
        throw new Error(
          `Configuration d'instance invalide: ${JSON.stringify(instanceConfig)}`
        );
      }

      if (!instanceConfig.instanceId) {
        throw new Error(
          `instanceId manquant dans la configuration: ${JSON.stringify(
            instanceConfig
          )}`
        );
      }

      this.createSearchEngineInstance(instanceConfig);
    }

    // Générer les fonctions pour chaque instance
    for (const instanceConfig of instancesConfig) {
      const instanceFunctions = this.generateInstanceFunctions(instanceConfig);
      Object.assign(functions, instanceFunctions);
    }

    // Générer l'endpoint unifié si configuré
    if (
      this.config.unifiedEndpoint?.enabled ||
      this.config.searchApi?.enabled
    ) {
      const unifiedFunction = this.createUnifiedEndpoint(instancesConfig);
      if (unifiedFunction) {
        const unifiedFunctionName = this.getUnifiedFunctionName();
        functions[unifiedFunctionName] = unifiedFunction;
      }
    }

    return functions;
  }

  /**
   * Génère automatiquement tous les exports (fonctions + utilitaires)
   * Cette méthode évite d'avoir à exporter manuellement chaque fonction
   */
  generateAutoExports(
    instancesConfig: SearchEngineInstanceConfig[]
  ): AutoExports {
    // Validation robuste du paramètre
    if (!instancesConfig) {
      throw new Error("instancesConfig est requis pour generateAutoExports");
    }

    if (!Array.isArray(instancesConfig)) {
      throw new Error(
        `generateAutoExports: instancesConfig doit être un tableau, reçu: ${typeof instancesConfig}. ` +
          `Valeur: ${JSON.stringify(instancesConfig)}`
      );
    }

    const functions = this.generateFunctions(instancesConfig);

    return {
      functions,
      manager: this,
      utils: {
        searchInEngine: this.createSearchUtility(),
        indexAllInEngine: this.createIndexUtility(instancesConfig),
        clearEngineIndexes: this.createClearUtility(instancesConfig),
        getEngineStats: this.createStatsUtility(instancesConfig),
        getAllEnginesStats: this.createAllStatsUtility(instancesConfig),
      },
    };
  }

  /**
   * Crée une fonction utilitaire pour la recherche
   */
  private createSearchUtility() {
    return async (
      engineId: string,
      query: string,
      options?: { limit?: number; distanceThreshold?: number }
    ) => {
      const engine = this.getInstance(engineId);
      if (!engine) {
        throw new Error(`Moteur de recherche "${engineId}" non trouvé`);
      }

      return await engine.search({
        fieldValue: query,
        limit: options?.limit || 10,
        distanceThreshold: options?.distanceThreshold,
      });
    };
  }

  /**
   * Crée une fonction utilitaire pour l'indexation
   */
  private createIndexUtility(instancesConfig: SearchEngineInstanceConfig[]) {
    return async (engineId: string, collectionPath: string) => {
      const engine = this.getInstance(engineId);
      if (!engine) {
        throw new Error(`Moteur de recherche "${engineId}" non trouvé`);
      }

      const instanceConfig = instancesConfig.find(
        (config) => config.instanceId === engineId
      );
      if (!instanceConfig?.documentConfig) {
        throw new Error(
          `Configuration du document non trouvée pour "${engineId}"`
        );
      }

      const { indexedKey, returnedKeys } = instanceConfig.documentConfig;

      const documentsSnapshot = await this.config.firestoreInstance
        .collection(collectionPath)
        .get();
      const documentsToIndex = documentsSnapshot.docs.map((doc) => ({
        indexedDocumentPath: doc.ref.path,
        ...doc.data(),
      }));

      return await engine.indexesAll({
        documentProps: {
          indexedKey,
          returnedKey: returnedKeys,
        },
        documentsToIndexes: documentsToIndex,
      });
    };
  }

  /**
   * Crée une fonction utilitaire pour nettoyer les index
   */
  private createClearUtility(instancesConfig: SearchEngineInstanceConfig[]) {
    return async (engineId: string) => {
      const instanceConfig = instancesConfig.find(
        (config) => config.instanceId === engineId
      );
      if (!instanceConfig) {
        throw new Error(`Configuration non trouvée pour "${engineId}"`);
      }

      const batch = this.config.firestoreInstance.batch();
      const indexCollection = this.config.firestoreInstance.collection(
        instanceConfig.collection
      );
      const snapshot = await indexCollection.get();

      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      return await batch.commit();
    };
  }

  /**
   * Crée une fonction utilitaire pour les statistiques d'un moteur
   */
  private createStatsUtility(instancesConfig: SearchEngineInstanceConfig[]) {
    return async (engineId: string) => {
      const instanceConfig = instancesConfig.find(
        (config) => config.instanceId === engineId
      );
      if (!instanceConfig) {
        throw new Error(`Configuration non trouvée pour "${engineId}"`);
      }

      const indexCollection = this.config.firestoreInstance.collection(
        instanceConfig.collection
      );
      const snapshot = await indexCollection.get();

      return {
        engineId,
        collection: instanceConfig.collection,
        totalIndexes: snapshot.size,
        config: instanceConfig,
      };
    };
  }

  /**
   * Crée une fonction utilitaire pour les statistiques globales
   */
  private createAllStatsUtility(instancesConfig: SearchEngineInstanceConfig[]) {
    return async () => {
      const statsPromises = instancesConfig.map((config) =>
        this.createStatsUtility(instancesConfig)(config.instanceId)
      );
      const stats = await Promise.all(statsPromises);

      return {
        totalEngines: stats.length,
        totalIndexes: stats.reduce((sum, stat) => sum + stat.totalIndexes, 0),
        engines: stats,
      };
    };
  }

  /**
   * Crée une instance de FirestoreSearchEngine
   */
  private createSearchEngineInstance(
    instanceConfig: SearchEngineInstanceConfig
  ): void {
    const mergedConfig = {
      ...this.config.defaultConfig,
      ...instanceConfig,
    };

    const searchEngine = new FirestoreSearchEngine(
      this.config.firestoreInstance,
      mergedConfig,
      this.config.fieldValueInstance
    );

    this.instances.set(instanceConfig.instanceId, searchEngine);
  }

  /**
   * Génère les fonctions pour une instance spécifique
   */
  private generateInstanceFunctions(
    instanceConfig: SearchEngineInstanceConfig
  ): GeneratedFunctions {
    const functions: GeneratedFunctions = {};
    const searchEngine = this.instances.get(instanceConfig.instanceId);

    if (!searchEngine) {
      throw new Error(
        `Search engine instance "${instanceConfig.instanceId}" not found`
      );
    }

    const functionNamePrefix = this.getFunctionName(instanceConfig.instanceId);

    // Générer les endpoints HTTP
    if (instanceConfig.endpoints?.search?.enabled) {
      functions[`${functionNamePrefix}`] = this.createHttpFunction(
        searchEngine,
        instanceConfig
      );
    }

    // Générer les callable functions
    if (instanceConfig.endpoints?.callable?.enabled) {
      functions[`${functionNamePrefix}Callable`] = this.createCallableFunction(
        searchEngine,
        instanceConfig
      );
    }

    // Générer les triggers Firestore
    if (instanceConfig.triggers) {
      const triggerFunctions = this.createTriggerFunctions(
        searchEngine,
        instanceConfig
      );
      Object.assign(functions, triggerFunctions);
    }

    return functions;
  }

  /**
   * Crée une fonction HTTP
   */
  private createHttpFunction(
    searchEngine: FirestoreSearchEngine,
    instanceConfig: SearchEngineInstanceConfig
  ) {
    const region =
      instanceConfig.eventHandlerOptions?.region || this.config.defaultRegion;

    return this.config.firebaseFunctions.onRequest(
      { region },
      searchEngine.onRequestWrapped()
    );
  }

  /**
   * Crée une callable function
   */
  private createCallableFunction(
    searchEngine: FirestoreSearchEngine,
    instanceConfig: SearchEngineInstanceConfig
  ) {
    const region =
      instanceConfig.eventHandlerOptions?.region || this.config.defaultRegion;
    const requireAuth =
      instanceConfig.endpoints?.callable?.requireAuth ?? false;

    const authCallback = requireAuth
      ? (auth: CallableRequest["auth"]) => !!auth?.uid
      : () => true;

    return this.config.firebaseFunctions.onCall(
      { region },
      searchEngine.onCallWrapped(authCallback)
    );
  }

  /**
   * Crée les fonctions trigger Firestore
   */
  private createTriggerFunctions(
    searchEngine: FirestoreSearchEngine,
    instanceConfig: SearchEngineInstanceConfig
  ): GeneratedFunctions {
    const functions: GeneratedFunctions = {};
    const functionNamePrefix = this.getFunctionName(instanceConfig.instanceId);
    const { triggers, documentConfig, eventHandlerOptions } = instanceConfig;

    if (!documentConfig || !triggers?.documentsPath) {
      return functions;
    }

    const documentsPath = triggers.documentsPath;
    const docProps = {
      indexedKey: documentConfig.indexedKey,
      returnedKey: documentConfig.returnedKeys,
    };

    const config = {
      wordMaxLength: instanceConfig.wordMaxLength,
      wordMinLength: instanceConfig.wordMinLength,
    };

    if (triggers.onCreate) {
      functions[
        `searchTrigger${
          instanceConfig.instanceId.charAt(0).toUpperCase() +
          instanceConfig.instanceId.slice(1)
        }OnCreate`
      ] = searchEngine.onDocumentWriteWrapper(
        this.config.firebaseFunctions.onDocumentCreated,
        docProps,
        documentsPath,
        config,
        eventHandlerOptions
      );
    }

    if (triggers.onUpdate) {
      functions[
        `searchTrigger${
          instanceConfig.instanceId.charAt(0).toUpperCase() +
          instanceConfig.instanceId.slice(1)
        }OnUpdate`
      ] = searchEngine.onDocumentUpdateWrapper(
        this.config.firebaseFunctions.onDocumentUpdated,
        docProps,
        documentsPath,
        config,
        eventHandlerOptions
      );
    }

    if (triggers.onDelete) {
      functions[
        `searchTrigger${
          instanceConfig.instanceId.charAt(0).toUpperCase() +
          instanceConfig.instanceId.slice(1)
        }OnDelete`
      ] = searchEngine.onDocumentDeletedWrapper(
        this.config.firebaseFunctions.onDocumentDeleted,
        documentsPath,
        eventHandlerOptions
      );
    }

    return functions;
  }

  /**
   * Génère le nom de fonction basé sur l'instanceId
   */
  private getFunctionName(instanceId: string): string {
    // Pas de préfixe, juste le nom de l'instance capitalisé
    const capitalizedInstanceId =
      instanceId.charAt(0).toUpperCase() + instanceId.slice(1);
    return `search${capitalizedInstanceId}`;
  }

  /**
   * Récupère une instance de moteur de recherche
   */
  getInstance(instanceId: string): FirestoreSearchEngine | undefined {
    return this.instances.get(instanceId);
  }

  /**
   * Liste toutes les instances disponibles
   */
  listInstances(): string[] {
    return Array.from(this.instances.keys());
  }

  /**
   * Crée un endpoint unifié Express qui route vers différentes instances
   */
  private createUnifiedEndpoint(instancesConfig: SearchEngineInstanceConfig[]) {
    // Vérifier quelle configuration utiliser
    const unifiedConfig = this.config.searchApi || this.config.unifiedEndpoint;
    if (!unifiedConfig?.enabled) {
      return null;
    }

    const instanceParam = unifiedConfig.instanceParam || "type";
    const region =
      unifiedConfig.region || this.config.defaultRegion || "us-central1";
    const allowedInstances =
      unifiedConfig.allowedInstances ||
      instancesConfig.map((config) => config.instanceId);

    // Récupérer les callbacks et middlewares avancés si disponibles
    const searchApiConfig = this.config.searchApi;
    const authCallback = searchApiConfig?.authCallback;
    const expressConfig = searchApiConfig?.express;
    const errorResponses = searchApiConfig?.errorResponses;

    return this.config.firebaseFunctions.onRequest(
      {
        region,
        cors: true,
      },
      async (req: any, res: any) => {
        try {
          // Appliquer le middleware CORS si configuré
          if (expressConfig?.corsMiddleware) {
            await new Promise<void>((resolve, reject) => {
              expressConfig.corsMiddleware!(req, res, (error?: any) => {
                if (error) reject(error);
                else resolve();
              });
            });
          }

          // Appliquer le middleware de logging si configuré
          if (expressConfig?.loggingMiddleware) {
            await new Promise<void>((resolve, reject) => {
              expressConfig.loggingMiddleware!(req, res, (error?: any) => {
                if (error) reject(error);
                else resolve();
              });
            });
          }

          // Appliquer les middlewares personnalisés dans l'ordre
          if (expressConfig?.middlewares) {
            for (const middleware of expressConfig.middlewares) {
              await new Promise<void>((resolve, reject) => {
                const result = middleware(req, res, (error?: any) => {
                  if (error) reject(error);
                  else resolve();
                });

                // Si le middleware retourne une Promise, l'attendre
                if (result instanceof Promise) {
                  result.then(() => resolve()).catch(reject);
                }
              });
            }
          }

          // Appliquer le middleware de validation si configuré
          if (expressConfig?.validationMiddleware) {
            await new Promise<void>((resolve, reject) => {
              expressConfig.validationMiddleware!(req, res, (error?: any) => {
                if (error) reject(error);
                else resolve();
              });
            });
          }

          // Gérer les routes personnalisées
          if (expressConfig?.customRoutes) {
            const customRoute = expressConfig.customRoutes[req.path];
            if (customRoute) {
              await customRoute(req, res);
              return;
            }
          }

          // Support pour les méthodes GET et POST
          const instanceId =
            req.method === "GET"
              ? req.query[instanceParam]
              : req.body?.[instanceParam];

          const searchValue =
            req.method === "GET"
              ? req.query.searchValue || req.query.query
              : req.body?.searchValue || req.body?.query;

          // Validation des paramètres
          if (!instanceId) {
            const errorResponse = errorResponses?.badRequest || {
              status: 400,
              message: `Paramètre '${instanceParam}' requis`,
            };
            res.status(errorResponse.status).json({
              error: errorResponse.message,
              availableInstances: allowedInstances,
            });
            return;
          }

          if (!searchValue) {
            const errorResponse = errorResponses?.badRequest || {
              status: 400,
              message: "Paramètre 'searchValue' ou 'query' requis",
            };
            res.status(errorResponse.status).json({
              error: errorResponse.message,
            });
            return;
          }

          // Vérifier si l'instance est autorisée
          if (!allowedInstances.includes(instanceId)) {
            const errorResponse = errorResponses?.badRequest || {
              status: 400,
              message: `Instance '${instanceId}' non autorisée`,
            };
            res.status(errorResponse.status).json({
              error: errorResponse.message,
              availableInstances: allowedInstances,
            });
            return;
          }

          // Authentification avec callback personnalisé
          if (authCallback) {
            // Simuler un objet auth pour le callback
            const authObject = {
              uid: req.headers["x-user-id"], // Exemple
              token: req.headers.authorization
                ? {
                    role: req.headers["x-user-role"], // Exemple
                  }
                : undefined,
            };

            const isAuthorized = await authCallback(authObject as any);
            if (!isAuthorized) {
              const errorResponse = errorResponses?.unauthorized || {
                status: 401,
                message: "Accès non autorisé",
              };
              res.status(errorResponse.status).json({
                error: errorResponse.message,
              });
              return;
            }
          }

          // Appliquer le middleware d'authentification Express si configuré
          if (expressConfig?.authMiddleware) {
            await new Promise<void>((resolve, reject) => {
              expressConfig.authMiddleware!(req, res, (error?: any) => {
                if (error) reject(error);
                else resolve();
              });
            });
          }

          // Récupérer l'instance de moteur de recherche
          const searchEngine = this.instances.get(instanceId);
          if (!searchEngine) {
            const errorResponse = errorResponses?.notFound || {
              status: 404,
              message: `Instance '${instanceId}' non trouvée`,
            };
            res.status(errorResponse.status).json({
              error: errorResponse.message,
              availableInstances: allowedInstances,
            });
            return;
          }

          // Effectuer la recherche
          const searchParams = {
            fieldValue: searchValue,
            limit:
              req.method === "GET"
                ? parseInt(req.query.limit) || 10
                : req.body?.limit || 10,
            distanceThreshold:
              req.method === "GET"
                ? parseFloat(req.query.distanceThreshold)
                : req.body?.distanceThreshold,
          };

          const results = await searchEngine.search(searchParams);

          res.status(200).json({
            success: true,
            instance: instanceId,
            results: results,
            totalResults: results.length,
          });
        } catch (error) {
          console.error("Erreur endpoint unifié:", error);
          const errorResponse = errorResponses?.serverError || {
            status: 500,
            message: "Erreur interne du serveur",
          };
          res.status(errorResponse.status).json({
            error: errorResponse.message,
            message: error instanceof Error ? error.message : "Erreur inconnue",
          });
        }
      }
    );
  }

  /**
   * Génère le nom de la fonction pour l'endpoint unifié
   */
  private getUnifiedFunctionName(): string {
    return "searchApi";
  }
}
