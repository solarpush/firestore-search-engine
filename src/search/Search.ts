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
  distanceThreshold: number;
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
    if (
      this.props.distanceThreshold !== undefined &&
      typeof this.props.distanceThreshold === "number" &&
      this.props.distanceThreshold > 0 &&
      this.props.distanceThreshold < 1
    ) {
      // Prioritize the value from `props` if it is valid
      this.distanceThreshold = this.props.distanceThreshold;
    } else if (
      this.config.distanceThreshold !== undefined &&
      typeof this.config.distanceThreshold === "number" &&
      this.config.distanceThreshold > 0 &&
      this.config.distanceThreshold < 1
    ) {
      // Use the value from `config` if it is valid
      this.distanceThreshold = this.config.distanceThreshold;
    } else {
      // Default
      console.log({
        message: "DistanceThreshold must be a float between 0 and 1",
      });
      this.distanceThreshold = 0.2;
    }
  }
  async execute() {
    return await this.search(this.props.fieldValue);
  }
  protected async search(
    fieldValue: string
  ): Promise<FirestoreSearchEngineReturnType> {
    const queryVector = await fse_vectorizeText(fieldValue, this.wordMaxLength);

    // Pour la recherche multi-champs, utiliser le nom du champ vectoriel spécifique
    const vectorFieldName = this.props.fieldFilter
      ? `_vector_${this.props.fieldFilter}`
      : this.props.vectorFieldName || "vectors";

    console.log("🔍 Configuration de la recherche:", {
      vectorField: vectorFieldName,
      queryVectorLength: queryVector.length,
      queryVectorPreview: queryVector.slice(0, 5),
      limit: this.props.limit as number,
      distanceMeasure: "COSINE",
      distanceThreshold: this.props.distanceThreshold ?? this.distanceThreshold,
      fieldFilter: this.props.fieldFilter,
    });

    // Test: check documents in collection first
    const allDocs = await this.firestoreInstance
      .collectionGroup(this.config.collection)
      .limit(5)
      .get();

    console.log(`📚 Total docs in collection: ${allDocs.size}`);
    allDocs.docs.forEach((doc, i) => {
      const data = doc.data();
      console.log(
        `📄 Doc ${i}: fieldFilter=${
          this.props.fieldFilter
        }, hasVectorField=${!!data[vectorFieldName]}, vectorLength=${
          data[vectorFieldName] ? "VectorValue" : "N/A"
        }`
      );
    });

    const querySnapshot = await this.firestoreInstance
      .collectionGroup(this.config.collection)
      .findNearest({
        vectorField: vectorFieldName,
        queryVector: queryVector,
        limit: this.props.limit as number,
        distanceMeasure: "COSINE",
        // Remove threshold temporarily to see if any documents match
        // distanceThreshold: this.props.distanceThreshold ?? this.distanceThreshold,
        distanceResultField: "distance",
      })
      .get();

    console.log("📊 findNearest results:", {
      isEmpty: querySnapshot.empty,
      docsCount: querySnapshot.docs.length,
    });

    if (querySnapshot.empty) {
      console.log("❌ No documents found with findNearest");
      return [];
    }

    const uniqueDocs = new Set<string>();
    const results: any[] = [];

    for (const doc of querySnapshot.docs) {
      const data =
        doc.data() as FirestoreSearchEngineIndexesProps["returnedFields"] & {
          [key: string]: any;
          distance?: number;
        };

      console.log(
        `📄 Found doc: fieldFilter=${this.props.fieldFilter}, distance=${data.distance}`
      );

      const uniqueId = data.indexedDocumentPath;
      if (!uniqueDocs.has(uniqueId)) {
        uniqueDocs.add(uniqueId);

        // Add relevance score based on distance
        const relevanceScore = data.distance ? 1 - data.distance : 1.0;

        // Pour les recherches multi-champs, ajouter le texte original du champ spécifique
        if (this.props.fieldFilter) {
          const originalFieldKey = `${this.props.fieldFilter}_original`;
          data.fieldValue = data[originalFieldKey] || "";
        }

        results.push({
          ...data,
          _relevanceScore: relevanceScore,
        });

        console.log(`✅ Added to results: relevanceScore=${relevanceScore}`);
      }
    }

    // Rank results considering fuzzy search if enabled
    let ranked = results;
    if (this.props.fuzzySearch !== false) {
      ranked = fse_rankResults(results, fieldValue);
    } else {
      ranked = results.sort(
        (a, b) => (b._relevanceScore || 0) - (a._relevanceScore || 0)
      );
    }

    console.log(`🏆 Final results: ${ranked.length} documents`);
    return ranked;
  }
}
