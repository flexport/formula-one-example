// @flow

export type ChangeFn<T> = T => void;

export type $Map<F: Function> = (<X: {}>(X) => $ObjMap<X, $Map<F>>) &
  (<E, X: Array<E>>(X) => Array<$Call<F, E>>) &
  (<X: number>(X) => $Call<F, X>) &
  (<X: string>(X) => $Call<F, X>) &
  (<X>(X) => $Call<F, X>);

// TODO(zach): Maybe this should be an array of strings (or a non-empty array of strings?)
export type Error = string | null;
export type ToError = <T>(T) => Error;

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

export type FieldLink<T> = {|
  value: T,
  onChange: ChangeFn<T>,
  // meta: MetaField,
|};
