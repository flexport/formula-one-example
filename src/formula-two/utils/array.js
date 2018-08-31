// @flow strict

export function removeAt<E>(index: number, arr: $ReadOnlyArray<E>): Array<E> {
  return [...arr.slice(0, index), ...arr.slice(index + 1)];
}

export function replaceAt<E>(
  index: number,
  item: E,
  arr: $ReadOnlyArray<E>
): Array<E> {
  return [...arr.slice(0, index), item, ...arr.slice(index + 1)];
}

export function insertAt<E>(
  index: number,
  item: E,
  arr: $ReadOnlyArray<E>
): Array<E> {
  return [...arr.slice(0, index), item, ...arr.slice(index)];
}

export function moveFromTo<E>(
  oldIndex: number,
  newIndex: number,
  arr: $ReadOnlyArray<E>
): Array<E> {
  const without = removeAt(oldIndex, arr);
  return insertAt(newIndex, arr[oldIndex], without);
}

// Strict on length
export function zipWith<A, B, C>(
  f: (A, B) => C,
  left: $ReadOnlyArray<A>,
  right: $ReadOnlyArray<B>
): Array<C> {
  if (left.length !== right.length) {
    throw new Error("Tried to zip two lists of unequal length");
  }
  const ret = [];
  for (let i = 0; i < left.length; i += 1) {
    ret.push(f(left[i], right[i]));
  }
  return ret;
}
