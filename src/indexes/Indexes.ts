import type { BulkWriter } from "@google-cloud/firestore";
import { firestore } from "firebase-admin";
import type {
  FirestoreSearchEngineConfig,
  FirestoreSearchEngineIndexesProps,
  FirestoreSearchEngineMultiIndexesProps,
} from "..";
import { fse_vectorizeText } from "../shared/vectorize";
import { MultiIndexes } from "./MultiIndexes";

/**
 * Enhanced Indexes class that supports both single-field and multi-field indexing
 * Maintains backward compatibility with existing single-field implementation
 * Adds new multi-field batch vectorization capabilities
 */
export class Indexes {
  wordMinLength: number;
  wordMaxLength: number;
  private multiIndexer?: MultiIndexes;

  constructor(
    private readonly firestoreInstance: firestore.Firestore,
    private readonly fieldValueInstance: typeof firestore.FieldValue,
    private readonly config: FirestoreSearchEngineConfig,
    private readonly props:
      | FirestoreSearchEngineIndexesProps
      | FirestoreSearchEngineMultiIndexesProps
  ) {
    this.wordMinLength = config.wordMinLength || 3;
    this.wordMaxLength = config.wordMaxLength || 100;

    // Initialize multi-indexer if needed
    if (this.isMultiFieldConfig()) {
      this.multiIndexer = new MultiIndexes(
        firestoreInstance,
        fieldValueInstance,
        config,
        props as FirestoreSearchEngineMultiIndexesProps
      );
    }
  }

  /**
   * Main execution method - routes to appropriate indexing strategy
   */
  async execute(): Promise<any> {
    if (this.isMultiFieldConfig()) {
      await this.multiIndexer!.indexes();
      return;
    } else {
      // Traditional single-field execution
      return await this.executeSingleField();
    }
  }

  /**
   * Remove indexes
   */
  async remove(): Promise<void> {
    if (this.isMultiFieldConfig()) {
      await this.multiIndexer!.deleteIndex();
    } else {
      // Traditional removal
      const bulk = this.firestoreInstance.bulkWriter();
      await this.cleanOldIndexes(this.props.returnedFields, bulk);
      await bulk.close();
    }
  }

  /**
   * Check if configuration is for multi-field indexing
   */
  private isMultiFieldConfig(): boolean {
    return (
      "inputFields" in this.props && typeof this.props.inputFields === "object"
    );
  }

  /**
   * Traditional single-field execution (backward compatibility)
   */
  private async executeSingleField(): Promise<any> {
    const singleProps = this.props as FirestoreSearchEngineIndexesProps;

    const inputField = singleProps.inputField; // Maintenant toujours une string
    const vector = await fse_vectorizeText(inputField, this.wordMaxLength);

    return await this.saveWithLimitedKeywords(
      singleProps.returnedFields,
      vector
    );
  }

  /**
   * Save with limited keywords (backward compatibility)
   */
  protected async saveWithLimitedKeywords(
    returnedFields: FirestoreSearchEngineIndexesProps["returnedFields"],
    keywords: number[]
  ): Promise<any> {
    const bulk = this.firestoreInstance.bulkWriter();
    await this.cleanOldIndexes(returnedFields, bulk);

    const singleProps = this.props as FirestoreSearchEngineIndexesProps;
    const inputField = singleProps.inputField.toLowerCase();

    bulk.create(
      this.firestoreInstance.collection(this.config.collection).doc(),
      {
        vectors: this.fieldValueInstance.vector(keywords),
        fieldValue: inputField,
        ...returnedFields,
      }
    );
    await bulk.close();
    return;
  }

  /**
   * Clean old indexes (backward compatibility)
   */
  protected async cleanOldIndexes(
    returnedFields: FirestoreSearchEngineIndexesProps["returnedFields"],
    bulk: BulkWriter
  ): Promise<void> {
    const { indexedDocumentPath } = returnedFields;
    const query = await this.firestoreInstance
      .collection(this.config.collection)
      .where("indexedDocumentPath", "==", indexedDocumentPath)
      .get();

    if (query.empty) return;

    for (let j = 0; j < query.docs.length; j++) {
      bulk.delete(query.docs[j].ref);
      if (j > 500) await bulk.flush();
    }
    await bulk.flush();
    return;
  }

  /**
   * New smart indexing method that detects configuration type
   */
  async indexes(): Promise<void> {
    if (this.isMultiFieldConfig()) {
      await this.multiIndexer!.indexes();
    } else {
      await this.executeSingleField();
    }
  }

  /**
   * New smart bulk indexing method
   */
  async bulkIndexes(bulkWriter: BulkWriter): Promise<void> {
    if (this.isMultiFieldConfig()) {
      await this.multiIndexer!.bulkIndexes(bulkWriter);
    } else {
      // For single field, we can implement a simple bulk version
      const singleProps = this.props as FirestoreSearchEngineIndexesProps;

      try {
        const inputField = singleProps.inputField; // Maintenant toujours une string
        const vector = await fse_vectorizeText(inputField, this.wordMaxLength);

        const docRef = this.firestoreInstance
          .collection(this.config.collection)
          .doc();
        const indexDocument = {
          vectors: this.fieldValueInstance.vector(vector),
          fieldValue: inputField.toLowerCase(),
          ...singleProps.returnedFields,
        };

        bulkWriter.create(docRef, indexDocument);
      } catch (error) {
        console.error(`❌ Erreur bulk indexation simple:`, error);
        throw error;
      }
    }
  }
}
