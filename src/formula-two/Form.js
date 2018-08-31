// @flow

import * as React from "react";

import type {
  FeedbackStrategy,
  MetaField,
  OnChange,
  ShapedTree,
  FormState,
  Err,
} from "./types";
import {cleanMeta, cleanErrors} from "./types";
import {zipWith} from "./utils/array";
import {zipWith as objZipWith} from "./utils/object";
import {type Tree, strictZipWith} from "./Tree";

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

// Take shape from value, data from nodeData
function treeFromValue<T, NodeData>(
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
    return {
      type: "object",
      data: nodeData,
      children: Object.keys(value).reduce(
        (children, k) => ({...children, [k]: newFormState(value[k])}),
        {}
      ),
    };
  }

  return {
    type: "leaf",
    data: nodeData,
  };
}

function newFormState<T>(value: T): FormState<T> {
  return [
    value,
    treeFromValue(value, {
      errors: {
        client: "pending",
        server: "unchecked",
      },
      meta: cleanMeta,
    }),
  ];
}

function getShouldShowError(strategy: FeedbackStrategy) {
  switch (strategy) {
    case "Always":
      return (meta: MetaField) => true;
    case "OnFirstBlur":
      return (meta: MetaField) => meta.touched;
  }

  throw new Error("Unimplemented feedback strategy: " + strategy);
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
  initialValue: T,
  feedbackStrategy: FeedbackStrategy,
  onSubmit: T => void,
  // We hope this is a ShapedTree<T, ...>, but I don't think we can guarantee it
  serverErrors: Tree<Array<string>>,
  children: (
    formState: FormState<T>,
    onChange: OnChange<FormState<T>>,
    onSubmit: (T) => void
  ) => React.Node,
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

  render() {
    const {serverErrors} = this.props;
    const {formState} = this.state;
    const mergedFormState = [
      formState[0],
      strictZipWith(mergeErrors, formState[1], serverErrors),
    ];

    return (
      <FormContext.Provider
        value={{
          shouldShowError: getShouldShowError(this.props.feedbackStrategy),
          pristine: this.state.pristine,
          submitted: this.state.submitted,
        }}
      >
        {this.props.children(mergedFormState, this.onChange, this.onSubmit)}
      </FormContext.Provider>
    );
  }
}
