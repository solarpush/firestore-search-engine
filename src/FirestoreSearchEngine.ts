import type { Firestore } from "@google-cloud/firestore";
import type { Application, Request, Response } from "express";
import { firestore } from "firebase-admin";
import { CallableRequest, HttpsError } from "firebase-functions/https";
import type { EventHandlerOptions } from "firebase-functions/options";
import type {
  onDocumentCreated,
  onDocumentDeleted,
  onDocumentUpdated,
} from "firebase-functions/v2/firestore";
import type {
  FirestoreSearchEngineConfig,
  FirestoreSearchEngineIndexesAllProps,
  FirestoreSearchEngineIndexesProps,
  FirestoreSearchEngineReturnType,
  FirestoreSearchEngineSearchProps,
  PathWithSubCollectionsMaxDepth4,
} from ".";
import { Indexes } from "./indexes/Indexes";
import { IndexesAll } from "./indexes/IndexesAll";
import { Search } from "./search/Search";
import { getDiffFromUpdatedData } from "./shared/getDiffFromDocumentUpdate";
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
    private readonly config: FirestoreSearchEngineConfig,
    private readonly fieldValueInstance: typeof firestore.FieldValue
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
   * const results = await firestoreSearchEngine.search({ fieldValue: 'searchQuery', limit: 10 });
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
      this.fieldValueInstance,
      this.config,
      props
    ).execute();
  }

  /**
   * Indexes all documents in the Firestore database.
   * @param {Object} docProps - The documents to index.
   * @param {FirestoreSearchEngineIndexesAllProps} docProps.documentProps - The properties of the documents to index.
   * @param {FirestoreSearchEngineIndexesProps['returnedFields'][]} docProps.documentsToIndexes - The fields of the documents to index.
   * @return {Promise<any>} A promise that resolves to the result of the indexing operation.
   * @example
   *   const docProps = {
   *    documentProps: {
   *        fieldsToIndex: ['title', 'content'],
   *     },
   *    documentsToIndexes: [
   *        { documentId: 'doc1', title: 'Hello World', content: 'This is an example document.' },
   *        { documentId: 'doc2', title: 'Welcome to my site', content: 'This site contains useful information.' },
   *     ],
   *  };
   *
   *  firestoreSearchEngine.indexesAll(docProps)
   *  .then((result) => {
   *    console.log('Indexing completed successfully:', result);
   *  })
   *  .catch((error) => {
   *    console.error('Error indexing documents:', error);
   *  });
   *
   */
  async indexesAll(docProps: {
    documentProps: FirestoreSearchEngineIndexesAllProps;
    documentsToIndexes: FirestoreSearchEngineIndexesProps["returnedFields"][];
  }) {
    return await new IndexesAll(
      this.firestoreInstance,
      this.fieldValueInstance,
      this.config
    ).execute(docProps);
  }
  async expressWrapper(
    app: Application,
    path: string = "/search",
    props?: Omit<FirestoreSearchEngineSearchProps, "fieldValue">
  ) {
    if (!path || !path.startsWith("/"))
      throw new Error("Path must be in the format '/search'");
    app.get(
      `${path}/:searchValue`,
      async (request: Request, response: Response) => {
        const { searchValue } = request.params;
        if (
          !searchValue ||
          typeof searchValue !== "string" ||
          searchValue.length < (this.config.wordMinLength ?? 3)
        ) {
          console.log("WordMinLenght catched");
          response.json([]);
          return;
        }
        try {
          const result = await this.search({
            ...props,
            fieldValue: searchValue,
          });
          response.status(200).json(result);
        } catch (error) {
          response.status(400).json(this.buildError(error));
        }
        return;
      }
    );
    return app;
  }

  /**
   * Wraps an Express application and adds a route for performing a search.
   * @param {Application} app - The Express application to wrap.
   * @param {string} [path="/search"] - The path to bind the search route to (default: "/search").
   * @return {Application} The wrapped Express application.
   *
   * @example
   * const app = express();
   * const firestoreSearchEngine = new FirestoreSearchEngine(firestoreInstance, fieldValueInstance, config);
   * firestoreSearchEngine.expressWrapper(app, "/api/search");
   */
  onRequestWrapped(
    props?: Omit<FirestoreSearchEngineSearchProps, "fieldValue">
  ): (request: Request, response: Response<any>) => void | Promise<void> {
    return async (req, res) => {
      const searchValue = req.query.searchValue;
      if (
        !searchValue ||
        typeof searchValue !== "string" ||
        searchValue.length < (this.config.wordMinLength ?? 3)
      ) {
        console.log("WordMinLenght catched");
        res.json([]);
        return;
      }
      try {
        const result = await this.search({
          ...props,
          fieldValue: searchValue,
        });
        res.status(200).json(result);
      } catch (error) {
        res.status(400).json(this.buildError(error));
      }
      return;
    };
  }

  /**
   * Wraps a callable function with authentication and search functionality.
   * @param {(auth: CallableRequest["auth"]) => Promise<boolean> | boolean} authCallBack - A callback function to perform authentication.
   * @return {(data: CallableRequest) => Promise<FirestoreSearchEngineReturnType>} A function that performs authentication, search, and returns the search results.
   *
   * @example
   * import { FirestoreSearchEngine } from "firestore-search-engine";
   *
   * const authCallback = (auth: CallableRequest["auth"]) => {
   *    if (auth && auth.uid) return true;
   *    return false;
   *  };
   *  export const onCallSearchWrapped = onCall(
   *    { region: "europe-west3" },
   *    searchEngineUserName.onCallWrapped(authCallback)
   *  );
   *  //in Front-end callableFunction call with :
   *  //
   *  httpsCallable(searchUserName)({ searchValue: inputValue });
   *  //method: Managed from front package.json file
   */
  onCallWrapped(
    authCallBack: (auth: CallableRequest["auth"]) => Promise<boolean> | boolean,
    props?: Omit<FirestoreSearchEngineSearchProps, "fieldValue">
  ): (data: CallableRequest) => Promise<FirestoreSearchEngineReturnType> {
    return async ({ data, auth }) => {
      if (authCallBack) {
        const isAuthorized = await authCallBack(auth);
        if (!isAuthorized)
          throw new HttpsError("unauthenticated", "Unauthorized");
      }
      const searchValue = data.searchValue;
      if (
        !searchValue ||
        typeof searchValue !== "string" ||
        searchValue.length < (this.config.wordMinLength ?? 3)
      ) {
        console.log("WordMinLenght catched");
        return [];
      }
      try {
        const result = await this.search({
          ...props,
          fieldValue: searchValue,
        });
        return result;
      } catch (error) {
        const err = this.buildError(error);
        throw new HttpsError("aborted", err.message, err);
      }
    };
  }

  /**
   * Wraps an onDocumentWritten callback function in Firestore.
   * @param {OnDocumentWrittenCallback} onDocumentWrittenCallBack - The callback function to wrap.
   * @param {FirestoreSearchEngineDocumentProps} documentProps - The properties of the document to index.
   * @param {FirestoreSearchEngineDocumentPath} documentsPath - The path of the documents to index.
   * @param {FirestoreSearchEngineConfigProps} [props={}] - The configuration properties for the search engine.
   * @param {EventHandlerOptions} [eventHandlerOptions={}] - The options for the event handler.
   * @return {Function} The wrapped onDocumentWritten callback function.
   *
   * @example
   * export const firestoreWriter = searchEngineUserName.onDocumentWriteWrapper(
   *    onDocumentCreated, // onDocumentCreated method
   *    { indexedKey: "test", returnedKey: ["other", "setAt"] }, // the key you want to index and return in the search result
   *    "test/{testId}", //documentPath or subCollectionDocumentPath  && 5 recursive level only
   *    { wordMaxLength: 25 }, //optional config object set undefined, to default accept wordMinLength: 3, wordMaxLength: 50 for indexing control and reduce indexing size
   *    { region: "europe-west3" } //EventHandlerOptions optional
   *  );
   */
  onDocumentWriteWrapper(
    onDocumentWrittenCallBack: typeof onDocumentCreated,
    documentProps: { indexedKey: string; returnedKey: string[] },
    documentsPath: PathWithSubCollectionsMaxDepth4,
    props: Pick<
      FirestoreSearchEngineConfig,
      "wordMaxLength" | "wordMinLength"
    > = {},
    eventHandlerOptions: EventHandlerOptions = {}
  ) {
    return onDocumentWrittenCallBack(
      { ...eventHandlerOptions, document: documentsPath },
      async (event) => {
        const data = event.data?.data();
        if (!event.data || !data) return;

        const updatedFieldValue = data[documentProps.indexedKey];
        const returnedFields: Record<string, any> = {};
        for (const key of documentProps.returnedKey) {
          if (data[key] || data[key] === 0) {
            returnedFields[key] = data[key];
          }
        }
        if (
          updatedFieldValue &&
          typeof updatedFieldValue === "string" &&
          updatedFieldValue.length > (props.wordMinLength ?? 3)
        ) {
          try {
            await this.indexes({
              ...props,
              inputField: updatedFieldValue,
              returnedFields: {
                indexedDocumentPath: event.data.ref.path,
                ...returnedFields,
              },
            });
          } catch (error) {
            console.error(error);
            return;
          }
        }
        return;
      }
    );
  }
  /**
   * Wraps an onDocumentUpdated callback function in Firestore.
   * @param {OnDocumentUpdatedCallback} instanceOfOnDocumentUpdated - The callback function to wrap.
   * @param {FirestoreSearchEngineDocumentProps} documentProps - The properties of the document to index.
   * @param {FirestoreSearchEngineDocumentPath} documentsPath - The path of the document to index.
   * @param {FirestoreSearchEngineConfigProps} [props={}] - The configuration properties for the search engine.
   * @param {EventHandlerOptions} [eventHandlerOptions={}] - The options for the event handler.
   * @return {Function} The wrapped onDocumentUpdated callback function.
   *
   * @example
   *export const firestoreUpdated = searchEngineUserName.onDocumentUpdateWrapper(
   * onDocumentUpdated, // onDocumentUpdated method
   *  { indexedKey: "test", returnedKey: ["other", "setAt"] }, // the key you want to index and return in the search result
   *  "test/{testId}", //documentPath or subCollectionDocumentPath  && 5 recursive level only
   *  { wordMinLength: 3 }, //optional config object set {} to default accept wordMinLength: 3, wordMaxLength: 50 for indexing control
   *  { region: "europe-west3" } //EventHandlerOptions optional
   *);
   */
  onDocumentUpdateWrapper(
    instanceOfOnDocumentUpdated: typeof onDocumentUpdated,
    documentProps: { indexedKey: string; returnedKey: string[] },
    documentsPath: PathWithSubCollectionsMaxDepth4,
    props: Pick<
      FirestoreSearchEngineConfig,
      "wordMaxLength" | "wordMinLength"
    > = {},
    eventHandlerOptions: EventHandlerOptions = {}
  ) {
    return instanceOfOnDocumentUpdated(
      { ...eventHandlerOptions, document: documentsPath },
      async (event) => {
        if (!event.data) return;
        const { changes, after } = getDiffFromUpdatedData<{
          [key: string]: any;
        }>(event.data);
        const updatedFieldValue = changes[documentProps.indexedKey];
        const returnedFields: Record<string, any> = {};
        for (const key of documentProps.returnedKey) {
          if (after[key] || after[key] === 0) {
            returnedFields[key] = after[key];
          }
        }
        if (
          updatedFieldValue &&
          typeof updatedFieldValue === "string" &&
          updatedFieldValue.length > (props.wordMinLength ?? 3)
        ) {
          try {
            await this.indexes({
              ...props,
              inputField: updatedFieldValue,
              returnedFields: {
                indexedDocumentPath: event.data.after.ref.path,
                ...returnedFields,
              },
            });
          } catch (error) {
            console.error(error);
            return;
          }
        }
        return;
      }
    );
  }
  /**
   * Wraps an onDocumentDeleted callback function in Firestore.
   * @param {OnDocumentDeletedCallback} instanceOfOnDocumentDeleted - The callback function to wrap.
   * @param {FirestoreSearchEngineDocumentPath} documentsPath - The path of the document to delete.
   * @param {FirestoreSearchEngineConfigProps} [eventHandlerOptions={}] - The options for the event handler.
   * @return {Function} The wrapped onDocumentDeleted callback function.
   * export const firestoreDeleted = searchEngineUserName.onDocumentDeletedWrapper(
   *  onDocumentDeleted, // onDocumentDeleted method
   *  "test/{testId}", //documentPath or subCollectionDocumentPath  && 5 recursive level only
   *  { region: "europe-west3" } //EventHandlerOptions optional
   *  );
   */
  onDocumentDeletedWrapper(
    instanceOfOnDocumentDeleted: typeof onDocumentDeleted,
    documentsPath: PathWithSubCollectionsMaxDepth4,
    eventHandlerOptions: EventHandlerOptions = {}
  ) {
    return instanceOfOnDocumentDeleted(
      { ...eventHandlerOptions, document: documentsPath },
      async (event) => {
        const data = event.data?.data();
        if (!event.data || !data) return;
        try {
          const bulk = this.firestoreInstance.bulkWriter();
          const indexedDocumentPath = event.data.ref.path;
          const querySnap = await this.firestoreInstance
            .collection(this.config.collection)
            .where("indexedDocumentPath", "==", indexedDocumentPath)
            .get();
          for (let index = 0; index < querySnap.docs.length; index++) {
            const doc = querySnap.docs[index];
            bulk.delete(doc.ref);
            if (index > 500) await bulk.flush();
          }
          await bulk.close();
        } catch (error) {
          return;
        }

        return;
      }
    );
  }

  buildError(error: unknown) {
    const trace = new Error().stack;
    const message =
      "An error was ocured at search endpoint for " +
      this.config.collection +
      "path collection.";

    const errors = typeof error === "object" ? error : JSON.stringify(error);
    return { message, error: errors, trace };
  }
}
