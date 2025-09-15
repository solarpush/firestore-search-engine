import { fse_levenshteinDistance } from "./levenshteinDistance";

/**
 * Function to rank the results of a search engine index.
 * @param {any[]} results - Results to be ranked.
 * @param {string} query - The search query.
 * @returns {any[]} - An array of ranked results.
 */
export function fse_rankResults(results: any[], query: string): any[] {
  return results
    .map((result) => {
      // Handle both old and new field formats
      const fieldValue = result.fieldValue || result._fieldValue || "";

      const textSimilarityScore = fse_levenshteinDistance(
        query.toLowerCase(),
        fieldValue.toLowerCase()
      );
      const [a, b, c, d, e, f, g, h, i, j] = query.toLowerCase();
      const textSimilarityScoreReverse = fse_levenshteinDistance(
        [a, b, c, d, e, f, g, h, i, j].reverse().join(""),
        fieldValue.toLowerCase()
      );
      const distanceScore = 1 + (result.distance || 0) * 10;
      const finalScore =
        0.03 * (textSimilarityScore + textSimilarityScoreReverse) +
        0.97 * distanceScore;
      return { ...result, finalScore };
    })
    .sort((a, b) => b.finalScore - a.finalScore)
    .reverse();
}
