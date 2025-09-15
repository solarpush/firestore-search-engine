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
  FirestoreSearchEngineMultiSearchProps,
  FirestoreSearchEngineReturnType,
  FirestoreSearchEngineSearchProps,
  PathWithSubCollectionsMaxDepth4,
} from ".";
import { Indexes } from "./indexes/Indexes";
import { IndexesAll } from "./indexes/IndexesAll";
import { Search } from "./search/Search";
import { deepDiff } from "./utils/objects/deepDiff";
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
    // Configure Firestore seulement si demandé et si ce n'est pas déjà fait
    if (!this.config.skipFirestoreSettings) {
      try {
        this.firestoreInstance.settings({ ignoreUndefinedProperties: true });
      } catch (error) {
        // Firestore déjà configuré, on ignore l'erreur
        if (
          error instanceof Error &&
          !error.message.includes("already been initialized")
        ) {
          throw error;
        }
      }
    }

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
   * Multi-field indexing with batch vectorization
   * Supports multiple fields with weights and fuzzy search configuration
   * Stores vectors as _vector_[fieldName] format
   */
  async indexes(props: FirestoreSearchEngineIndexesProps) {
    if (!props.inputFields || typeof props.inputFields !== "object") {
      throw new Error(
        "inputFields is required and must be an object with field configurations."
      );
    }

    if (Object.keys(props.inputFields).length === 0) {
      throw new Error("At least one field must be specified in inputFields.");
    }

    return await new Indexes(
      this.firestoreInstance,
      this.fieldValueInstance,
      this.config,
      props
    ).indexes();
  }

  /**
   * Remove multi-field indexes for a document
   */
  async removeIndexes(props: FirestoreSearchEngineIndexesProps) {
    if (!props.inputFields || typeof props.inputFields !== "object") {
      throw new Error(
        "inputFields is required and must be an object with field configurations."
      );
    }

    return await new Indexes(
      this.firestoreInstance,
      this.fieldValueInstance,
      this.config,
      props
    ).remove();
  }

  /**
   * Indexes all documents in the Firestore database.
   * @param {Object} docProps - The documents to index.
   * @param {FirestoreSearchEngineIndexesAllProps} docProps.documentProps - The properties of the documents to index.
   * @param {any[]} docProps.documentsToIndexes - The documents to index.
   * @return {Promise<any>} A promise that resolves to the result of the indexing operation.
   * @example
   *   const docProps = {
   *    documentProps: {
   *        indexedKeys: {
   *          'title': { weight: 1.0, fuzzySearch: true },
   *          'content': { weight: 0.8, fuzzySearch: true }
   *        },
   *        returnedKey: ['id', 'timestamp']
   *     },
   *    documentsToIndexes: [
   *        { indexedDocumentPath: 'docs/doc1', title: 'Hello World', content: 'This is an example document.' },
   *        { indexedDocumentPath: 'docs/doc2', title: 'Welcome to my site', content: 'This site contains useful information.' },
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
    documentsToIndexes: any[];
  }) {
    return await new IndexesAll(
      this.firestoreInstance,
      this.fieldValueInstance,
      this.config
    ).execute(docProps);
  }

  /**
   * Search in multiple fields with weighted results
   */
  public async searchMultiField(
    props: FirestoreSearchEngineMultiSearchProps
  ): Promise<any[]> {
    // Convert to traditional search format for each field and combine results
    const searchResults: any[] = [];
    const fieldNames = Object.keys(props.searchConfig);

    for (const fieldName of fieldNames) {
      const fieldConfig = props.searchConfig[fieldName];

      try {
        // Search in the specific vector field
        const fieldSearchProps: FirestoreSearchEngineSearchProps = {
          fieldValue: props.searchText,
          fuzzySearch: fieldConfig.fuzzySearch ?? true,
          limit: props.limit || 20,
          distanceThreshold: props.distanceThreshold || 0.8,
          // Use standard 'vectors' field for emulator compatibility
          vectorFieldName: `vectors`,
          // Add field filter for multi-field search
          fieldFilter: fieldName,
        };

        const fieldResults = await new Search(
          this.firestoreInstance,
          this.config,
          fieldSearchProps
        ).execute();

        // Apply field weight to results
        const weightedResults = fieldResults.map((result: any) => ({
          ...result,
          _fieldMatch: fieldName,
          _fieldWeight: fieldConfig.weight || 1.0,
          _relevanceScore:
            (result._relevanceScore || 1.0) * (fieldConfig.weight || 1.0),
        }));

        searchResults.push(...weightedResults);
      } catch (error) {
        console.warn(`⚠️ Erreur recherche champ ${fieldName}:`, error);
        // Continue with other fields
      }
    }

    // Combine and sort results by relevance score
    const combinedResults = this.combineMultiFieldResults(
      searchResults,
      props.limit || 20
    );

    return combinedResults;
  }

  /**
   * Combine and deduplicate multi-field search results
   */
  private combineMultiFieldResults(results: any[], limit: number): any[] {
    // Group by indexedDocumentPath to combine scores
    const groupedResults = new Map<string, any>();

    for (const result of results) {
      const docPath = result.indexedDocumentPath;

      if (groupedResults.has(docPath)) {
        const existing = groupedResults.get(docPath);
        // Combine relevance scores (take max or average)
        existing._relevanceScore = Math.max(
          existing._relevanceScore,
          result._relevanceScore
        );
        existing._matchedFields = existing._matchedFields || [];
        existing._matchedFields.push({
          field: result._fieldMatch,
          weight: result._fieldWeight,
          score: result._relevanceScore,
        });
      } else {
        groupedResults.set(docPath, {
          ...result,
          _matchedFields: [
            {
              field: result._fieldMatch,
              weight: result._fieldWeight,
              score: result._relevanceScore,
            },
          ],
        });
      }
    }

    // Convert back to array and sort by relevance
    const finalResults = Array.from(groupedResults.values())
      .sort((a, b) => b._relevanceScore - a._relevanceScore)
      .slice(0, limit);

    return finalResults;
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

      console.log(`🔍 Search request received:`, {
        searchValue,
        collection: this.config.collection,
        queryParams: req.query,
        wordMinLength: this.config.wordMinLength ?? 3,
      });

      if (
        !searchValue ||
        typeof searchValue !== "string" ||
        searchValue.length < (this.config.wordMinLength ?? 3)
      ) {
        console.log("WordMinLength catched - returning empty array");
        res.json([]);
        return;
      }

      try {
        console.log(`🚀 Starting search for: "${searchValue}"`);
        const result = await this.search({
          ...props,
          fieldValue: searchValue,
        });
        console.log(`✅ Search completed, found ${result.length} results`);
        res.status(200).json(result);
      } catch (error) {
        console.error(`❌ Search error:`, error);
        const errorResponse = this.buildError(error);
        console.error(`📝 Error response:`, errorResponse);
        res.status(400).json(errorResponse);
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
   * Wrapper pour trigger de création/écriture de document avec support multi-champs
   * @param {typeof onDocumentCreated} onDocumentWrittenCallBack - Le callback onDocumentCreated à wrapper
   * @param {object} documentProps - Les propriétés du document avec indexedKeys et returnedKey
   * @param {PathWithSubCollectionsMaxDepth4} documentsPath - Le chemin du document à indexer
   * @param {object} props - Les propriétés de configuration optionnelles
   * @param {EventHandlerOptions} eventHandlerOptions - Les options du gestionnaire d'événements
   * @return {Function} La fonction callback wrappée
   *
   * @example
   * export const firestoreWriter = searchEngineUserName.onDocumentWriteWrapper(
   *   onDocumentCreated,
   *   {
   *     indexedKeys: {
   *       "name": { weight: 1.0, fuzzySearch: true },
   *       "description": { weight: 0.5, fuzzySearch: false }
   *     },
   *     returnedKey: ["id", "setAt"]
   *   },
   *   "users/{userId}",
   *   { wordMaxLength: 25 },
   *   { region: "europe-west3" }
   * );
   */
  onDocumentWriteWrapper(
    onDocumentWrittenCallBack: typeof onDocumentCreated,
    documentProps: {
      indexedKeys: {
        [fieldName: string]: { weight?: number; fuzzySearch?: boolean };
      };
      returnedKey: string[];
    },
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

        // Construire les champs retournés
        const returnedFields: Record<string, any> = {
          indexedDocumentPath: event.data.ref.path,
        };

        for (const key of documentProps.returnedKey) {
          if (data[key] !== undefined) {
            returnedFields[key] = data[key];
          }
        }

        // Vérifier si au moins un champ à indexer existe et est valide
        const hasValidFields = Object.keys(documentProps.indexedKeys).some(
          (fieldName) => {
            const fieldValue = data[fieldName];
            return (
              fieldValue &&
              typeof fieldValue === "string" &&
              fieldValue.length > (props.wordMinLength ?? 3)
            );
          }
        );

        if (hasValidFields) {
          try {
            // Utiliser la nouvelle API multi-champs
            await this.indexes({
              inputFields: documentProps.indexedKeys,
              returnedFields: returnedFields as {
                indexedDocumentPath: string;
              } & Record<string, any>,
            });
          } catch (error) {
            console.error("❌ Erreur indexation multi-champs:", error);
            return;
          }
        }
        return;
      }
    );
  }

  /**
   * Wrapper pour trigger de mise à jour de document avec support multi-champs
   * @param {typeof onDocumentUpdated} instanceOfOnDocumentUpdated - Le callback onDocumentUpdated à wrapper
   * @param {object} documentProps - Les propriétés du document avec indexedKeys et returnedKey
   * @param {PathWithSubCollectionsMaxDepth4} documentsPath - Le chemin du document à indexer
   * @param {object} props - Les propriétés de configuration optionnelles
   * @param {EventHandlerOptions} eventHandlerOptions - Les options du gestionnaire d'événements
   * @return {Function} La fonction callback wrappée
   *
   * @example
   * export const firestoreUpdated = searchEngineUserName.onDocumentUpdateWrapper(
   *   onDocumentUpdated,
   *   {
   *     indexedKeys: {
   *       "name": { weight: 1.0, fuzzySearch: true },
   *       "description": { weight: 0.5, fuzzySearch: false }
   *     },
   *     returnedKey: ["id", "setAt"]
   *   },
   *   "users/{userId}",
   *   { wordMinLength: 3 },
   *   { region: "europe-west3" }
   * );
   */
  onDocumentUpdateWrapper(
    instanceOfOnDocumentUpdated: typeof onDocumentUpdated,
    documentProps: {
      indexedKeys: {
        [fieldName: string]: { weight?: number; fuzzySearch?: boolean };
      };
      returnedKey: string[];
    },
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

        const { changes, after, deleted } = deepDiff(
          event.data.before.data() || {},
          event.data.after.data() || {}
        );

        // Gérer les suppressions pour chaque champ indexé
        const deletedFields = Object.keys(documentProps.indexedKeys).filter(
          (fieldName) => {
            const deletedValue = deleted[fieldName];
            return deletedValue && typeof deletedValue === "string";
          }
        );

        for (const fieldName of deletedFields) {
          const deletedFieldValue = deleted[fieldName];
          try {
            // Créer un objet temporaire pour la suppression
            const tempProps = {
              inputFields: { [fieldName]: { weight: 1.0, fuzzySearch: true } },
              returnedFields: {
                indexedDocumentPath: event.data.after.ref.path,
                [fieldName]: deletedFieldValue,
              },
            };
            await this.removeIndexes(tempProps);
          } catch (error) {
            console.error(
              `❌ Erreur suppression index champ ${fieldName}:`,
              error
            );
          }
        }

        // Construire les champs retournés
        const returnedFields: Record<string, any> = {
          indexedDocumentPath: event.data.after.ref.path,
        };

        for (const key of documentProps.returnedKey) {
          if (after[key] !== undefined) {
            returnedFields[key] = after[key];
          }
        }

        // Vérifier si au moins un champ modifié est valide pour l'indexation
        const hasValidChanges = Object.keys(documentProps.indexedKeys).some(
          (fieldName) => {
            const updatedValue = changes[fieldName];
            return (
              updatedValue &&
              typeof updatedValue === "string" &&
              updatedValue.length > (props.wordMinLength ?? 3)
            );
          }
        );

        if (hasValidChanges) {
          try {
            // Utiliser la nouvelle API multi-champs pour réindexer
            await this.indexes({
              inputFields: documentProps.indexedKeys,
              returnedFields: returnedFields as {
                indexedDocumentPath: string;
              } & Record<string, any>,
            });
          } catch (error) {
            console.error("❌ Erreur réindexation multi-champs:", error);
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
      " collection.";

    let errorDetails: any;
    if (error instanceof Error) {
      errorDetails = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    } else if (typeof error === "object" && error !== null) {
      errorDetails = error;
    } else {
      errorDetails = { rawError: String(error) };
    }

    return {
      message,
      error: errorDetails,
      trace,
      timestamp: new Date().toISOString(),
      collection: this.config.collection,
    };
  }
}
