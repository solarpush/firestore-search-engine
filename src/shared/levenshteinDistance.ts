/**
 * Calculate the Levenshtein distance between two strings.
 *
 * The Levenshtein distance is a string metric for measuring the difference between two sequences.
 * It is calculated as the minimum number of single-character edits (insertions, deletions or substitutions)
 * required to change one word into the other.
 *
 * @param {string} a - First string to compare.
 * @param {string} b - Second string to compare.
 * @return {number} - The Levenshtein distance between the two input strings.
 */
export function fse_levenshteinDistance(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, (_, i) => [
    i,
    ...Array(b.length).fill(0),
  ]);
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // Suppression
        matrix[i][j - 1] + 1, // Insertion
        matrix[i - 1][j - 1] + cost // Substitution
      );
    }
  }

  return matrix[a.length][b.length];
}
