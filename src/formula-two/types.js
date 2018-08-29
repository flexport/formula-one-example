// @flow

import * as React from "react";
import type {Tree} from "./Tree";

// TODO(zach): Maybe this should be an array of strings (or a non-empty array of strings?)
export type Err = Array<string>;
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

export type OnChange<T> = (T, Errors) => void;
export type OnBlur = () => void;

interface ValidatingComponent<P, S> extends React.Component<P, S> {
  validate(): Err;
}
export type FieldLinkProps<T> = {|
  value: T,
  errors: Errors,
  onChange: OnChange<T>,
  onBlur: OnBlur,
|};
export type FieldLink<T> = {|
  ...FieldLinkProps<T>,
  key: React.Key,
  ref: React.Ref<ValidatingComponent<any, any>>,
|};

export type FeedbackStrategy =
  | "Always"
  | "OnFirstBlur"
  | "OnFirstChange"
  | "OnFirstSuccess"
  | "OnFirstSuccessOrFirstBlur"
  | "OnSubmit";

type $$Map<F: Function> = (<X: {}>(x: X) => $ObjMap<X, $$Map<F>>) &
  (<E>(x: Array<E>) => Array<$Call<$$Map<F>, E>>) &
  (<X>(x: number) => $Call<F, X>) &
  (<X>(x: string) => $Call<F, X>);

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

// Actually mapping isn't working. Instead do a lot of runtime checks to make
// sure the shape is right
export type Errors = Tree<Err>;
export type ObjErrors = ObjectNode<Err>;
export type ArrErrors = ArrayNode<Err>;

export type Validation<T> = T => Err;
