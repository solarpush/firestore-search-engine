import type { NextFunction, Request, Response } from "express";
import type { CallableRequest } from "firebase-functions/https";
import type {
  CloudFunctionsConfig,
  SearchEngineInstanceConfig,
  UnifiedEndpointConfig,
} from "./CloudFunctionsManager";
import type { PathWithSubCollectionsMaxDepth4 } from "./index";

/**
 * Middleware d'authentification pour Express
 */
export type AuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

/**
 * Callback d'authentification pour les callable functions
 */
export type AuthCallback = (
  auth: CallableRequest["auth"]
) => boolean | Promise<boolean>;

/**
 * Configuration Express pour l'API de recherche
 */
export interface ExpressConfig {
  /**
   * Middleware d'authentification personnalisé
   */
  authMiddleware?: AuthMiddleware;

  /**
   * Middleware CORS personnalisé
   */
  corsMiddleware?: (req: Request, res: Response, next: NextFunction) => void;

  /**
   * Middlewares personnalisés à appliquer dans l'ordre
   */
  middlewares?: Array<
    (req: Request, res: Response, next: NextFunction) => void | Promise<void>
  >;

  /**
   * Middleware de logging personnalisé
   */
  loggingMiddleware?: (req: Request, res: Response, next: NextFunction) => void;

  /**
   * Middleware de validation personnalisé
   */
  validationMiddleware?: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => void;

  /**
   * Configuration des routes personnalisées
   */
  customRoutes?: {
    [path: string]: (req: Request, res: Response) => void | Promise<void>;
  };
}

/**
 * Configuration avancée pour l'API de recherche
 */
export interface SearchApiConfig
  extends Omit<UnifiedEndpointConfig, "requireAuth"> {
  /**
   * Configuration Express spécifique
   */
  express?: ExpressConfig;

  /**
   * Callback d'authentification personnalisé
   */
  authCallback?: AuthCallback;

  /**
   * Préfixe pour les routes API
   */
  apiPrefix?: string;

  /**
   * Configuration des réponses d'erreur
   */
  errorResponses?: {
    unauthorized?: { status: number; message: string };
    notFound?: { status: number; message: string };
    badRequest?: { status: number; message: string };
    serverError?: { status: number; message: string };
  };
}

/**
 * Configuration avancée pour une instance
 */
export interface AdvancedSearchEngineInstanceConfig
  extends Omit<SearchEngineInstanceConfig, "endpoints" | "instanceId"> {
  /**
   * Configuration des endpoints avec callbacks
   */
  endpoints?: {
    search?: {
      enabled: boolean;
      path?: string;
      authCallback?: AuthCallback;
      middleware?: AuthMiddleware;

      // Configuration pour la recherche multi-champs
      searchConfig?: {
        defaultFields?: string[];
        allowedFields?: string[];
        fieldWeights?: { [fieldName: string]: number };
      };
    };
    callable?: {
      enabled: boolean;
      authCallback?: AuthCallback;
    };
  };

  /**
   * Configuration des triggers avec support multi-champs
   */
  triggers?: {
    onCreate?: boolean;
    onUpdate?: boolean;
    onDelete?: boolean;
    documentsPath?: PathWithSubCollectionsMaxDepth4;

    // Configuration pour la re-vectorisation automatique
    reindexConfig?: {
      autoReindex?: boolean;
      batchReindex?: boolean;
      fieldsToWatch?: string[];
    };
  };
}

/**
 * Configuration avancée pour le gestionnaire de Cloud Functions
 */
export interface AdvancedCloudFunctionsConfig extends CloudFunctionsConfig {
  /**
   * Configuration de l'API de recherche (nouvelle version)
   */
  searchApi?: SearchApiConfig;
}

/**
 * Configuration TypeScript complète
 */
export interface SearchEnginesConfig {
  /**
   * Configuration globale
   */
  globalConfig: AdvancedCloudFunctionsConfig;

  /**
   * Configuration des moteurs de recherche
   */
  searchEngines: Record<string, AdvancedSearchEngineInstanceConfig>;
}

/**
 * Configuration d'entrée (sans dépendances Firebase - pour les fichiers de config)
 */
export interface SearchEnginesInputConfig {
  /**
   * Configuration globale (sans dépendances Firebase)
   */
  globalConfig: {
    functionPrefix?: string;
    defaultRegion?: string;
    defaultConfig?: Partial<SearchEngineInstanceConfig>;
    searchApi?: SearchApiConfig;
  };

  /**
   * Configuration des moteurs de recherche
   */
  searchEngines: Record<string, AdvancedSearchEngineInstanceConfig>;
}

/**
 * Factory function pour créer une configuration avec dépendances injectées
 */
export type ConfigFactory = (dependencies?: {
  firestoreInstance: any;
  fieldValueInstance: any;
  firebaseFunctions: any;
}) => SearchEnginesConfig | Promise<SearchEnginesConfig>;
