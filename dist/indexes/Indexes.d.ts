import type { BulkWriter } from "@google-cloud/firestore";
import { firestore } from "firebase-admin";
import type { FirestoreSearchEngineConfig, FirestoreSearchEngineIndexesProps, FirestoreSearchEngineMultiIndexesProps } from "..";
/**
 * Enhanced Indexes class that supports both single-field and multi-field indexing
 * Maintains backward compatibility with existing single-field implementation
 * Adds new multi-field batch vectorization capabilities
 */
export declare class Indexes {
    private readonly firestoreInstance;
    private readonly fieldValueInstance;
    private readonly config;
    private readonly props;
    wordMinLength: number;
    wordMaxLength: number;
    private multiIndexer?;
    constructor(firestoreInstance: firestore.Firestore, fieldValueInstance: typeof firestore.FieldValue, config: FirestoreSearchEngineConfig, props: FirestoreSearchEngineIndexesProps | FirestoreSearchEngineMultiIndexesProps);
    /**
     * Main execution method - routes to appropriate indexing strategy
     */
    execute(): Promise<any>;
    /**
     * Remove indexes
     */
    remove(): Promise<void>;
    /**
     * Check if configuration is for multi-field indexing
     */
    private isMultiFieldConfig;
    /**
     * Traditional single-field execution (backward compatibility)
     */
    private executeSingleField;
    /**
     * Save with limited keywords (backward compatibility)
     */
    protected saveWithLimitedKeywords(returnedFields: FirestoreSearchEngineIndexesProps["returnedFields"], keywords: number[]): Promise<any>;
    /**
     * Clean old indexes (backward compatibility)
     */
    protected cleanOldIndexes(returnedFields: FirestoreSearchEngineIndexesProps["returnedFields"], bulk: BulkWriter): Promise<void>;
    /**
     * New smart indexing method that detects configuration type
     */
    indexes(): Promise<void>;
    /**
     * New smart bulk indexing method
     */
    bulkIndexes(bulkWriter: BulkWriter): Promise<void>;
}
