export function diffMinutes(a: Date, b: Date): number {
  const diffMs = Math.abs(a.getTime() - b.getTime());
  const diffMins = diffMs / (1000 * 60);
  return diffMins;
}
