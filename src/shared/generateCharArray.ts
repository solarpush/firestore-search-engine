/**
 * This function generates an array of character fragments from an input string.
 * It first splits the string into words, then for each word, it creates substrings starting from the startIndex and up to maxLength characters long.
 * It also creates substrings of the whole input string in the same way.
 * All substrings are converted to lowercase before being pushed to the output array.
 *
 * @param {string} input - The input string from which to generate character fragments.
 * @param {number} [startIndex=3] - The index to start generating substrings from. Default is 3.
 * @param {number} [maxLength=8] - The maximum length of the substrings. Default is 8.
 * @returns {string[]} An array of character fragments.
 */
export function fse_generateCharArray(
  input: string,
  startIndex: number = 3,
  maxLength: number = 8
): string[] {
  const fragments: string[] = [];
  const words = input.split(" ");

  words.forEach((word) => {
    for (let i = 1; i <= Math.min(word.trim().length, maxLength); i++) {
      if (i <= startIndex) continue;
      fragments.push(word.trim().substring(0, i).toLowerCase());
    }
  });

  for (let i = 1; i <= Math.min(input.length, maxLength); i++) {
    if (i <= startIndex) continue;
    fragments.push(input.substring(0, i).toLowerCase());
  }

  return fragments;
}
