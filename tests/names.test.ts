import { EmbeddingModel, ExecutionProvider, FlagEmbedding } from "fastembed";
import path from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";
import { names } from "./datasets/names";
function getDirname(metaUrl: string) {
  return path.dirname(fileURLToPath(metaUrl));
}
// cosine similarity helper
function cosine(a: number[], b: number[]): number {
  const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
  const normA = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
  const normB = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
  return dot / (normA * normB);
}
describe("cosine similarity", () => {
  describe("Embedding model precision for model_quint8_avx2", () => {
    it("should give higher similarity for semantically close sentences", async () => {
      const model = await FlagEmbedding.init({
        model: EmbeddingModel.CUSTOM,
        modelAbsoluteDirPath: path.resolve(
          getDirname(import.meta.url),
          "../src/cache/custom"
        ),
        modelName: "model_quint8_avx2.onnx",
        cacheDir: "src/cache",
        executionProviders: [ExecutionProvider.CUDA],
        maxLength: 100,
      });

      const sims: number[] = [];
      const gold: number[] = [];
      for (const { a, b, score } of names) {
        const { value: embA } = await model.embed([a]).next();
        const { value: embB } = await model.embed([b]).next();

        const sim = cosine(embA![0], embB![0]);
        sims.push(sim);
        gold.push(score / 5); // normaliser 0–1

        //   console.log(`${a} <-> ${b}: sim=${sim.toFixed(3)}, expected=${score}`);
      }

      // Exemple simple: vérifier la corrélation approximative
      const avgError =
        sims.reduce((s, v, i) => s + Math.abs(v - gold[i]), 0) / sims.length;

      console.log(
        "Names Average error for model_quint8_avx2 :",
        avgError.toFixed(3)
      );
      expect(avgError).toBeLessThan(0.3); // seuil à ajuster selon ton modèle
    });
  });

  describe("Embedding model precision for BGESmallEN", () => {
    it("should give higher similarity for semantically close sentences", async () => {
      const model = await FlagEmbedding.init({
        model: EmbeddingModel.BGESmallEN,

        cacheDir: "src/cache",
        executionProviders: [ExecutionProvider.CUDA],
        maxLength: 100,
      });

      const sims: number[] = [];
      const gold: number[] = [];
      for (const { a, b, score } of names) {
        const { value: embA } = await model.embed([a]).next();
        const { value: embB } = await model.embed([b]).next();

        const sim = cosine(embA![0], embB![0]);
        sims.push(sim);
        gold.push(score / 5); // normaliser 0–1

        //   console.log(`${a} <-> ${b}: sim=${sim.toFixed(3)}, expected=${score}`);
      }

      // Exemple simple: vérifier la corrélation approximative
      const avgError =
        sims.reduce((s, v, i) => s + Math.abs(v - gold[i]), 0) / sims.length;

      console.log("Names Average error for BGESmallEN:", avgError.toFixed(3));
      expect(avgError).toBeLessThan(0.3); // seuil à ajuster selon ton modèle
    });
  });

  describe("Embedding model precision for BGEBaseENV15", () => {
    it("should give higher similarity for semantically close sentences", async () => {
      const model = await FlagEmbedding.init({
        model: EmbeddingModel.BGEBaseENV15,

        cacheDir: "src/cache",
        executionProviders: [ExecutionProvider.CUDA],
        maxLength: 100,
      });

      const sims: number[] = [];
      const gold: number[] = [];
      for (const { a, b, score } of names) {
        const { value: embA } = await model.embed([a]).next();
        const { value: embB } = await model.embed([b]).next();

        const sim = cosine(embA![0], embB![0]);
        sims.push(sim);
        gold.push(score / 5); // normaliser 0–1

        //   console.log(`${a} <-> ${b}: sim=${sim.toFixed(3)}, expected=${score}`);
      }

      // Exemple simple: vérifier la corrélation approximative
      const avgError =
        sims.reduce((s, v, i) => s + Math.abs(v - gold[i]), 0) / sims.length;

      console.log("Names Average error for BGEBaseENV15:", avgError.toFixed(3));
      expect(avgError).toBeLessThan(0.3); // seuil à ajuster selon ton modèle
    });
  });
});
