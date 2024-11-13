import { EmbeddingModel, ExecutionProvider, FlagEmbedding } from "fastembed";
/**
 * Function that vectorizes a given text using a Flag Embedding model.
 * @param text The text to be vectorized.
 * @returns A vector representation of the text.
 */

export async function fse_vectorizeText(text: string, maxLength: number) {
  if (text.length === 0) return [];
  const embeddingModel = await FlagEmbedding.init({
    model: EmbeddingModel.AllMiniLML6V2,
    cacheDir: "src/cache",
    executionProviders: [ExecutionProvider.CPU],
    maxLength: maxLength,
  });
  let documents = [`query: ${text}`];
  const embeddings = embeddingModel.embed(documents, 1); //Optional batch size. Defaults to 256
  const vectors = (await embeddings.next()) as any;
  const finalVector = vectors?.value.length > 0 ? vectors.value : [];
  return Array.from(finalVector[0]) as number[];
}
