/**
 * Function to generate common keyboard-related typos for a given string input.
 * The function divides the input into segments of certain sizes and for each segment,
 * it generates typos by substituting, inserting, and deleting characters
 * that are neighbors on the physical keyboard layout.
 *
 * @param {string} input - The input string for which to generate typos.
 * @param {number} maxLength - Maximum length for the input string. Default is 30.
 *
 * @returns {Set<string>} A set of strings, each of which is a typo of the input string.
 *
 * @throws {Error} If the length of the input string exceeds maxLength.
 */
export declare function fse_generateTypos(input: string, maxLength: number): Set<string>;
