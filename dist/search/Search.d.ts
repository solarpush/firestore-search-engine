import { Firestore } from "@google-cloud/firestore";
import { FirestoreSearchEngineConfig, FirestoreSearchEngineSearchProps } from "..";
export declare class Search {
    private firestoreInstance;
    private config;
    private props;
    constructor(firestoreInstance: Firestore, config: FirestoreSearchEngineConfig, props: FirestoreSearchEngineSearchProps);
    execute(): Promise<any[]>;
    search(fieldValue: string): Promise<any[]>;
}
