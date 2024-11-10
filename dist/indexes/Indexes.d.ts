import { BulkWriter, Firestore } from "@google-cloud/firestore";
import { FirestoreSearchEngineConfig, FirestoreSearchEngineIndexesProps } from "..";
/**
 * The `BulkWriter` and `Firestore` objects are imported from the
 * '@google-cloud/firestore' package. These objects are used for batched writes
 * and cloud-based NoSQL databases respectively.
 *
 * Also, the `FirestoreSearchEngineConfig` and `FirestoreSearchEngineIndexesProps` objects
 * are imported from the parent directory. These are mostly likely used to configure
 * your Firestore Search engine. This can include settings such as security, indexes, etc.
 *
 * The function `generateTypos` from "../shared/generateTypos" is also imported.
 * It's used to programmatically generate various combinations of typo errors
 * (misspellings) based on a given string.
 *
 * For context-specific documentation, please refer to the respective modules' docstring or documentation.
 */
export declare class Indexes {
    private readonly firestoreInstance;
    private readonly config;
    private readonly props;
    constructor(firestoreInstance: Firestore, config: FirestoreSearchEngineConfig, props: FirestoreSearchEngineIndexesProps);
    execute(): Promise<void>;
    protected saveWithLimitedKeywords(returnedFields: FirestoreSearchEngineIndexesProps["returnedFields"], keywords: string[]): Promise<void>;
    protected cleanOldIndexes(returnedFields: FirestoreSearchEngineIndexesProps["returnedFields"], bulk: BulkWriter): Promise<void>;
}
