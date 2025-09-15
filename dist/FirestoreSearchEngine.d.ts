import type { Firestore } from "@google-cloud/firestore";
import type { Application, Request, Response } from "express";
import { firestore } from "firebase-admin";
import { CallableRequest } from "firebase-functions/https";
import type { EventHandlerOptions } from "firebase-functions/options";
import type { onDocumentCreated, onDocumentDeleted, onDocumentUpdated } from "firebase-functions/v2/firestore";
import type { FirestoreSearchEngineConfig, FirestoreSearchEngineIndexesAllProps, FirestoreSearchEngineIndexesProps, FirestoreSearchEngineMultiSearchProps, FirestoreSearchEngineReturnType, FirestoreSearchEngineSearchProps, PathWithSubCollectionsMaxDepth4 } from ".";
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
     * Multi-field indexing with batch vectorization
     * Supports multiple fields with weights and fuzzy search configuration
     * Stores vectors as _vector_[fieldName] format
     */
    indexes(props: FirestoreSearchEngineIndexesProps): Promise<void>;
    /**
     * Remove multi-field indexes for a document
     */
    removeIndexes(props: FirestoreSearchEngineIndexesProps): Promise<void>;
    /**
     * Indexes all documents in the Firestore database.
     * @param {Object} docProps - The documents to index.
     * @param {FirestoreSearchEngineIndexesAllProps} docProps.documentProps - The properties of the documents to index.
     * @param {any[]} docProps.documentsToIndexes - The documents to index.
     * @return {Promise<any>} A promise that resolves to the result of the indexing operation.
     * @example
     *   const docProps = {
     *    documentProps: {
     *        indexedKeys: {
     *          'title': { weight: 1.0, fuzzySearch: true },
     *          'content': { weight: 0.8, fuzzySearch: true }
     *        },
     *        returnedKey: ['id', 'timestamp']
     *     },
     *    documentsToIndexes: [
     *        { indexedDocumentPath: 'docs/doc1', title: 'Hello World', content: 'This is an example document.' },
     *        { indexedDocumentPath: 'docs/doc2', title: 'Welcome to my site', content: 'This site contains useful information.' },
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
        documentsToIndexes: any[];
    }): Promise<void>;
    /**
     * Search in multiple fields with weighted results
     */
    searchMultiField(props: FirestoreSearchEngineMultiSearchProps): Promise<any[]>;
    /**
     * Combine and deduplicate multi-field search results
     */
    private combineMultiFieldResults;
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
