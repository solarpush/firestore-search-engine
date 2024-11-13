import { EmbeddingModel, FlagEmbedding } from "fastembed";

export async function fse_vectorizeText(text: string) {
  const embeddingModel = await FlagEmbedding.init({
    model: EmbeddingModel.BGEBaseEN,
  });
  let documents = [`query: ${text}`];
  const embeddings = embeddingModel.embed(documents, 1); //Optional batch size. Defaults to 256
  const vectors = (await embeddings.next()) as any;
  const finalVector = vectors?.value.length > 0 ? vectors.value : [];
  return Array.from(finalVector[0]) as number[];
}
