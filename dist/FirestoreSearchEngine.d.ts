import type { Firestore } from "@google-cloud/firestore";
import { FirestoreSearchEngineConfig, FirestoreSearchEngineIndexesProps, FirestoreSearchEngineSearchProps } from ".";
export declare class FirestoreSearchEngine {
    private firestoreInstance;
    private config;
    constructor(firestoreInstance: Firestore, config: FirestoreSearchEngineConfig);
    search(props: FirestoreSearchEngineSearchProps): Promise<any[]>;
    indexes(props: FirestoreSearchEngineIndexesProps): Promise<void>;
}
