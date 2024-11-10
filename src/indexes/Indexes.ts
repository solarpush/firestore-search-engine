import { BulkWriter, Firestore } from "@google-cloud/firestore";

import {
  FirestoreSearchEngineConfig,
  FirestoreSearchEngineIndexesProps,
} from "..";
import { fse_generateTypos } from "../shared/generateTypos";
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

export class Indexes {
  constructor(
    private readonly firestoreInstance: Firestore,
    private readonly config: FirestoreSearchEngineConfig,
    private readonly props: FirestoreSearchEngineIndexesProps
  ) {}

  async execute() {
    const typos = fse_generateTypos(
      this.props.inputField,
      this.props.wordMaxLength
    );
    return await this.saveWithLimitedKeywords(
      this.props.returnedFields,
      Array.from(typos)
    );
  }

  protected async saveWithLimitedKeywords(
    returnedFields: FirestoreSearchEngineIndexesProps["returnedFields"],
    keywords: string[]
  ) {
    const bulk = this.firestoreInstance.bulkWriter();
    await this.cleanOldIndexes(returnedFields, bulk);
    const chunkSize = 800;
    const keywordChunks: string[][] = [];

    for (let i = 0; i < keywords.length; i += chunkSize) {
      keywordChunks.push(keywords.slice(i, i + chunkSize));
    }
    for (let j = 0; j < keywordChunks.length; j++) {
      bulk.create(
        this.firestoreInstance.collection(this.config.collection).doc(),
        {
          search_keywords: keywordChunks[j],
          ...returnedFields,
        }
      );
      if (j % 500 === 0) {
        await bulk.flush();
      }
    }
    await bulk.close();
    return;
  }
  protected async cleanOldIndexes(
    returnedFields: FirestoreSearchEngineIndexesProps["returnedFields"],
    bulk: BulkWriter
  ) {
    const { indexedDocumentPath } = returnedFields;
    const query = await this.firestoreInstance
      .collection(this.config.collection)
      .where("indexedDocumentPath", "==", indexedDocumentPath)
      .get();
    if (query.empty) return;

    for (let j = 0; j < query.docs.length; j++) {
      bulk.delete(query.docs[j].ref);
      if (j % 500 === 0) await bulk.flush();
    }
    await bulk.flush();
    return;
  }
}
