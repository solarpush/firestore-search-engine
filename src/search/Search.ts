import { Firestore } from "@google-cloud/firestore";
import {
  FirestoreSearchEngineConfig,
  FirestoreSearchEngineIndexesProps,
  FirestoreSearchEngineReturnType,
  FirestoreSearchEngineSearchProps,
} from "..";
import { fse_generateCharArray } from "../shared/generateCharArray";
import { fse_levenshteinDistance } from "../shared/levenshteinDistance";
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
  constructor(
    private readonly firestoreInstance: Firestore,
    private readonly config: FirestoreSearchEngineConfig,
    private readonly props: FirestoreSearchEngineSearchProps
  ) {}
  async execute() {
    return await this.search(this.props.fieldValue);
  }
  protected async search(
    fieldValue: string
  ): Promise<FirestoreSearchEngineReturnType> {
    const searchKeywords = fse_generateCharArray(fieldValue);
    const querySnapshot = await this.firestoreInstance
      .collection(this.config.collection)
      .where("search_keywords", "array-contains-any", [...searchKeywords])
      .get();
    if (querySnapshot.empty) {
      return [];
    }
    const uniqueDocs = new Set<string>();
    const results = [];

    for (const doc of querySnapshot.docs) {
      const data =
        doc.data() as FirestoreSearchEngineIndexesProps["returnedFields"] & {
          search_keywords: string[];
        };
      const { search_keywords, ...rest } = data;
      const uniqueId = data.indexedDocumentPath;
      const isCloseEnough = search_keywords.some(
        (keyword) =>
          fieldValue
            .split(" ")
            .some((word) => fse_levenshteinDistance(word, keyword) <= 2) &&
          fse_levenshteinDistance(fieldValue, keyword) <= 3
      );

      if (isCloseEnough && !uniqueDocs.has(uniqueId)) {
        uniqueDocs.add(uniqueId);
        results.push(rest);
      }
    }
    return results;
  }
}
