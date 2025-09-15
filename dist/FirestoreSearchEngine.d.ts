import type { Firestore } from "@google-cloud/firestore";
import type { Application, Request, Response } from "express";
import { firestore } from "firebase-admin";
import { CallableRequest } from "firebase-functions/https";
import type { EventHandlerOptions } from "firebase-functions/options";
import type { onDocumentCreated, onDocumentDeleted, onDocumentUpdated } from "firebase-functions/v2/firestore";
import type { FirestoreSearchEngineConfig, FirestoreSearchEngineIndexesAllProps, FirestoreSearchEngineIndexesProps, FirestoreSearchEngineMultiIndexesProps, FirestoreSearchEngineMultiSearchProps, FirestoreSearchEngineReturnType, FirestoreSearchEngineSearchProps, PathWithSubCollectionsMaxDepth4 } from ".";
/**
 * Configures the Firestore instance and throws an error if a necessary
 * condition (collection name being a non-empty string) is not satisfied.
 *
 * @typedef {Object} Firestore - An instance of Google Cloud Firestore. For an example, refer to Firestore documentation.
 * @typedef {Object} FirestoreSearchEngineConfig - Object specifying FirestoreSearchEngine configuration.
 * Example:
 *  {
 *    "collection": "indexedCollectionName",
 *  }
 *
 * @param {Firestore} firestoreInstance - An instance of Firestore.
 * @param {FirestoreSearchEngineConfig} config - An instance of FirestoreSearchEngine configuration.
 * @throws {Error} If the collection name in the configuration is an empty string.
 *
 * For further details on Firestore, refer to the official Google Cloud Firestore [firestore documentation](https://cloud.google.com/firestore/docs).
 * For further details on Firestore Search Engine, refer to the [Firestore Search Engine documentation](https://github.com/solarpush/firestore-search-engine).
 * For specifics about FirestoreSearchEngine configuration, please refer to its related documentation. Key aspects to consider are the Firestore instance to use and the necessary configurations for the search engine.
 * In case an empty string is passed as the collection name in the configuration, it throws an error indicating the need for a valid collection name.
 */
export declare class FirestoreSearchEngine {
    private readonly firestoreInstance;
    private readonly config;
    private readonly fieldValueInstance;
    constructor(firestoreInstance: Firestore, config: FirestoreSearchEngineConfig, fieldValueInstance: typeof firestore.FieldValue);
    /**
     * Conducts a search operation in the Firestore collection configured for this FirestoreSearchEngine instance,
     * and delivers the search results.
     * @example
     * const firestoreSearchEngine = new FirestoreSearchEngine(firestoreInstance, { collection: 'myCollection' });
     * const results = await firestoreSearchEngine.search({ fieldValue: 'searchQuery', limit: 10 });
     * console.log(results);//{ [x: string]: any; indexedDocumentPath: string; }[]
     *
     * @param {FirestoreSearchEngineSearchProps} props - An object specifying the details of the search query operation.
     * @returns {Promise<FirestoreSearchEngineReturnType>} A Promise that resolves with the results of the search operation.
     * @throws {Error} If an error is encountered during the search operation, the error is thrown.
     *
     * For more information and usage examples, refer to the Firestore Search Engine [documentation](https://github.com/solarpush/firestore-search-engine).
     */
    search(props: FirestoreSearchEngineSearchProps): Promise<FirestoreSearchEngineReturnType>;
    /**
     * Configures indexes in the configured Firestore collection to enable efficient query processing.
     * Indexes in Firestore are set up around an index field and a direction.
     *
     * Detailed parameters for index configuration include inputField, returnedFields, and wordMaxLength. The inputField is a string specifying the field
     * to index, returnedFields is an object specifying the fields to return in search results, and wordMaxLength is an optional
     * parameter that indicates the maximum length of words to be indexed.
     *
     * @example
     * const firestoreSearchEngine = new FirestoreSearchEngine(firestore(), { collection: 'myCollection' });
     * await firestoreSearchEngine.indexes({ inputField: 'name', returnedFields: { indexedDocumentPath: 'path/to/document', nameOfAdditionalField: 'value' }, wordMaxLength: 10 });
     *
     * @param {FirestoreSearchEngineIndexesProps} props - An object specifying the details of the index configuration.
     * @throws {Error} If an error is encountered during index creation, the error is thrown.
     *
     * For more information and usage examples, refer to the Firestore Search Engine [documentation](https://github.com/solarpush/firestore-search-engine).
     */
    indexes(props: FirestoreSearchEngineIndexesProps): Promise<any>;
    /**
     * Supprime les index d'un champ spécifique dans la collection Firestore configurée.
     *
     * @param {FirestoreSearchEngineIndexesProps} props - Objet contenant les détails du champ à désindexer et les champs retournés.
     * @returns {Promise<any>} Une promesse qui résout le résultat de l'opération de suppression d'index.
     * @throws {Error} Si le champ d'entrée (inputField) est une chaîne vide ou non définie.
     *
     * @example
     * await firestoreSearchEngine.removeIndexes({
     *   inputField: 'nom',
     *   returnedFields: { indexedDocumentPath: 'chemin/vers/document' }
     * });
     */
    removeIndexes(props: FirestoreSearchEngineIndexesProps): Promise<void>;
    /**
     * Indexes all documents in the Firestore database.
     * @param {Object} docProps - The documents to index.
     * @param {FirestoreSearchEngineIndexesAllProps} docProps.documentProps - The properties of the documents to index.
     * @param {FirestoreSearchEngineIndexesProps['returnedFields'][]} docProps.documentsToIndexes - The fields of the documents to index.
     * @return {Promise<any>} A promise that resolves to the result of the indexing operation.
     * @example
     *   const docProps = {
     *    documentProps: {
     *        fieldsToIndex: ['title', 'content'],
     *     },
     *    documentsToIndexes: [
     *        { documentId: 'doc1', title: 'Hello World', content: 'This is an example document.' },
     *        { documentId: 'doc2', title: 'Welcome to my site', content: 'This site contains useful information.' },
     *     ],
     *  };
     *
     *  firestoreSearchEngine.indexesAll(docProps)
     *  .then((result) => {
     *    console.log('Indexing completed successfully:', result);
     *  })
     *  .catch((error) => {
     *    console.error('Error indexing documents:', error);
     *  });
     *
     */
    indexesAll(docProps: {
        documentProps: FirestoreSearchEngineIndexesAllProps;
        documentsToIndexes: FirestoreSearchEngineIndexesProps["returnedFields"][];
    }): Promise<void>;
    /**
     * Enhanced indexes method that supports both single-field and multi-field indexing
     * Detects the input type and routes to appropriate indexing strategy
     */
    indexesEnhanced(props: FirestoreSearchEngineIndexesProps | FirestoreSearchEngineMultiIndexesProps): Promise<any>;
    /**
     * Multi-field indexing with batch vectorization
     * Supports multiple fields with weights and fuzzy search configuration
     * Stores vectors as _vector_[fieldName] format
     */
    indexesMultiField(props: FirestoreSearchEngineMultiIndexesProps): Promise<void>;
    /**
     * Search in multiple fields with weighted results
     */
    searchMultiField(props: FirestoreSearchEngineMultiSearchProps): Promise<any[]>;
    /**
     * Combine and deduplicate multi-field search results
     */
    private combineMultiFieldResults;
    /**
     * Bulk multi-field indexing for multiple documents
     */
    indexesAllMultiField(docProps: {
        fieldConfigs: {
            [fieldName: string]: {
                weight?: number;
                fuzzySearch?: boolean;
            };
        };
        documentsToIndexes: any[];
    }): Promise<void>;
    expressWrapper(app: Application, path?: string, props?: Omit<FirestoreSearchEngineSearchProps, "fieldValue">): Promise<Application>;
    /**
     * Wraps an Express application and adds a route for performing a search.
     * @param {Application} app - The Express application to wrap.
     * @param {string} [path="/search"] - The path to bind the search route to (default: "/search").
     * @return {Application} The wrapped Express application.
     *
     * @example
     * const app = express();
     * const firestoreSearchEngine = new FirestoreSearchEngine(firestoreInstance, fieldValueInstance, config);
     * firestoreSearchEngine.expressWrapper(app, "/api/search");
     */
    onRequestWrapped(props?: Omit<FirestoreSearchEngineSearchProps, "fieldValue">): (request: Request, response: Response<any>) => void | Promise<void>;
    /**
     * Wraps a callable function with authentication and search functionality.
     * @param {(auth: CallableRequest["auth"]) => Promise<boolean> | boolean} authCallBack - A callback function to perform authentication.
     * @return {(data: CallableRequest) => Promise<FirestoreSearchEngineReturnType>} A function that performs authentication, search, and returns the search results.
     *
     * @example
     * import { FirestoreSearchEngine } from "firestore-search-engine";
     *
     * const authCallback = (auth: CallableRequest["auth"]) => {
     *    if (auth && auth.uid) return true;
     *    return false;
     *  };
     *  export const onCallSearchWrapped = onCall(
     *    { region: "europe-west3" },
     *    searchEngineUserName.onCallWrapped(authCallback)
     *  );
     *  //in Front-end callableFunction call with :
     *  //
     *  httpsCallable(searchUserName)({ searchValue: inputValue });
     *  //method: Managed from front package.json file
     */
    onCallWrapped(authCallBack: (auth: CallableRequest["auth"]) => Promise<boolean> | boolean, props?: Omit<FirestoreSearchEngineSearchProps, "fieldValue">): (data: CallableRequest) => Promise<FirestoreSearchEngineReturnType>;
    /**
     * Wrapper pour trigger de création/écriture de document avec support multi-champs
     * @param {typeof onDocumentCreated} onDocumentWrittenCallBack - Le callback onDocumentCreated à wrapper
     * @param {object} documentProps - Les propriétés du document avec indexedKeys et returnedKey
     * @param {PathWithSubCollectionsMaxDepth4} documentsPath - Le chemin du document à indexer
     * @param {object} props - Les propriétés de configuration optionnelles
     * @param {EventHandlerOptions} eventHandlerOptions - Les options du gestionnaire d'événements
     * @return {Function} La fonction callback wrappée
     *
     * @example
     * export const firestoreWriter = searchEngineUserName.onDocumentWriteWrapper(
     *   onDocumentCreated,
     *   {
     *     indexedKeys: {
     *       "name": { weight: 1.0, fuzzySearch: true },
     *       "description": { weight: 0.5, fuzzySearch: false }
     *     },
     *     returnedKey: ["id", "setAt"]
     *   },
     *   "users/{userId}",
     *   { wordMaxLength: 25 },
     *   { region: "europe-west3" }
     * );
     */
    onDocumentWriteWrapper(onDocumentWrittenCallBack: typeof onDocumentCreated, documentProps: {
        indexedKeys: {
            [fieldName: string]: {
                weight?: number;
                fuzzySearch?: boolean;
            };
        };
        returnedKey: string[];
    }, documentsPath: PathWithSubCollectionsMaxDepth4, props?: Pick<FirestoreSearchEngineConfig, "wordMaxLength" | "wordMinLength">, eventHandlerOptions?: EventHandlerOptions): import("firebase-functions/core").CloudFunction<import("firebase-functions/firestore").FirestoreEvent<import("firebase-functions/firestore").QueryDocumentSnapshot | undefined, {
        [x: string]: string;
    } | {
        [x: string]: string;
    } | {
        [x: string]: string;
    } | {
        [x: string]: string;
    }>>;
    /**
     * Wrapper pour trigger de mise à jour de document avec support multi-champs
     * @param {typeof onDocumentUpdated} instanceOfOnDocumentUpdated - Le callback onDocumentUpdated à wrapper
     * @param {object} documentProps - Les propriétés du document avec indexedKeys et returnedKey
     * @param {PathWithSubCollectionsMaxDepth4} documentsPath - Le chemin du document à indexer
     * @param {object} props - Les propriétés de configuration optionnelles
     * @param {EventHandlerOptions} eventHandlerOptions - Les options du gestionnaire d'événements
     * @return {Function} La fonction callback wrappée
     *
     * @example
     * export const firestoreUpdated = searchEngineUserName.onDocumentUpdateWrapper(
     *   onDocumentUpdated,
     *   {
     *     indexedKeys: {
     *       "name": { weight: 1.0, fuzzySearch: true },
     *       "description": { weight: 0.5, fuzzySearch: false }
     *     },
     *     returnedKey: ["id", "setAt"]
     *   },
     *   "users/{userId}",
     *   { wordMinLength: 3 },
     *   { region: "europe-west3" }
     * );
     */
    onDocumentUpdateWrapper(instanceOfOnDocumentUpdated: typeof onDocumentUpdated, documentProps: {
        indexedKeys: {
            [fieldName: string]: {
                weight?: number;
                fuzzySearch?: boolean;
            };
        };
        returnedKey: string[];
    }, documentsPath: PathWithSubCollectionsMaxDepth4, props?: Pick<FirestoreSearchEngineConfig, "wordMaxLength" | "wordMinLength">, eventHandlerOptions?: EventHandlerOptions): import("firebase-functions/core").CloudFunction<import("firebase-functions/firestore").FirestoreEvent<import("firebase-functions/firestore").Change<import("firebase-functions/firestore").QueryDocumentSnapshot> | undefined, {
        [x: string]: string;
    } | {
        [x: string]: string;
    } | {
        [x: string]: string;
    } | {
        [x: string]: string;
    }>>;
    /**
     * Wraps an onDocumentDeleted callback function in Firestore.
     * @param {OnDocumentDeletedCallback} instanceOfOnDocumentDeleted - The callback function to wrap.
     * @param {FirestoreSearchEngineDocumentPath} documentsPath - The path of the document to delete.
     * @param {FirestoreSearchEngineConfigProps} [eventHandlerOptions={}] - The options for the event handler.
     * @return {Function} The wrapped onDocumentDeleted callback function.
     * export const firestoreDeleted = searchEngineUserName.onDocumentDeletedWrapper(
     *  onDocumentDeleted, // onDocumentDeleted method
     *  "test/{testId}", //documentPath or subCollectionDocumentPath  && 5 recursive level only
     *  { region: "europe-west3" } //EventHandlerOptions optional
     *  );
     */
    onDocumentDeletedWrapper(instanceOfOnDocumentDeleted: typeof onDocumentDeleted, documentsPath: PathWithSubCollectionsMaxDepth4, eventHandlerOptions?: EventHandlerOptions): import("firebase-functions/core").CloudFunction<import("firebase-functions/firestore").FirestoreEvent<import("firebase-functions/firestore").QueryDocumentSnapshot | undefined, {
        [x: string]: string;
    } | {
        [x: string]: string;
    } | {
        [x: string]: string;
    } | {
        [x: string]: string;
    }>>;
    buildError(error: unknown): {
        message: string;
        error: any;
        trace: string | undefined;
        timestamp: string;
        collection: string;
    };
}
