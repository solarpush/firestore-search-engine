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
  returnedFields: { indexedDocumentPath: string } & Record<string, any>;
  /**
   * The minimum length of the word (optional) default 3.
   */
  wordMinLength?: number;
  /**
   * The maximum length of the word (optional) default 50.
   */
  wordMaxLength?: number;
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
