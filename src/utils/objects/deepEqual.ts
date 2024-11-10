import { Timestamp } from "@google-cloud/firestore";

export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;

  if (typeof a !== typeof b) return false;

  if (a instanceof Timestamp && b instanceof Timestamp) {
    return a.isEqual(b);
  }

  if (a && b && typeof a === "object" && typeof b === "object") {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!deepEqual(a[key], b[key])) return false;
    }

    return true;
  }

  return false;
}
