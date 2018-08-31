// @flow strict
export default function invariant(inv: boolean, message: string) {
  if (!inv) {
    throw new Error(message);
  }
}
