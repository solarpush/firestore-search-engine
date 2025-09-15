export function deepMerge<T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T {
  const output: any = {...target}
  for (const key of Object.keys(source)) {
    const srcVal = (source as any)[key]
    if (srcVal === undefined) continue
    const tgtVal = (target as any)[key]
    if (isPlainObject(srcVal) && isPlainObject(tgtVal)) {
      output[key] = deepMerge(tgtVal, srcVal)
    } else {
      output[key] = srcVal
    }
  }
  return output as T
}

function isPlainObject(value: unknown): value is Record<string, any> {
  return (
    value !== null &&
    typeof value === "object" &&
    (value as any).constructor === Object
  )
}
