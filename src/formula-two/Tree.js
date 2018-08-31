// @flow strict
import {setEq} from "./utils/set";
import invariant from "./utils/invariant";

export type Tree<T> =
  | {
      type: "leaf",
      data: T,
    }
  | {
      type: "object",
      data: T,
      children: {[string]: Tree<T>},
    }
  | {
      type: "array",
      data: T,
      children: Array<Tree<T>>,
    };

export function leaf<T>(
  data: T
): {
  type: "leaf",
  data: T,
} {
  return {
    type: "leaf",
    data,
  };
}

type Direction = "left" | "right";
export type Zipper<T> = {
  leftChild: Tree<T>,
  rightChild: Tree<T>,
  parents: Array<{
    direction: Direction,
    value: T,
    sibling: Tree<T>,
  }>,
};

export function strictZipWith<A, B, C>(
  f: (A, B) => C,
  left: Tree<A>,
  right: Tree<B>
): Tree<C> {
  if (left.type === "object" && right.type === "object") {
    if (!setEq(new Set(Object.keys(left)), new Set(Object.keys(right)))) {
      throw new Error("Tried to zip two object nodes with different keys");
    }

    return {
      type: "object",
      data: f(left.data, right.data),
      children: Object.keys(left.children).reduce((memo, k) => {
        invariant(
          left.type === "object" && right.type === "object",
          "This should never happen."
        );
        return {
          ...memo,
          [k]: strictZipWith(f, left.children[k], right.children[k]),
        };
      }, {}),
    };
  }

  if (left.type === "array" && right.type === "array") {
    if (left.children.length !== right.children.length) {
      throw new Error("Tried to zip two array nodes with different lengths");
    }

    return {
      type: "array",
      data: f(left.data, right.data),
      children: left.children.map((_, i) => {
        invariant(left.type === "array" && right.type === "array");
        return strictZipWith(f, left.children[i], right.children[i]);
      }),
    };
  }

  if (left.type === "leaf" && right.type === "leaf") {
    return {
      type: "leaf",
      data: f(left.data, right.data),
    };
  }

  throw new Error("Tried to zip two nodes of different type");
}
