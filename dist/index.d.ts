/**
 * TypeScript type for Firestore search engine indices properties
 */
export type FirestoreSearchEngineIndexesProps = {
    /**
     * The input field.
     */
    inputField: string;
    /**
     * The returned fields.
     */
    returnedFields: {
        indexedDocumentPath: string;
    } & Record<string, any>;
};
export type FirestoreSearchEngineIndexesAllProps = {
    /**
     * The key you want to indexe for search by this key.
     */
    indexedKey: string;
    /**
     * An Array on object key you want to be returned indexe collection.
     */
    returnedKey: string[];
};
/**
 * TypeScript type for Firestore search engine search properties
 */
export type FirestoreSearchEngineSearchProps = {
    /**
     * The field value.
     */
    fieldValue: string;
    /**
     * The number of result returned (they are sorted by proximity).
     */
    limit?: number;
    /**
     * The Accepted distance for angular COSINE vectors find.
     * Values: Float  > 0 && < 1
     * Default: 0.2
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
export type PathWithSubCollectionsMaxDepth4 = `${string}/{${string}}` | `${string}/{${string}}/${string}/{${string}}` | `${string}/{${string}}/${string}/{${string}}/${string}/{${string}}` | `${string}/{${string}}/${string}/{${string}}/${string}/{${string}}/${string}/{${string}}`;
/**
 * Exports FirestoreSearchEngine module
 */
export { FirestoreSearchEngine } from "./FirestoreSearchEngine";
/**
 * Exports Cloud Functions Management modules
 */
export { CloudFunctionsManager } from "./CloudFunctionsManager";
export type { AutoExports, CloudFunctionsConfig, FirebaseFunctionsHost, GeneratedFunctions, SearchEngineInstanceConfig, } from "./CloudFunctionsManager";
/**
 * Exports Configuration Types
 */
export type { AdvancedCloudFunctionsConfig, AdvancedSearchEngineInstanceConfig, AuthCallback, AuthMiddleware, ConfigFactory, ExpressConfig, SearchApiConfig, SearchEnginesInputConfig, } from "./ConfigTypes";
/**
 * Exports Configuration Loader Sync (synchrone - RECOMMANDÉ)
 */
export { loadAndValidateConfigSync, loadConfigFromModule, loadConfigSync, validateConfig, } from "./ConfigLoaderSync";
/**
 * Exports Configuration Debugger
 */
export { ConfigDebugger } from "./ConfigDebugger";
/**
 * Exports Function Extraction Utilities
 */
export { createSelectiveExport, extractCallableFunctions, extractHttpFunctions, extractInstanceFunctions, extractTriggerFunctions, } from "./FunctionExtractor";
/**
 * Exports Firebase Functions Helpers
 */
export { createCustomFirebaseFunctionsHost, createFirebaseFunctionsHost, createMockFirebaseFunctionsHost, } from "./FirebaseFunctionsHelper";
