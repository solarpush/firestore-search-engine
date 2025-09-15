import type { BulkWriter } from "@google-cloud/firestore";
import { firestore } from "firebase-admin";
import type {
  FirestoreSearchEngineConfig,
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

export class Indexes {
  wordMinLength: number;
  wordMaxLength: number;
  constructor(
    private readonly firestoreInstance: firestore.Firestore,
    private readonly fieldValueInstance: typeof firestore.FieldValue,
    private readonly config: FirestoreSearchEngineConfig,
    private readonly props: FirestoreSearchEngineIndexesProps
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

  async execute() {
    // const typos = fse_generateTypos(this.props.inputField, this.wordMaxLength);
    const typos = await fse_vectorizeText(
      this.props.inputField,
      this.wordMaxLength
    );
    return await this.saveWithLimitedKeywords(this.props.returnedFields, typos);
  }
  async remove() {
    const bulk = this.firestoreInstance.bulkWriter();
    await this.cleanOldIndexes(this.props.returnedFields, bulk);
    await bulk.close();
    return;
  }

  protected async saveWithLimitedKeywords(
    returnedFields: FirestoreSearchEngineIndexesProps["returnedFields"],
    keywords: number[]
  ) {
    const bulk = this.firestoreInstance.bulkWriter();
    await this.cleanOldIndexes(returnedFields, bulk);

    bulk.create(
      this.firestoreInstance.collection(this.config.collection).doc(),
      {
        vectors: this.fieldValueInstance.vector(keywords),
        fieldValue: this.props.inputField.toLowerCase(), // ✅ Ajouter le texte original pour le ranking
        ...returnedFields,
      }
    );
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
      if (j > 500) await bulk.flush();
    }
    await bulk.flush();
    return;
  }
}
