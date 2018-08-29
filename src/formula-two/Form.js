// @flow

import * as React from "react";

import type {FeedbackStrategy, MetaField, OnChange, Errors} from "./types";
import {zipWith} from "./utils/array";
import {zipWith as objZipWith} from "./utils/object";

// merge two error trees which are the same shape. Throw if they are different shapes
function mergeErrorTrees(a: Errors, b: Errors): Errors {
  console.log(a, b);
  if (a.type === "leaf" && b.type === "leaf") {
    return {type: "leaf", data: a.data.concat(b.data)};
  }

  if (a.type === "array" && b.type === "array") {
    return {
      type: "array",
      data: a.data.concat(b.data),
      children: zipWith(mergeErrorTrees, a.children, b.children),
    };
  }

  if (a.type === "object" && b.type === "object") {
    return {
      type: "object",
      data: a.data.concat(b.data),
      children: objZipWith(mergeErrorTrees, a.children, b.children),
    };
  }

  throw new Error("Tried to merge two error trees with different shapes.");
}

export type FormContextPayload = {
  shouldShowError: (meta: MetaField) => boolean,
  // These values are taken into account in shouldShowError, but are also
  // available in their raw form, for convenience.
  pristine: boolean,
  submitted: boolean,
};
export const FormContext: React.Context<
  FormContextPayload
> = React.createContext({
  shouldShowError: () => true,
  pristine: false,
  submitted: true,
});

type FormState<T>

type Props<T> = {
  // This is *only* used to intialize the form. Further changes will be ignored
  initialValue: T,
  feedbackStrategy: FeedbackStrategy,
  onSubmit: T => void,
  serverErrors: Errors,
  children: (
    formState: T,
    errors: Errors,
    onChange: OnChange<T>,
    onSubmit: (T) => void
  ) => React.Node,
};
type State<T> = {
  formState: T,
  errors: null | Errors,
  pristine: boolean,
  submitted: boolean,
};
export default class Form<T> extends React.Component<Props<T>, State<T>> {
  constructor(props: Props<T>) {
    super(props);

    this.state = {
      formState: this.props.initialValue,
      pristine: true,
      submitted: false,
      errors: null,
    };
  }

  onSubmit = () => {
    this.setState({submitted: true});
    this.props.onSubmit(this.state.formState);
  };

  onChange: (newValue: T, newErrors: Errors) => void = (
    newState: T,
    newErrors: Errors
  ) => {
    this.setState({formState: newState, errors: newErrors, pristine: false});
  };

  makeShouldShowError = () => {
    if (this.props.feedbackStrategy === "Always") {
      return (meta: MetaField) => true;
    }

    if (this.props.feedbackStrategy === "OnFirstBlur") {
      return (meta: MetaField) => meta.touched;
    }

    throw new Error(
      "Unimplemented feedback strategy: " + this.props.feedbackStrategy
    );
  };

  render() {
    const mergedErrors =
      this.state.errors === null
        ? this.props.serverErrors
        : mergeErrorTrees(this.state.errors, this.props.serverErrors);
    return (
      <FormContext.Provider
        value={{
          shouldShowError: this.makeShouldShowError(),
          pristine: this.state.pristine,
          submitted: this.state.submitted,
        }}
      >
        {this.props.children(
          this.state.formState,
          mergedErrors,
          this.onChange,
          this.onSubmit
        )}
      </FormContext.Provider>
    );
  }
}
