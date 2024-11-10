import { BulkWriter, Firestore } from "@google-cloud/firestore";
import { FirestoreSearchEngineConfig, FirestoreSearchEngineIndexesProps } from "..";
export declare class Indexes {
    private firestoreInstance;
    private config;
    private props;
    constructor(firestoreInstance: Firestore, config: FirestoreSearchEngineConfig, props: FirestoreSearchEngineIndexesProps);
    execute(): Promise<void>;
    saveWithLimitedKeywords(returnedFields: FirestoreSearchEngineIndexesProps["returnedFields"], keywords: string[]): Promise<void>;
    cleanOldIndexes(returnedFields: FirestoreSearchEngineIndexesProps["returnedFields"], bulk: BulkWriter): Promise<void>;
}
