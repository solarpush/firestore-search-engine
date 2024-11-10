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
export declare function fse_levenshteinDistance(a: string, b: string): number;
