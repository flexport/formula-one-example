// @flow strict

import * as React from "react";
import type {Tree} from "./tree";
import type {ShapedTree} from "./shapedTree";
import {type FormState} from "./formState";

export type ClientErrors = Array<string> | "pending";
export type ServerErrors = Array<string> | "unchecked";
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

export type Extras = {
  errors: Err,
  meta: MetaField,
};

export type OnChange<T> = T => void;
export type OnBlur<T> = (ShapedTree<T, Extras>) => void;

interface ValidatingComponent<P, S> extends React.Component<P, S> {
  validate(): Err;
}
export type FieldLink<T> = {|
  +formState: FormState<T>,
  +onChange: OnChange<FormState<T>>,
  // not sure whether this or onChange style is better
  +onBlur: OnBlur<T>,
|};

export type Validation<T> = T => Array<string>;
