import type { BulkWriter, Firestore } from "@google-cloud/firestore";

import type { firestore } from "firebase-admin";
import {
  FirestoreSearchEngineConfig,
  FirestoreSearchEngineIndexesAllProps,
  FirestoreSearchEngineIndexesProps,
} from "..";
import { fse_vectorizeText } from "../shared/vectorize";

/**
 * Enhanced IndexesAll class that supports both single-field and multi-field bulk indexing
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
   * Enhanced execute method that supports both single and multi-field indexing
   */
  async execute({
    documentProps,
    documentsToIndexes,
  }: {
    documentProps: FirestoreSearchEngineIndexesAllProps;
    documentsToIndexes: FirestoreSearchEngineIndexesProps["returnedFields"][];
  }) {
    const readyToBulk: {
      keywords: number[];
      returnedFields: FirestoreSearchEngineIndexesProps["returnedFields"];
    }[] = [];

    for (const { ...element } of documentsToIndexes) {
      const inputField: string = element[documentProps.indexedKey]; // Maintenant toujours une string
      const returnedFields: FirestoreSearchEngineIndexesProps["returnedFields"] =
        {
          indexedDocumentPath: element.indexedDocumentPath,
          fieldValue: inputField.toLowerCase(),
        };

      for (const key of documentProps.returnedKey) {
        returnedFields[key] = element[key];
      }

      const vector = await fse_vectorizeText(inputField, this.wordMaxLength);
      readyToBulk.push({
        keywords: vector,
        returnedFields,
      });
    }

    return await this.bulkWithLimitedKeywords(readyToBulk);
  }

  /**
   * New multi-field bulk execution method
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
    const readyToBulk: {
      indexDocument: any;
      indexedDocumentPath: string;
    }[] = [];

    for (const element of documentsToIndexes) {
      const fieldsToVectorize: { [fieldName: string]: string } = {};

      // Collect fields to vectorize
      for (const [fieldName, fieldConfig] of Object.entries(fieldConfigs)) {
        const fieldValue = element[fieldName];
        if (fieldValue && typeof fieldValue === "string") {
          const cleanText = fieldValue.toLowerCase().trim();
          if (
            cleanText.length >= this.wordMinLength &&
            cleanText.length <= this.wordMaxLength
          ) {
            fieldsToVectorize[fieldName] = cleanText;
          }
        }
      }

      if (Object.keys(fieldsToVectorize).length === 0) {
        continue; // Skip if no valid fields
      }

      // Batch vectorize all fields for this document
      const vectorBatch = await this.batchVectorize(fieldsToVectorize);

      // Prepare index document
      const indexDocument: any = {
        ...element,
        _indexed_at: this.fieldValueInstance.serverTimestamp(),
        _field_weights: {},
        _field_configs: {},
      };

      // Add vectors for each field
      for (const [fieldName, vector] of Object.entries(vectorBatch)) {
        const vectorFieldName = `_vector_${fieldName}`;
        const fieldConfig = fieldConfigs[fieldName];

        indexDocument[vectorFieldName] = this.fieldValueInstance.vector(vector);
        indexDocument[`${fieldName}_original`] = fieldsToVectorize[fieldName];
        indexDocument._field_weights[fieldName] = fieldConfig?.weight || 1.0;
        indexDocument._field_configs[fieldName] = {
          fuzzySearch: fieldConfig?.fuzzySearch ?? true,
          weight: fieldConfig?.weight || 1.0,
        };
      }

      readyToBulk.push({
        indexDocument,
        indexedDocumentPath: element.indexedDocumentPath,
      });
    }

    return await this.bulkWithMultiFieldIndexes(readyToBulk);
  }

  /**
   * Batch vectorization for multiple fields
   */
  private async batchVectorize(fieldsToVectorize: {
    [fieldName: string]: string;
  }): Promise<{ [fieldName: string]: number[] }> {
    try {
      const fieldNames = Object.keys(fieldsToVectorize);
      const texts = Object.values(fieldsToVectorize);

      if (texts.length === 0) {
        return {};
      }

      // Vectorize all texts in parallel for better performance
      const vectors = await Promise.all(
        texts.map((text) => fse_vectorizeText(text, this.wordMaxLength))
      );

      // Map back to field names
      const result: { [fieldName: string]: number[] } = {};
      fieldNames.forEach((fieldName, index) => {
        result[fieldName] = vectors[index];
      });

      return result;
    } catch (error) {
      console.error("❌ Erreur lors de la vectorisation en batch:", error);
      throw error;
    }
  }

  /**
   * Bulk write for multi-field indexes
   */
  protected async bulkWithMultiFieldIndexes(
    bulkData: {
      indexDocument: any;
      indexedDocumentPath: string;
    }[]
  ) {
    const bulk = this.firestoreInstance.bulkWriter();
    let bulkCount = 0;

    for (const document of bulkData) {
      if (bulkCount > 500) {
        await bulk.flush();
        bulkCount = 0;
      }

      // Clean old indexes for this document
      await this.cleanOldIndexes(
        { indexedDocumentPath: document.indexedDocumentPath },
        bulk,
        bulkCount
      );

      // Create new index document
      bulk.create(
        this.firestoreInstance.collection(this.config.collection).doc(),
        document.indexDocument
      );

      bulkCount++;
    }

    await bulk.close();
    console.log(
      `✅ Bulk multi-field indexing completed for ${bulkData.length} documents`
    );
    return;
  }

  /**
   * Traditional bulk write (backward compatibility)
   */
  protected async bulkWithLimitedKeywords(
    bulkData: {
      returnedFields: FirestoreSearchEngineIndexesProps["returnedFields"];
      keywords: number[];
    }[]
  ) {
    const bulk = this.firestoreInstance.bulkWriter();
    let bulkCount = 0;

    for (const document of bulkData) {
      if (bulkCount > 500) {
        await bulk.flush();
        bulkCount = 0;
      }

      await this.cleanOldIndexes(document.returnedFields, bulk, bulkCount);

      bulk.create(
        this.firestoreInstance.collection(this.config.collection).doc(),
        {
          vectors: this.fieldValueInstance.vector(document.keywords),
          ...document.returnedFields,
        }
      );

      bulkCount++;
    }

    await bulk.close();
    return;
  }

  /**
   * Clean old indexes (backward compatibility maintained)
   */
  protected async cleanOldIndexes(
    returnedFields: FirestoreSearchEngineIndexesProps["returnedFields"],
    bulk: BulkWriter,
    bulkCount: number
  ) {
    const { indexedDocumentPath } = returnedFields;
    const query = await this.firestoreInstance
      .collection(this.config.collection)
      .where("indexedDocumentPath", "==", indexedDocumentPath)
      .get();

    if (query.empty) return;

    for (let j = 0; j < query.docs.length; j++) {
      bulk.delete(query.docs[j].ref);
      bulkCount++;
      if (bulkCount > 500) {
        await bulk.flush();
        bulkCount = 0;
      }
    }
    return;
  }
}
