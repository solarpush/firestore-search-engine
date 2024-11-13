import type { BulkWriter, Firestore } from "@google-cloud/firestore";

import type { firestore } from "firebase-admin";
import {
  FirestoreSearchEngineConfig,
  FirestoreSearchEngineIndexesAllProps,
  FirestoreSearchEngineIndexesProps,
} from "..";
import { fse_vectorizeText } from "../shared/vectorize";
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

export class IndexesAll {
  wordMinLength: number;
  wordMaxLength: number;
  constructor(
    private readonly firestoreInstance: Firestore,
    private readonly fieldValueInstance: typeof firestore.FieldValue,
    private readonly config: FirestoreSearchEngineConfig
  ) {
    if (!this.config.wordMaxLength) {
      this.wordMaxLength = 100;
    } else {
      this.wordMaxLength = this.config.wordMaxLength;
    }
    if (!this.config.wordMinLength) {
      this.wordMinLength = 3;
    } else {
      this.wordMinLength = this.config.wordMinLength;
    }
  }

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
      const inputField: string = element[documentProps.indexedKey];
      const returnedFields: FirestoreSearchEngineIndexesProps["returnedFields"] =
        {
          indexedDocumentPath: element.indexedDocumentPath,
          fieldValue: inputField.toLowerCase(),
        };
      for (const key of documentProps.returnedKey) {
        returnedFields[key] = element[key];
      }
      const typos = await fse_vectorizeText(inputField, this.wordMaxLength);
      readyToBulk.push({
        keywords: typos,
        returnedFields,
      });
    }
    return await this.bulkWithLimitedKeywords(readyToBulk);
  }

  protected async bulkWithLimitedKeywords(
    bulkData: {
      returnedFields: FirestoreSearchEngineIndexesProps["returnedFields"];
      keywords: number[];
    }[]
  ) {
    const bulk = this.firestoreInstance.bulkWriter();
    let bulkCount = 0;
    for (const document of bulkData) {
      if (bulkCount % 1000 === 0) {
        await bulk.flush();
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
      if (bulkCount > 1500) {
        await bulk.flush();
        bulkCount++;
      }
    }
    await bulk.close();
    return;
  }
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
      if (bulkCount > 1500) await bulk.flush();
    }
    return;
  }
}
