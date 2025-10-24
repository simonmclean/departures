export function parseNonEmptyTrimmedString(value: unknown): string {
  if (typeof value === "string" && value.trim() !== "") {
    return value.trim();
  }
  throw new Error(`Expected value to be a non empty string: ${value}`);
}

export function diffMinutes(a: Date, b: Date): number {
  const diffMs = Math.abs(a.getTime() - b.getTime());
  const diffMins = diffMs / (1000 * 60);
  return diffMins;
}
