// @flow strict

import * as React from "react";

import type {
  MetaField,
  OnChange,
  Err,
  OnBlur,
  Extras,
  FieldLink,
} from "./types";
import {cleanMeta, cleanErrors} from "./types";
import {type FormState} from "./formState";
import {type Tree, strictZipWith} from "./tree";
import {
  type ShapedTree,
  treeFromValue,
  checkShape,
  shapedZipWith,
} from "./shapedTree";

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

function newFormState<T>(value: T): FormState<T> {
  return [
    value,
    treeFromValue(value, {
      errors: cleanErrors,
      meta: cleanMeta,
    }),
  ];
}

export type FeedbackStrategy =
  | "Always"
  | "OnFirstTouch"
  | "OnFirstChange"
  | "OnFirstSuccess"
  | "OnFirstSuccessOrFirstBlur"
  | "OnSubmit";

function getShouldShowError(strategy: FeedbackStrategy) {
  switch (strategy) {
    case "Always":
      return (meta: MetaField) => true;
    case "OnFirstTouch":
      return (meta: MetaField) => meta.touched;
    default:
      throw new Error("Unimplemented feedback strategy: " + strategy);
  }
}

function mergeErrors(
  clientState: {
    errors: Err,
    meta: MetaField,
  },
  serverErrors: Array<string>
): {
  errors: Err,
  meta: MetaField,
} {
  return {
    errors: {...clientState.errors, server: serverErrors},
    meta: clientState.meta,
  };
}

type Props<T> = {
  // This is *only* used to intialize the form. Further changes will be ignored
  +initialValue: T,
  +feedbackStrategy: FeedbackStrategy,
  +onSubmit: T => void,
  // We hope this is a ShapedTree<T, ...>, but I don't think we can guarantee it
  // We can with the write constructors (check: (T, Tree<S>) => ShapedTree<T, S>)
  +serverErrors: null | Tree<Array<string>>,
  +children: (link: FieldLink<T>, onSubmit: () => void) => React.Node,
};
type State<T> = {
  formState: FormState<T>,
  pristine: boolean,
  submitted: boolean,
};
export default class Form<T> extends React.Component<Props<T>, State<T>> {
  constructor(props: Props<T>) {
    super(props);

    this.state = {
      formState: newFormState(props.initialValue),
      pristine: true,
      submitted: false,
      errors: null,
    };
  }

  onSubmit = () => {
    this.setState({submitted: true});
    this.props.onSubmit(this.state.formState[0]);
  };

  onChange: (newValue: FormState<T>) => void = (newState: FormState<T>) => {
    this.setState({formState: newState, pristine: false});
  };

  onBlur: OnBlur<T> = (newTree: ShapedTree<T, Extras>) => {
    this.setState({
      formState: [this.state.formState[0], newTree],
    });
  };

  render() {
    const {serverErrors} = this.props;
    const {formState} = this.state;

    let mergedFormState = null;
    if (serverErrors != null) {
      // TODO(zach): Clean this up
      try {
        const shapedServerErrors = checkShape(formState[0], serverErrors);
        mergedFormState = [
          formState[0],
          shapedZipWith(mergeErrors, formState[1], shapedServerErrors),
        ];
      } catch (e) {
        mergedFormState = formState;
      }
    } else {
      mergedFormState = formState;
    }

    return (
      <FormContext.Provider
        value={{
          shouldShowError: getShouldShowError(this.props.feedbackStrategy),
          pristine: this.state.pristine,
          submitted: this.state.submitted,
        }}
      >
        {this.props.children(
          {
            formState: mergedFormState,
            onChange: this.onChange,
            onBlur: this.onBlur,
          },
          this.onSubmit
        )}
      </FormContext.Provider>
    );
  }
}
