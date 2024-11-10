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
   * The maximum length of the word (optional).
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

/**
 * Exports FirestoreSearchEngine module
 */
export { FirestoreSearchEngine } from "./FirestoreSearchEngine";
