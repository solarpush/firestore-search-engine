import { EmbeddingModel, ExecutionProvider, FlagEmbedding } from "fastembed";

/**
 * Singleton instance of the embedding model.
 */
let embeddingModel: FlagEmbedding | null = null;
/**
 * Initialize the embedding model if not already initialized.
 */
async function getEmbeddingModel(maxLength: number): Promise<FlagEmbedding> {
  if (!embeddingModel) {
    embeddingModel = await FlagEmbedding.init({
      model: EmbeddingModel.AllMiniLML6V2,
      // modelAbsoluteDirPath: path.resolve(
      //   getDirname(import.meta.url),
      //   "../cache/custom"
      // ),
      // modelName: "model_quint8_avx2.onnx",
      cacheDir: "src/cache",
      executionProviders: [ExecutionProvider.CPU],
      maxLength: maxLength,
    });
  }
  return embeddingModel;
}
/**
 * Function that vectorizes a given text using a Flag Embedding model.
 * @param text The text to be vectorized.
 * @returns A vector representation of the text.
 */

export async function fse_vectorizeText(text: string, maxLength: number) {
  if (text.length === 0) return [];
  let documents = [`query: ${text}`];
  // Ensure the model is initialized
  const model = await getEmbeddingModel(maxLength);
  const embeddings = model.embed(documents, 1); //Optional batch size. Defaults to 256
  const vectors = (await embeddings.next()) as any;
  const finalVector = vectors?.value.length > 0 ? vectors.value : [];
  return Array.from(finalVector[0]) as number[];
}
