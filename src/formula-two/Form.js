// @flow strict

import * as React from "react";

import type {
  MetaField,
  Err,
  OnBlur,
  OnValidation,
  Extras,
  FieldLink,
} from "./types";
import {cleanMeta, cleanErrors, type ServerErrors} from "./types";
import {
  type FormState,
  monoidallyCombineFormStatesForValidation,
  replaceServerErrors,
} from "./formState";
import {type Tree} from "./tree";
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

function newFormState<T>(
  value: T,
  serverErrors: null | ShapedTree<T, ServerErrors>
): FormState<T> {
  const cleanState = [
    value,
    treeFromValue(value, {
      errors: cleanErrors,
      meta: cleanMeta,
    }),
  ];
  if (serverErrors != null) {
    return replaceServerErrors(serverErrors, cleanState);
  }
  return cleanState;
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
    case "OnFirstChange":
      return (meta: MetaField) => meta.changed;
    default:
      throw new Error("Unimplemented feedback strategy: " + strategy);
  }
}

type Props<T> = {
  // This is *only* used to intialize the form. Further changes will be ignored
  +initialValue: T,
  +feedbackStrategy: FeedbackStrategy,
  +onSubmit: T => void,
  // We hope this is a ShapedTree<T, ...>, but I don't think we can guarantee it
  // We can with the write constructors (check: (T, Tree<S>) => ShapedTree<T, S>)
  // I think this should be Array<string> instead of ServerErrors, but the variance
  // is quite tricky
  +serverErrors: null | Tree<ServerErrors>,
  +children: (link: FieldLink<T>, onSubmit: () => void) => React.Node,
};
type State<T> = {
  formState: FormState<T>,
  pristine: boolean,
  submitted: boolean,
  oldServerErrors: null | Tree<ServerErrors>,
};
export default class Form<T> extends React.Component<Props<T>, State<T>> {
  static getDerivedStateFromProps(props: Props<T>, state: State<T>) {
    let serverErrors: ShapedTree<T, ServerErrors>;
    if (props.serverErrors != null) {
      try {
        serverErrors = checkShape(state.formState[0], props.serverErrors);
      } catch (_) {
        console.error(
          "Server errors don't match the shape of value.\nThey will be ignored"
        );
        serverErrors = treeFromValue(state.formState[0], "unchecked");
      }
    } else {
      serverErrors = treeFromValue(state.formState[0], "unchecked");
    }

    if (props.serverErrors !== state.oldServerErrors) {
      return {
        formState: replaceServerErrors(serverErrors, state.formState),
        oldServerErrors: props.serverErrors,
      };
    }
  }

  constructor(props: Props<T>) {
    super(props);

    let serverErrors = null;
    if (props.serverErrors != null) {
      try {
        serverErrors = checkShape(props.initialValue, props.serverErrors);
      } catch (_) {
        console.error(
          "Server errors don't match the shape of value.\nThey will be ignored"
        );
        serverErrors = null;
      }
    }

    this.state = {
      formState: newFormState(props.initialValue, serverErrors),
      pristine: true,
      submitted: false,
      oldServerErrors: props.serverErrors,
    };
  }

  onSubmit = () => {
    this.setState({submitted: true});
    this.props.onSubmit(this.state.formState[0]);
  };

  updateFormState: (newValue: FormState<T>) => void = (
    newState: FormState<T>
  ) => {
    this.setState({formState: newState, pristine: false});
  };

  updateTree: OnBlur<T> = (newTree: ShapedTree<T, Extras>) => {
    this.setState({
      formState: [this.state.formState[0], newTree],
    });
  };

  updateTreeForValidation: OnValidation<T> = (
    newTree: ShapedTree<T, Extras>
  ) => {
    this.setState(({formState}) => ({
      formState: monoidallyCombineFormStatesForValidation(formState, [
        formState[0],
        newTree,
      ]),
    }));
  };

  render() {
    const {formState} = this.state;

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
            formState,
            onChange: this.updateFormState,
            onBlur: this.updateTree,
            onValidation: this.updateTreeForValidation,
          },
          this.onSubmit
        )}
      </FormContext.Provider>
    );
  }
}
