// @flow strict

import {
  type ShapedTree,
  mapRoot,
  dangerouslyReplaceObjectChild,
  dangerouslyReplaceArrayChild,
  forgetShape,
  dangerouslySetChildren,
  shapedObjectChild,
  shapedArrayChild,
} from "./shapedTree";
import type {Extras, ClientErrors, Validation} from "./types";
import {replaceAt} from "./utils/array";

// invariant, Tree is shaped like T
export type FormState<T> = [T, ShapedTree<T, Extras>];

export function getExtras<T>(formState: FormState<T>): Extras {
  return forgetShape(formState[1]).data;
}

export function objectChild<T: {}, V>(
  key: string,
  formState: FormState<T>
): FormState<V> {
  const [value, tree] = formState;
  return [value[key], shapedObjectChild(key, tree)];
}

export function arrayChild<E>(
  index: number,
  formState: FormState<Array<E>>
): FormState<E> {
  const [value, tree] = formState;
  return [value[index], shapedArrayChild(index, tree)];
}

export function validate<T>(
  validation: Validation<T>,
  formState: FormState<T>
): FormState<T> {
  const [value, tree] = formState;
  const newErrors = validation(value);
  return [
    value,
    mapRoot(
      ({errors, meta}) => ({
        errors: {
          client: newErrors,
          server: "unchecked",
        },
        meta: {
          ...meta,
          succeeded: meta.succeeded || newErrors.length === 0,
        },
      }),
      tree
    ),
  ];
}

export function setChanged<T>(formState: FormState<T>): FormState<T> {
  return [
    formState[0],
    mapRoot(
      ({errors, meta}) => ({
        errors,
        meta: {...meta, touched: true, changed: true},
      }),
      formState[1]
    ),
  ];
}

export function setTouched<T>(formState: FormState<T>): FormState<T> {
  return [
    formState[0],
    mapRoot(
      ({errors, meta}) => ({errors, meta: {...meta, touched: true}}),
      formState[1]
    ),
  ];
}

export function setClientErrors<T>(
  newErrors: ClientErrors,
  formState: FormState<T>
): FormState<T> {
  return [
    formState[0],
    mapRoot(
      ({errors, meta}) => ({
        errors: {...errors, client: newErrors},
        meta,
      }),
      formState[1]
    ),
  ];
}

export function setExtrasTouched({errors, meta}: Extras): Extras {
  return {errors, meta: {...meta, touched: true}};
}

export function replaceObjectChild<T: {}, V>(
  key: string,
  child: FormState<V>,
  formState: FormState<T>
): FormState<T> {
  const [value, tree] = formState;
  const [childValue, childTree] = child;
  return [
    {...value, [key]: childValue},
    dangerouslyReplaceObjectChild(key, childTree, tree),
  ];
}

export function replaceArrayChild<E>(
  index: number,
  child: FormState<E>,
  formState: FormState<Array<E>>
): FormState<Array<E>> {
  const [value, tree] = formState;
  const [childValue, childTree] = child;
  return [
    replaceAt(index, childValue, value),
    dangerouslyReplaceArrayChild(index, childTree, tree),
  ];
}

export function replaceArrayChildren<E>(
  children: Array<FormState<E>>,
  formState: FormState<Array<E>>
): FormState<Array<E>> {
  const [value, tree] = formState;
  const [childValues, childTrees]: [
    Array<E>,
    Array<ShapedTree<E, Extras>>,
  ] = children.reduce(
    (memo, child) => {
      const [childValue, childTree] = child;
      return [memo[0].concat([childValue]), memo[1].concat([childTree])];
    },
    [[], []]
  );
  return [childValues, dangerouslySetChildren(childTrees, tree)];
}
