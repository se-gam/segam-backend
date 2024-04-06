export function isSameTime(a: Date | undefined, b: Date | undefined): boolean {
  if (!a || !b) {
    return false;
  }
  return a.getTime() === b.getTime();
}
