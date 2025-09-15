import type { BulkWriter } from "@google-cloud/firestore";
import { firestore } from "firebase-admin";
import type {
  FirestoreSearchEngineConfig,
  FirestoreSearchEngineMultiIndexesProps,
} from "..";
import { fse_vectorizeText } from "../shared/vectorize";

/**
 * Unified indexes class for multi-field processing
 * Supports vectorization of multiple fields with weights and custom storage
 */
export class Indexes {
  wordMinLength: number;
  wordMaxLength: number;

  constructor(
    private readonly firestoreInstance: firestore.Firestore,
    private readonly fieldValueInstance: typeof firestore.FieldValue,
    private readonly config: FirestoreSearchEngineConfig,
    private readonly props: FirestoreSearchEngineMultiIndexesProps
  ) {
    this.wordMinLength = config.wordMinLength || 3;
    this.wordMaxLength = config.wordMaxLength || 50;
  }

  /**
   * Indexes a document with multiple fields using batch vectorization
   * Creates a single document with multiple _vector_[fieldName] fields
   */
  async indexes(): Promise<void> {
    const indexedDocumentPath = this.props.returnedFields.indexedDocumentPath;

    try {
      // Préparer les données pour la vectorisation en batch
      const fieldsToVectorize: { [fieldName: string]: string } = {};
      const fieldConfigs = this.props.inputFields;

      // Collecter tous les textes à vectoriser
      for (const [fieldName, fieldConfig] of Object.entries(fieldConfigs)) {
        const fieldValue = this.props.returnedFields[fieldName];
        if (fieldValue && typeof fieldValue === "string") {
          const cleanText = fieldValue.toLowerCase().trim();
          if (
            cleanText.length >= this.wordMinLength &&
            cleanText.length <= this.wordMaxLength
          ) {
            fieldsToVectorize[fieldName] = cleanText;
          }
        }
      }

      if (Object.keys(fieldsToVectorize).length === 0) {
        console.warn(
          `⚠️ Aucun champ valide à indexer pour ${indexedDocumentPath}`
        );
        return;
      }

      // Vectorisation en batch (optimisé)
      const vectorBatch = await this.batchVectorize(fieldsToVectorize);

      // Créer un seul document avec tous les vecteurs
      const indexDocument: any = {
        ...this.props.returnedFields,
        _indexed_at: this.fieldValueInstance.serverTimestamp(),
        _field_weights: {},
        _field_configs: {},
      };

      // Ajouter tous les vecteurs au même document
      for (const [fieldName, vector] of Object.entries(vectorBatch)) {
        const fieldConfig = fieldConfigs[fieldName];

        // Utiliser le format _vector_[fieldName]
        indexDocument[`_vector_${fieldName}`] =
          this.fieldValueInstance.vector(vector);
        indexDocument[`${fieldName}_original`] = fieldsToVectorize[fieldName];
        indexDocument._field_weights[fieldName] = fieldConfig?.weight || 1.0;
        indexDocument._field_configs[fieldName] = {
          fuzzySearch: fieldConfig?.fuzzySearch ?? true,
          weight: fieldConfig?.weight || 1.0,
        };
      }

      // Sauvegarder dans la collection de recherche
      const searchIndexRef = this.firestoreInstance
        .collection(this.config.collection)
        .doc();

      await searchIndexRef.set(indexDocument);

      console.log(
        `✅ Multi-index créé avec ${
          Object.keys(fieldsToVectorize).length
        } vecteurs dans collection "${
          this.config.collection
        }": ${indexedDocumentPath}`
      );
    } catch (error) {
      console.error(
        `❌ Erreur lors de l'indexation multi-champs de ${indexedDocumentPath}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Bulk indexes operation for multiple documents
   * Creates a single document with multiple _vector_[fieldName] fields
   */
  async bulkIndexes(bulkWriter: BulkWriter): Promise<void> {
    const indexedDocumentPath = this.props.returnedFields.indexedDocumentPath;
    const docRef = this.firestoreInstance
      .collection(this.config.collection)
      .doc();

    try {
      // Préparer les données pour la vectorisation
      const fieldsToVectorize: { [fieldName: string]: string } = {};
      const fieldConfigs = this.props.inputFields;

      for (const [fieldName, fieldConfig] of Object.entries(fieldConfigs)) {
        const fieldValue = this.props.returnedFields[fieldName];
        if (fieldValue && typeof fieldValue === "string") {
          const cleanText = fieldValue.toLowerCase().trim();
          if (
            cleanText.length >= this.wordMinLength &&
            cleanText.length <= this.wordMaxLength
          ) {
            fieldsToVectorize[fieldName] = cleanText;
          }
        }
      }

      if (Object.keys(fieldsToVectorize).length === 0) {
        return; // Skip silently in bulk operations
      }

      // Vectorisation en batch
      const vectorBatch = await this.batchVectorize(fieldsToVectorize);

      // Préparer le document d'index avec tous les vecteurs
      const indexDocument: any = {
        ...this.props.returnedFields,
        _indexed_at: this.fieldValueInstance.serverTimestamp(),
        _field_weights: {},
        _field_configs: {},
      };

      // Ajouter tous les vecteurs au même document
      for (const [fieldName, vector] of Object.entries(vectorBatch)) {
        const fieldConfig = fieldConfigs[fieldName];

        indexDocument[`_vector_${fieldName}`] =
          this.fieldValueInstance.vector(vector);
        indexDocument[`${fieldName}_original`] = fieldsToVectorize[fieldName];
        indexDocument._field_weights[fieldName] = fieldConfig?.weight || 1.0;
        indexDocument._field_configs[fieldName] = {
          fuzzySearch: fieldConfig?.fuzzySearch ?? true,
          weight: fieldConfig?.weight || 1.0,
        };
      }

      // Ajouter à la queue du bulk writer
      bulkWriter.set(docRef, indexDocument);
    } catch (error) {
      console.error(
        `❌ Erreur bulk indexation multi-champs de ${indexedDocumentPath}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Batch vectorization of multiple fields using fastEmbed
   */
  private async batchVectorize(fieldsToVectorize: {
    [fieldName: string]: string;
  }): Promise<{ [fieldName: string]: number[] }> {
    try {
      // Préparer les textes pour la vectorisation en batch
      const fieldNames = Object.keys(fieldsToVectorize);
      const texts = Object.values(fieldsToVectorize);

      if (texts.length === 0) {
        return {};
      }

      // Vectorisation en une seule fois (plus efficace)
      const vectors = await Promise.all(
        texts.map((text) => fse_vectorizeText(text, this.wordMaxLength))
      );

      // Reconstituer l'objet avec les noms de champs
      const result: { [fieldName: string]: number[] } = {};
      fieldNames.forEach((fieldName, index) => {
        result[fieldName] = vectors[index];
      });

      return result;
    } catch (error) {
      console.error("❌ Erreur lors de la vectorisation en batch:", error);
      throw error;
    }
  }

  /**
   * Delete index for a document
   */
  async deleteIndex(): Promise<void> {
    const indexedDocumentPath = this.props.returnedFields.indexedDocumentPath;

    try {
      // Supprimer le document d'index
      const query = await this.firestoreInstance
        .collection(this.config.collection)
        .where("indexedDocumentPath", "==", indexedDocumentPath)
        .get();

      if (query.empty) return;

      const batch = this.firestoreInstance.batch();
      query.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      console.log(
        `🗑️ Index multi-champs supprimé de la collection "${this.config.collection}": ${indexedDocumentPath}`
      );
    } catch (error) {
      console.error(
        `❌ Erreur lors de la suppression de l'index multi-champs ${indexedDocumentPath}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Update index for a document (re-index all fields)
   */
  async updateIndex(): Promise<void> {
    // Supprimer l'ancien index d'abord
    await this.deleteIndex();
    // Puis recréer
    await this.indexes();
  }

  /**
   * Remove indexes (alias for deleteIndex for backward compatibility)
   */
  async remove(): Promise<void> {
    await this.deleteIndex();
  }

  /**
   * Execute method (alias for indexes for backward compatibility)
   */
  async execute(): Promise<void> {
    await this.indexes();
  }
}
