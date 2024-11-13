import { FirestoreSearchEngineIndexesProps } from "..";
import { fse_levenshteinDistance } from "./levenshteinDistance";

export function fse_rankResults(
  results: FirestoreSearchEngineIndexesProps["returnedFields"][],
  query: string
): any[] {
  console.time("fse_rankResults");
  return results
    .map((result) => {
      const textSimilarityScore = fse_levenshteinDistance(
        query.toLowerCase(),
        result.fieldValue.toLowerCase()
      );
      const [a, b, c, d, e, f, g, h, i, j] = query.toLowerCase();
      const textSimilarityScoreReverse = fse_levenshteinDistance(
        [a, b, c, d, e, f, g, h, i, j].reverse().join(""),
        result.fieldValue.toLowerCase()
      );
      const distanceScore = 1 + result.distance * 10;
      const finalScore =
        0.03 * (textSimilarityScore + textSimilarityScoreReverse) +
        0.97 * distanceScore;
      console.log("finalScore", finalScore);
      console.log("distcance", distanceScore);
      return { ...result, finalScore };
    })
    .sort((a, b) => b.finalScore - a.finalScore)
    .reverse();
}
