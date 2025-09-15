import path from "path";
import { fileURLToPath } from "url";

export function getDirname(metaUrl: string) {
  return path.dirname(fileURLToPath(metaUrl));
}
