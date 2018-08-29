// @flow

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
