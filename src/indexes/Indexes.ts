import { BulkWriter, Firestore } from "@google-cloud/firestore";

import {
  FirestoreSearchEngineConfig,
  FirestoreSearchEngineIndexesProps,
} from "..";
import { generateTypos } from "../shared/generateTypos";

export class Indexes {
  constructor(
    private firestoreInstance: Firestore,
    private config: FirestoreSearchEngineConfig,
    private props: FirestoreSearchEngineIndexesProps
  ) {}
  async execute() {
    const typos = generateTypos(
      this.props.inputField,
      this.props.wordMaxLength
    );
    return await this.saveWithLimitedKeywords(
      this.props.returnedFields,
      Array.from(typos)
    );
  }

  async saveWithLimitedKeywords(
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
  async cleanOldIndexes(
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
