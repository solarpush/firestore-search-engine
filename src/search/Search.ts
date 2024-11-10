import { Firestore } from "@google-cloud/firestore";
import {
  FirestoreSearchEngineConfig,
  FirestoreSearchEngineIndexesProps,
  FirestoreSearchEngineSearchProps,
} from "..";
import { generateCharArray } from "../shared/generateCharArray";
import { levenshteinDistance } from "../shared/levenshteinDistance";

export class Search {
  constructor(
    private firestoreInstance: Firestore,
    private config: FirestoreSearchEngineConfig,
    private props: FirestoreSearchEngineSearchProps
  ) {}
  async execute() {
    return await this.search(this.props.fieldValue);
  }
  async search(fieldValue: string): Promise<any[]> {
    const searchKeywords = generateCharArray(fieldValue);

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
      const isCloseEnough = search_keywords.some((keyword) =>
        fieldValue
          .split(" ")
          .some((word) => levenshteinDistance(word, keyword) <= 2)
      );

      if (isCloseEnough && !uniqueDocs.has(uniqueId)) {
        uniqueDocs.add(uniqueId);
        results.push(rest);
      }
    }
    return results;
  }
}
