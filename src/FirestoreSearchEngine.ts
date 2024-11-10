import type { Firestore } from "@google-cloud/firestore";
import {
  FirestoreSearchEngineConfig,
  FirestoreSearchEngineIndexesProps,
  FirestoreSearchEngineSearchProps,
} from ".";
import { Indexes } from "./indexes/Indexes";
import { Search } from "./search/Search";
export class FirestoreSearchEngine {
  constructor(
    private firestoreInstance: Firestore,
    private config: FirestoreSearchEngineConfig
  ) {
    //Configure Firestore for never throw if undefined value
    this.firestoreInstance.settings({ ignoreUndefinedProperties: true });
  }
  async search(props: FirestoreSearchEngineSearchProps) {
    if (typeof props.fieldValue !== "string" || props.fieldValue.length === 0) {
      throw new Error("fieldValue is required and must be a non-empty string.");
    }
    return await new Search(
      this.firestoreInstance,
      this.config,
      props
    ).execute();
  }
  async indexes(props: FirestoreSearchEngineIndexesProps) {
    if (typeof props.inputField !== "string" || props.inputField.length === 0) {
      throw new Error("fieldValue is required and must be a non-empty string.");
    }
    return await new Indexes(
      this.firestoreInstance,
      this.config,
      props
    ).execute();
  }
}
