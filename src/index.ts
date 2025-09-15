/**
 * TypeScript type for Firestore search engine indices properties
 */
export type FirestoreSearchEngineIndexesProps = {
  /**
   * The input field to index (single field only).
   */
  inputField: string;
  /**
   * The returned fields.
   */
  returnedFields: { indexedDocumentPath: string } & Record<string, any>;
};

/**
 * TypeScript type for multi-field indexing properties
 */
export type FirestoreSearchEngineMultiIndexesProps = {
  /**
   * Multiple fields to index with optional configuration
   */
  inputFields: {
    [fieldName: string]: {
      /**
       * Weight for this field in search relevance (optional, default: 1)
       */
      weight?: number;
      /**
       * Whether to enable fuzzy search for this field (optional, default: true)
       */
      fuzzySearch?: boolean;
    };
  };
  /**
   * The returned fields.
   */
  returnedFields: { indexedDocumentPath: string } & Record<string, any>;
};
export type FirestoreSearchEngineIndexesAllProps = {
  /**
   * The key you want to index for search (single key only).
   */
  indexedKey: string;
  /**
   * An Array of object keys you want to be returned from index collection.
   */
  returnedKey: string[];
};

/**
 * TypeScript type for multi-field batch indexing
 */
export type FirestoreSearchEngineMultiIndexesAllProps = {
  /**
   * Multiple keys to index with batch processing
   */
  indexedKeys: {
    [fieldName: string]: {
      weight?: number;
      fuzzySearch?: boolean;
    };
  };
  /**
   * An Array of object keys you want to be returned from index collection.
   */
  returnedKey: string[];
};

/**
 * TypeScript type for Firestore search engine search properties
 */
export type FirestoreSearchEngineSearchProps = {
  /**
   * The field value to search for.
   */
  fieldValue: string;
  /**
   * Specific field to search in (optional, if not provided searches in all indexed fields)
   */
  searchField?: string;
  /**
   * The number of results returned (they are sorted by proximity).
   */
  limit?: number;
  /**
   * The accepted distance for angular COSINE vectors find.
   * Values: Float > 0 && < 1
   * Default: 0.2
   */
  distanceThreshold?: number;
  /**
   * Weights for different fields when searching across multiple fields
   */
  fieldWeights?: { [fieldName: string]: number };
  /**
   * Whether to enable fuzzy search
   */
  fuzzySearch?: boolean;
  /**
   * Custom vector field name to search in (for multi-field support)
   */
  vectorFieldName?: string;
  /**
   * Filter by field name in multi-field indexes
   */
  fieldFilter?: string;
};

/**
 * TypeScript type for multi-field search properties
 */
export type FirestoreSearchEngineMultiSearchProps = {
  /**
   * The search text/query
   */
  searchText: string;
  /**
   * Configuration for each field to search
   */
  searchConfig: {
    [fieldName: string]: {
      /**
       * Weight for this field in search relevance
       */
      weight?: number;
      /**
       * Whether to enable fuzzy search for this field
       */
      fuzzySearch?: boolean;
    };
  };
  /**
   * The number of results returned (they are sorted by relevance).
   */
  limit?: number;
  /**
   * The accepted distance threshold for vector similarity
   */
  distanceThreshold?: number;
};

/**
 * TypeScript type for Firestore search engine configuration
 */
export type FirestoreSearchEngineConfig = {
  /**
   * The collection.
   */
  collection: string;
  /**
   * The Accepted distance for angular COSINE vectors find.
   * Values: Float  > 0 && < 1
   * Default: 0.2
   */
  distanceThreshold?: number;
  /**
   * The minimum length of the word (optional) default 3.
   */
  wordMinLength?: number;
  /**
   * The maximum length of the word (optional) default 50.
   */
  wordMaxLength?: number;
  /**
   * Skip Firestore settings configuration (useful when Firestore is already initialized)
   * Default: false
   */
  skipFirestoreSettings?: boolean;
};

export type FirestoreSearchEngineReturnType = {
  [x: string]: any;
  indexedDocumentPath: string;
}[];
export type PathWithSubCollectionsMaxDepth4 =
  // Niveau de base : "collection/{docId}"
  | `${string}/{${string}}`
  // Premier niveau de sous-collection : "collection/{docId}/subCollection/{subDocId}"
  | `${string}/{${string}}/${string}/{${string}}`
  // Deuxième niveau de sous-collection : "collection/{docId}/subCollection/{subDocId}/anotherSubCollection/{anotherSubDocId}"
  | `${string}/{${string}}/${string}/{${string}}/${string}/{${string}}`
  // Troisième niveau de sous-collection : "collection/{docId}/subCollection/{subDocId}/anotherSubCollection/{anotherSubDocId}/moreSubCollection/{moreSubDocId}"
  | `${string}/{${string}}/${string}/{${string}}/${string}/{${string}}/${string}/{${string}}`;

/**
 * Exports FirestoreSearchEngine module
 */
export { FirestoreSearchEngine } from "./FirestoreSearchEngine";

/**
 * Exports Cloud Functions Management modules
 */
export { CloudFunctionsManager } from "./CloudFunctionsManager";
export type {
  AutoExports,
  CloudFunctionsConfig,
  FirebaseFunctionsHost,
  GeneratedFunctions,
  SearchEngineInstanceConfig,
} from "./CloudFunctionsManager";

/**
 * Exports Configuration Types
 */
export type {
  AdvancedCloudFunctionsConfig,
  AdvancedSearchEngineInstanceConfig,
  AuthCallback,
  AuthMiddleware,
  ConfigFactory,
  ExpressConfig,
  SearchApiConfig,
  SearchEnginesInputConfig,
} from "./ConfigTypes";

/**
 * Exports Configuration Loader Sync (synchrone - RECOMMANDÉ)
 */
export {
  loadAndValidateConfigSync,
  loadConfigFromModule,
  loadConfigSync,
  validateConfig,
} from "./ConfigLoaderSync";

/**
 * Exports Configuration Debugger
 */
export { ConfigDebugger } from "./ConfigDebugger";

/**
 * Exports Function Extraction Utilities
 */
export {
  createSelectiveExport,
  extractCallableFunctions,
  extractHttpFunctions,
  extractInstanceFunctions,
  extractTriggerFunctions,
} from "./FunctionExtractor";

/**
 * Exports Firebase Functions Helpers
 */
export {
  createCustomFirebaseFunctionsHost,
  createFirebaseFunctionsHost,
  createMockFirebaseFunctionsHost,
} from "./FirebaseFunctionsHelper";
