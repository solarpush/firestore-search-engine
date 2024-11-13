import type { Change } from "firebase-functions";
import type { QueryDocumentSnapshot } from "firebase-functions/firestore";
import { deepEqual } from "../utils/objects/deepEqual";
/**
 * This function compares the 'before' and 'after' snapshots of a Firestore document and returns an object containing the changes, added, and removed fields.
 * It uses a custom deep equal function to compare objects.
 * @param {Object} data - The snapshot data containing the before and after Firestore document snapshots.
 * @returns {Object} - An object containing the changes, added, and removed fields.
 */

export const getDiffFromUpdatedData = <T extends object>(
  data: Change<QueryDocumentSnapshot>
) => {
  const before = data.before.data() as T;
  const after = data.after.data() as T;

  const changes: Partial<Record<keyof T, T[keyof T]>> = {};
  const added: Partial<Record<keyof T, T[keyof T]>> = {};
  const removed: Partial<Record<keyof T, T[keyof T]>> = {};

  Object.keys(after).forEach((key) => {
    const typedKey = key as keyof T;
    const afterValue = after[typedKey];
    const beforeValue = before[typedKey];

    if (beforeValue === undefined) {
      added[typedKey] = afterValue;
    } else if (!deepEqual(afterValue, beforeValue)) {
      changes[typedKey] = afterValue;
    }
  });

  // Vérifier les suppressions
  Object.keys(before).forEach((key) => {
    const typedKey = key as keyof T;
    if (after[typedKey] === undefined) {
      removed[typedKey] = before[typedKey];
    }
  });

  const change = {
    before,
    after,
    changes,
    added,
    removed,
  };

  return change;
};
