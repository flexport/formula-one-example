// @flow strict

import * as React from "react";
import type {Tree} from "./Tree";
import invariant from "./utils/invariant";

type ClientErrors = Array<string> | "pending";
type ServerErrors = Array<string> | "unchecked";
export type Err = {
  client: ClientErrors,
  server: ServerErrors,
};
export type ToError = <T>(T) => Err;

// Every field keeps its own meta, not the meta of its children
export type MetaField = {
  touched: boolean, // blurred
  changed: boolean,
  succeeded: boolean,
  asyncValidationInFlight: boolean,
};

export type MetaForm = {
  pristine: boolean,
  submitted: boolean,
};

export const cleanMeta: MetaField = {
  touched: false,
  changed: false,
  succeeded: false,
  asyncValidationInFlight: false,
};

export const cleanErrors: Err = {
  client: "pending",
  server: "unchecked",
};

export type OnChange<T> = T => void;
export type OnBlur<T> = (
  ShapedTree<
    T,
    {
      errors: Err,
      meta: MetaField,
    }
  >
) => void;

interface ValidatingComponent<P, S> extends React.Component<P, S> {
  validate(): Err;
}
export type FieldLink<T> = {|
  formState: FormState<T>,
  onChange: OnChange<FormState<T>>,
  // not sure whether this or onChange style is better
  onBlur: OnBlur<T>,
|};

export type FeedbackStrategy =
  | "Always"
  | "OnFirstBlur"
  | "OnFirstChange"
  | "OnFirstSuccess"
  | "OnFirstSuccessOrFirstBlur"
  | "OnSubmit";

export type ObjectNode<T> = {
  type: "object",
  data: T,
  children: {[string]: Tree<T>},
};
export type ArrayNode<T> = {
  type: "array",
  data: T,
  children: Array<Tree<T>>,
};

export type Validation<T> = T => ClientErrors;

// Shape is a phantom type used to track the shape of the Tree
// eslint-disable-next-line no-unused-vars
export type ShapedTree<Shape, Data> = Tree<Data>;

// Take shape from value, data from nodeData
export function treeFromValue<T, NodeData>(
  value: T,
  nodeData: NodeData
): ShapedTree<T, NodeData> {
  if (Array.isArray(value)) {
    return {
      type: "array",
      data: nodeData,
      children: value.map(child => treeFromValue(child, nodeData)),
    };
  }

  if (value instanceof Object) {
    const objectValue = value;
    return {
      type: "object",
      data: nodeData,
      children: Object.keys(objectValue).reduce(
        (children, k) => ({
          ...children,
          [k]: treeFromValue(objectValue[k], nodeData),
        }),
        {}
      ),
    };
  }

  return {
    type: "leaf",
    data: nodeData,
  };
}

// invariant, Tree is shaped like T
export type FormState<T> = [
  T,
  ShapedTree<
    T,
    {
      errors: Err,
      meta: MetaField,
    }
  >,
];

// TODO(zach): Something, something zippers
export function objectChild<T: {}, V>(
  _typeWitness: V,
  formState: FormState<T>,
  key: string
): FormState<V> {
  const [value, tree] = formState;
  invariant(
    tree.type === "object",
    "Tried to get an object child of a non-object node."
  );
  invariant(
    value.hasOwnProperty(key) && tree.children.hasOwnProperty(key),
    "Tried to get a non-existent child of an object node"
  );
  return [value[key], tree.children[key]];
}

export function arrayChild<E>(
  formState: FormState<Array<E>>,
  index: number
): FormState<E> {
  invariant(
    formState[1].type === "array",
    "Tried to get an array child of a non-array node."
  );
  return [formState[0][index], formState[1].children[index]];
}
