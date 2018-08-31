// @flow strict

export function setEq<T>(a: Set<T>, b: Set<T>): boolean {
  return Array.from(a).every(x => b.has(x));
}
