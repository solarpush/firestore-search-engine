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
     * The minimum length of the word (optional) default 3.
     */
    wordMinLength?: number;
    /**
     * The maximum length of the word (optional) default 50.
     */
    wordMaxLength?: number;
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
