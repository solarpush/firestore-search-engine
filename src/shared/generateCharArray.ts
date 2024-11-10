export function generateCharArray(
  input: string,
  startIndex = 3,
  maxLength = 8
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
