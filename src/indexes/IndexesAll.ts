import type { BulkWriter, Firestore } from "@google-cloud/firestore";
import type { firestore } from "firebase-admin";
import type {
  FirestoreSearchEngineConfig,
  FirestoreSearchEngineIndexesAllProps,
} from "..";
import { Indexes } from "./Indexes";

/**
 * Simplified IndexesAll class that uses the multi-field indexing system
 * Processes multiple documents in batch using the unified Indexes class
 */
export class IndexesAll {
  wordMinLength: number;
  wordMaxLength: number;

  constructor(
    private readonly firestoreInstance: Firestore,
    private readonly fieldValueInstance: typeof firestore.FieldValue,
    private readonly config: FirestoreSearchEngineConfig
  ) {
    this.wordMinLength = config.wordMinLength || 3;
    this.wordMaxLength = config.wordMaxLength || 100;
  }

  /**
   * Multi-field bulk execution method
   */
  async executeMultiField({
    documentsToIndexes,
    fieldConfigs,
  }: {
    documentsToIndexes: any[];
    fieldConfigs: {
      [fieldName: string]: { weight?: number; fuzzySearch?: boolean };
    };
  }) {
    const bulk = this.firestoreInstance.bulkWriter();
    let processedCount = 0;

    for (const element of documentsToIndexes) {
      // Clean old indexes first
      await this.cleanOldIndexes(element.indexedDocumentPath, bulk);

      // Create multi-field index for this document
      const indexer = new Indexes(
        this.firestoreInstance,
        this.fieldValueInstance,
        this.config,
        {
          inputFields: fieldConfigs,
          returnedFields: element,
        }
      );

      try {
        await indexer.bulkIndexes(bulk);
        processedCount++;

        // Flush periodically
        if (processedCount % 500 === 0) {
          await bulk.flush();
        }
      } catch (error) {
        console.error(
          `❌ Erreur indexation document ${element.indexedDocumentPath}:`,
          error
        );
        // Continue with other documents
      }
    }

    await bulk.close();
    console.log(
      `✅ Bulk multi-field indexing completed for ${processedCount} documents`
    );
    return;
  }

  /**
   * Simplified bulk execution for multi-field indexing
   */
  async execute({
    documentProps,
    documentsToIndexes,
  }: {
    documentProps: FirestoreSearchEngineIndexesAllProps;
    documentsToIndexes: any[];
  }) {
    // Convert to new multi-field format using indexedKeys
    const fieldConfigs = documentProps.indexedKeys;

    // Prepare documents with proper structure
    const preparedDocuments = documentsToIndexes.map((doc) => {
      const returnedFields: any = {
        indexedDocumentPath: doc.indexedDocumentPath,
      };

      // Add returned keys
      for (const key of documentProps.returnedKey) {
        if (doc[key] !== undefined) {
          returnedFields[key] = doc[key];
        }
      }

      // Add indexed fields
      for (const fieldName of Object.keys(fieldConfigs)) {
        if (doc[fieldName] !== undefined) {
          returnedFields[fieldName] = doc[fieldName];
        }
      }

      return returnedFields;
    });

    return await this.executeMultiField({
      documentsToIndexes: preparedDocuments,
      fieldConfigs,
    });
  }

  /**
   * Clean old indexes for a document
   */
  private async cleanOldIndexes(
    indexedDocumentPath: string,
    bulk: BulkWriter
  ): Promise<void> {
    const query = await this.firestoreInstance
      .collection(this.config.collection)
      .where("indexedDocumentPath", "==", indexedDocumentPath)
      .get();

    if (query.empty) return;

    for (const doc of query.docs) {
      bulk.delete(doc.ref);
    }
  }
}
