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
export function fse_generateTypos(
  input: string,
  maxLength: number = 30
): Set<string> {
  if (input.length > maxLength) throw new Error("Input up to 50 Char");

  const typos = new Set<string>();
  const segmentSizes = [4, 5, 6];

  // Définition des voisins du clavier AZERTY
  const keyboardNeighbors: { [key: string]: string[] } = {
    a: ["z", "q", "s"],
    z: ["a", "e", "s"],
    e: ["z", "r", "d"],
    r: ["e", "t", "f"],
    t: ["r", "y", "g"],
    y: ["t", "u", "h"],
    u: ["y", "i", "j"],
    i: ["u", "o", "k"],
    o: ["i", "p", "l"],
    p: ["o", "m"],
    q: ["a", "s", "w"],
    s: ["a", "z", "d", "q"],
    d: ["s", "e", "f"],
    f: ["d", "r", "g"],
    g: ["f", "t", "h"],
    h: ["g", "y", "j"],
    j: ["h", "u", "k"],
    k: ["j", "i", "l"],
    l: ["k", "o", "m"],
    m: ["l", "p"],
  };

  // Découpe en segments et applique des modifications basées sur les voisins du clavier
  for (const size of segmentSizes) {
    for (let start = 0; start <= input.length - size; start++) {
      const segment = input.slice(start, start + size);

      // Applique les modifications à la première lettre du segment
      if (segment.length >= 3) {
        const firstLetter = segment[0];
        if (keyboardNeighbors[firstLetter]) {
          // Substitution de la première lettre avec les voisins du clavier
          keyboardNeighbors[firstLetter].forEach((neighbor) => {
            const typo = neighbor + segment.slice(1);
            typos.add(typo);
          });
        }

        // Insertion avant la première lettre avec chaque voisin possible
        keyboardNeighbors[firstLetter]?.forEach((neighbor) => {
          const typo = neighbor + segment;
          typos.add(typo);
        });

        // Suppression de la première lettre
        typos.add(segment.slice(1));
      }

      // Applique les modifications à la dernière lettre du segment
      const lastLetter = segment[segment.length - 1];
      if (segment.length >= 3 && keyboardNeighbors[lastLetter]) {
        // Substitution de la dernière lettre avec les voisins du clavier
        keyboardNeighbors[lastLetter].forEach((neighbor) => {
          const typo = segment.slice(0, -1) + neighbor;
          typos.add(typo);
        });

        // Insertion après la dernière lettre avec chaque voisin possible
        keyboardNeighbors[lastLetter]?.forEach((neighbor) => {
          const typo = segment + neighbor;
          typos.add(typo);
        });

        // Suppression de la dernière lettre
        typos.add(segment.slice(0, -1));
      }
    }
  }

  return typos;
}
