import { FirestoreSearchEngineIndexesProps } from "..";
import { fse_levenshteinDistance } from "./levenshteinDistance";

/**
 * Function to rank the results of a search engine index.
 * @param {FirestoreSearchEngineIndexesProps} props - Props for the search engine index.
 * @param {FirestoreSearchEngineIndexesProps["returnedFields"][]} results - Results to be ranked.
 * @param {string} query - The search query.
 * @returns {any[]} - An array of ranked results.
 */
export function fse_rankResults(
  results: FirestoreSearchEngineIndexesProps["returnedFields"][],
  query: string
): any[] {
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
      return { ...result, finalScore };
    })
    .sort((a, b) => b.finalScore - a.finalScore)
    .reverse();
}
