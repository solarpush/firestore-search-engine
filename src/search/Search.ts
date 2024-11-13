import type { Firestore } from "@google-cloud/firestore";
import {
  FirestoreSearchEngineConfig,
  FirestoreSearchEngineIndexesProps,
  FirestoreSearchEngineReturnType,
  FirestoreSearchEngineSearchProps,
} from "..";
import { fse_rankResults } from "../shared/rankResults";
import { fse_vectorizeText } from "../shared/vectorize";
/**
 * A Search class that interacts with Google Cloud Firestore API for operations like read, write and update
 * Uses FirestoreSearchEngineConfig, FirestoreSearchEngineIndexesProps, FirestoreSearchEngineSearchProps for various configuration
 *
 * @property {Object} FirestoreSearchEngineConfig - The configuration for the Firestore Search Engine
 * @property {Object} FirestoreSearchEngineIndexesProps - The properties for configuring the Firestore Search Engine Indexes
 * @property {Object} FirestoreSearchEngineSearchProps - The properties for configuring the Firestore Search Engine Search
 *
 * @method generateCharArray() - Generate an array of characters for the Firestore Search Engine
 * @method levenshteinDistance() - Calculate the Levenshtein distance for two strings
 */

export class Search {
  wordMinLength: number;
  wordMaxLength: number;
  constructor(
    private readonly firestoreInstance: Firestore,
    private readonly config: FirestoreSearchEngineConfig,
    private readonly props: FirestoreSearchEngineSearchProps
  ) {
    if (!this.props.limit) {
      this.props.limit = 10;
    }
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
    return await this.search(this.props.fieldValue);
  }
  protected async search(
    fieldValue: string
  ): Promise<FirestoreSearchEngineReturnType> {
    const queryVector = await fse_vectorizeText(fieldValue, this.wordMaxLength);
    const querySnapshot = await this.firestoreInstance
      .collectionGroup(this.config.collection)
      .findNearest({
        vectorField: "search_keywords",
        queryVector: queryVector,
        limit: this.props.limit as number,
        distanceMeasure: "COSINE",
        distanceThreshold: 0.2,
        distanceResultField: "distance",
      })
      .get();
    if (querySnapshot.empty) {
      return [];
    }
    const uniqueDocs = new Set<string>();
    const results: any[] = [];
    for (const doc of querySnapshot.docs) {
      const data =
        doc.data() as FirestoreSearchEngineIndexesProps["returnedFields"] & {
          vectors: string[];
        };
      const uniqueId = data.indexedDocumentPath;
      if (!uniqueDocs.has(uniqueId)) {
        uniqueDocs.add(uniqueId);
        results.push(data);
      }
    }
    const ranked = fse_rankResults(results, fieldValue);
    const topResults = ranked;
    return topResults;
  }
}
