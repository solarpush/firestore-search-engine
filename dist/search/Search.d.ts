import type { Firestore } from "@google-cloud/firestore";
import { FirestoreSearchEngineConfig, FirestoreSearchEngineReturnType, FirestoreSearchEngineSearchProps } from "..";
/**
 * A Search class that interacts with Google Cloud Firestore API for operations like read, write and update
 * Uses FirestoreSearchEngineConfig, FirestoreSearchEngineIndexesProps, FirestoreSearchEngineSearchProps for various configuration
 *
 * @property {Object} FirestoreSearchEngineConfig - The configuration for the Firestore Search Engine
 * @property {Object} FirestoreSearchEngineIndexesProps - The properties for configuring the Firestore Search Engine Indexes
 * @property {Object} FirestoreSearchEngineSearchProps - The properties for configuring the Firestore Search Engine Search
 *
 * @method generateCharArray() - Generate an array of characters for the Firestore Search Engine
 * @method levenshteinDistance() - Calculate the Levenshtein distance for two strings
 */
export declare class Search {
    private readonly firestoreInstance;
    private readonly config;
    private readonly props;
    constructor(firestoreInstance: Firestore, config: FirestoreSearchEngineConfig, props: FirestoreSearchEngineSearchProps);
    execute(): Promise<FirestoreSearchEngineReturnType>;
    protected search(fieldValue: string): Promise<FirestoreSearchEngineReturnType>;
}
