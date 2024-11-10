import type { Firestore } from "@google-cloud/firestore";
import {
  FirestoreSearchEngineConfig,
  FirestoreSearchEngineIndexesProps,
  FirestoreSearchEngineReturnType,
  FirestoreSearchEngineSearchProps,
} from ".";
import { Indexes } from "./indexes/Indexes";
import { Search } from "./search/Search";
/**
 * Configures the Firestore instance and throws an error if a necessary
 * condition (collection name being a non-empty string) is not satisfied.
 *
 * @typedef {Object} Firestore - An instance of Google Cloud Firestore. For an example, refer to Firestore documentation.
 * @typedef {Object} FirestoreSearchEngineConfig - Object specifying FirestoreSearchEngine configuration.
 * Example:
 *  {
 *    "collection": "indexedCollectionName",
 *  }
 *
 * @param {Firestore} firestoreInstance - An instance of Firestore.
 * @param {FirestoreSearchEngineConfig} config - An instance of FirestoreSearchEngine configuration.
 * @throws {Error} If the collection name in the configuration is an empty string.
 *
 * For further details on Firestore, refer to the official Google Cloud Firestore [firestore documentation](https://cloud.google.com/firestore/docs).
 * For further details on Firestore Search Engine, refer to the [Firestore Search Engine documentation](https://github.com/solarpush/firestore-search-engine).
 * For specifics about FirestoreSearchEngine configuration, please refer to its related documentation. Key aspects to consider are the Firestore instance to use and the necessary configurations for the search engine.
 * In case an empty string is passed as the collection name in the configuration, it throws an error indicating the need for a valid collection name.
 */

export class FirestoreSearchEngine {
  constructor(
    private readonly firestoreInstance: Firestore,
    private readonly config: FirestoreSearchEngineConfig
  ) {
    //Configure Firestore for never throw if undefined value
    this.firestoreInstance.settings({ ignoreUndefinedProperties: true });
    if (this.config.collection.length < 1)
      throw new Error(
        "collectionName is required and must be a non-empty string."
      );
  }

  /**
   * Conducts a search operation in the Firestore collection configured for this FirestoreSearchEngine instance,
   * and delivers the search results.
   * @example
   * const firestoreSearchEngine = new FirestoreSearchEngine(firestoreInstance, { collection: 'myCollection' });
   * const results = await firestoreSearchEngine.search({ fieldValue: 'searchQuery' });
   * console.log(results);//{ [x: string]: any; indexedDocumentPath: string; }[]
   *
   * @param {FirestoreSearchEngineSearchProps} props - An object specifying the details of the search query operation.
   * @returns {Promise<FirestoreSearchEngineReturnType>} A Promise that resolves with the results of the search operation.
   * @throws {Error} If an error is encountered during the search operation, the error is thrown.
   *
   * For more information and usage examples, refer to the Firestore Search Engine [documentation](https://github.com/solarpush/firestore-search-engine).
   */
  async search(
    props: FirestoreSearchEngineSearchProps
  ): Promise<FirestoreSearchEngineReturnType> {
    if (typeof props.fieldValue !== "string" || props.fieldValue.length === 0) {
      throw new Error("fieldValue is required and must be a non-empty string.");
    }
    return await new Search(
      this.firestoreInstance,
      this.config,
      props
    ).execute();
  }

  /**
   * Configures indexes in the configured Firestore collection to enable efficient query processing.
   * Indexes in Firestore are set up around an index field and a direction.
   *
   * Detailed parameters for index configuration include inputField, returnedFields, and wordMaxLength. The inputField is a string specifying the field
   * to index, returnedFields is an object specifying the fields to return in search results, and wordMaxLength is an optional
   * parameter that indicates the maximum length of words to be indexed.
   *
   * @example
   * const firestoreSearchEngine = new FirestoreSearchEngine(firestore(), { collection: 'myCollection' });
   * await firestoreSearchEngine.indexes({ inputField: 'name', returnedFields: { indexedDocumentPath: 'path/to/document', nameOfAdditionalField: 'value' }, wordMaxLength: 10 });
   *
   * @param {FirestoreSearchEngineIndexesProps} props - An object specifying the details of the index configuration.
   * @throws {Error} If an error is encountered during index creation, the error is thrown.
   *
   * For more information and usage examples, refer to the Firestore Search Engine [documentation](https://github.com/solarpush/firestore-search-engine).
   */
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

// new FirestoreSearchEngine
