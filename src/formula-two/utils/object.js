// @flow strict

import {setEq} from "./set";

export function zipWith<E, O: {[string]: E}, C>(
  f: (E, E) => C,
  left: O,
  right: O
): $ObjMap<O, <X>(X) => C> {
  const leftKeys = new Set(Object.keys(left));
  const rightKeys = new Set(Object.keys(right));
  if (!setEq(leftKeys, rightKeys)) {
    throw new Error("Tried to zip two object with different keys");
  }

  return Object.keys(left).reduce((memo, k) => {
    memo[k] = f(left[k], right[k]);
    return memo;
  }, {});
}
