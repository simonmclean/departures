export function parseNonEmptyTrimmedString(value: unknown): string {
  if (typeof value === "string" && value.trim() !== "") {
    return value.trim();
  }
  throw new Error(`Expected value to be a non empty string: ${value}`);
}
