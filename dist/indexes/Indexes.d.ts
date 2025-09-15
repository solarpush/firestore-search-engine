import type { BulkWriter } from "@google-cloud/firestore";
import { firestore } from "firebase-admin";
import type { FirestoreSearchEngineConfig, FirestoreSearchEngineMultiIndexesProps } from "..";
/**
 * Unified indexes class for multi-field processing
 * Supports vectorization of multiple fields with weights and custom storage
 */
export declare class Indexes {
    private readonly firestoreInstance;
    private readonly fieldValueInstance;
    private readonly config;
    private readonly props;
    wordMinLength: number;
    wordMaxLength: number;
    constructor(firestoreInstance: firestore.Firestore, fieldValueInstance: typeof firestore.FieldValue, config: FirestoreSearchEngineConfig, props: FirestoreSearchEngineMultiIndexesProps);
    /**
     * Indexes a document with multiple fields using batch vectorization
     * Creates a single document with multiple _vector_[fieldName] fields
     */
    indexes(): Promise<void>;
    /**
     * Bulk indexes operation for multiple documents
     * Creates a single document with multiple _vector_[fieldName] fields
     */
    bulkIndexes(bulkWriter: BulkWriter): Promise<void>;
    /**
     * Batch vectorization of multiple fields using fastEmbed
     */
    private batchVectorize;
    /**
     * Delete index for a document
     */
    deleteIndex(): Promise<void>;
    /**
     * Update index for a document (re-index all fields)
     */
    updateIndex(): Promise<void>;
    /**
     * Remove indexes (alias for deleteIndex for backward compatibility)
     */
    remove(): Promise<void>;
    /**
     * Execute method (alias for indexes for backward compatibility)
     */
    execute(): Promise<void>;
}
