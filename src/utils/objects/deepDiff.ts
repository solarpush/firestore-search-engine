import { deepEqual } from "./deepEquals.js";
import { deepMerge } from "./deepMerge.js";

export type DeepDiffReturn<T> = {
  before: T;
  after: T;
  changes: Partial<T>;
  deleted: Partial<T>;
};
export const deepDiff = <T extends object>(
  oldObject: T,
  newObject: Partial<T>
): DeepDiffReturn<T> => {
  const changes: Partial<T> = {};
  const deleted: Partial<T> = {};
  Object.keys(newObject).forEach((key) => {
    const typedKey = key as keyof T;
    const afterValue = newObject[typedKey];
    const beforeValue = oldObject[typedKey];
    if (afterValue === undefined && beforeValue !== undefined) {
      deleted[typedKey] = beforeValue;
    }
    if (!deepEqual(afterValue, beforeValue)) {
      changes[typedKey] = afterValue;
    }
  });

  const change = {
    before: oldObject,
    after: deepMerge(oldObject, newObject),
    changes,
    deleted,
  };

  return change;
};
