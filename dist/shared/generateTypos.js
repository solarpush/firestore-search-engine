"use strict";
// import { generateCharArray } from "./generateCharArray";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTypos = generateTypos;
// export function generateTypos(input: string, maxLength = 30): Set<string> {
//   if (input.length > maxLength) throw new Error("Input up to 50 Char");
//   const typos = new Set<string>();
//   const charArray = generateCharArray(input);
//   for (const char of charArray) {
//     if (char.length < 3) continue;
//     if (char.length > 5) continue;
//     // Substitution
//     for (let i = 0; i < char.length; i++) {
//       for (let j = 97; j <= 122; j++) {
//         // ASCII de 'a' à 'z'
//         const typo =
//           char.slice(0, i) + String.fromCharCode(j) + char.slice(i + 1);
//         typos.add(typo);
//       }
//     }
//     // Insertion
//     for (let i = 0; i <= char.length; i++) {
//       for (let j = 97; j <= 122; j++) {
//         const typo = char.slice(0, i) + String.fromCharCode(j) + char.slice(i);
//         typos.add(typo);
//       }
//     }
//     // Suppression
//     for (let i = 0; i < char.length; i++) {
//       const typo = char.slice(0, i) + char.slice(i + 1);
//       typos.add(typo);
//     }
//     // Permutation
//     for (let i = 0; i < char.length - 1; i++) {
//       const typo = char.slice(0, i) + char[i + 1] + char[i] + char.slice(i + 2);
//       typos.add(typo);
//     }
//   }
//   return typos;
// }
// export function generateTypos(input: string, maxLength = 30): Set<string> {
//   if (input.length > maxLength) throw new Error("Input up to 50 Char");
//   const typos = new Set<string>();
//   const segmentSizes = [3, 4, 5];
//   // Découpe en segments et applique des modifications sur la première et la dernière lettre
//   for (const size of segmentSizes) {
//     for (let start = 0; start <= input.length - size; start++) {
//       const segment = input.slice(start, start + size);
//       // Applique les modifications à la première lettre du segment
//       if (segment.length >= 3) {
//         // Substitution sur la première lettre
//         for (let j = 97; j <= 122; j++) {
//           // ASCII 'a' à 'z'
//           const typo = String.fromCharCode(j) + segment.slice(1);
//           typos.add(typo);
//         }
//         // Insertion avant la première lettre
//         for (let j = 97; j <= 122; j++) {
//           const typo = String.fromCharCode(j) + segment;
//           typos.add(typo);
//         }
//         // Suppression de la première lettre
//         typos.add(segment.slice(1));
//       }
//       // Applique les modifications à la dernière lettre du segment
//       if (segment.length >= 3) {
//         // Substitution sur la dernière lettre
//         for (let j = 97; j <= 122; j++) {
//           const typo = segment.slice(0, -1) + String.fromCharCode(j);
//           typos.add(typo);
//         }
//         // Insertion après la dernière lettre
//         for (let j = 97; j <= 122; j++) {
//           const typo = segment + String.fromCharCode(j);
//           typos.add(typo);
//         }
//         // Suppression de la dernière lettre
//         typos.add(segment.slice(0, -1));
//       }
//       // Permutation entre la première et la dernière lettre (si le segment est assez long)
//       if (segment.length > 2) {
//         const typo =
//           segment[segment.length - 1] + segment.slice(1, -1) + segment[0];
//         typos.add(typo);
//       }
//     }
//   }
//   return typos;
// }
function generateTypos(input, maxLength = 30) {
    var _a, _b;
    if (input.length > maxLength)
        throw new Error("Input up to 50 Char");
    const typos = new Set();
    const segmentSizes = [4, 5, 6];
    // Définition des voisins du clavier AZERTY
    const keyboardNeighbors = {
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
                (_a = keyboardNeighbors[firstLetter]) === null || _a === void 0 ? void 0 : _a.forEach((neighbor) => {
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
                (_b = keyboardNeighbors[lastLetter]) === null || _b === void 0 ? void 0 : _b.forEach((neighbor) => {
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
//# sourceMappingURL=generateTypos.js.map