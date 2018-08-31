// @flow strict

import * as React from "react";
import type {FieldLink, Validation, Err} from "./types";
import {mapRoot} from "./shapedTree";
import {type FormContextPayload} from "./Form";
import withFormContext from "./withFormContext";
import {setExtrasTouched, getExtras} from "./formState";

function getErrors(errors: Err) {
  let flatErrors = [];
  if (errors.client !== "pending") {
    flatErrors = flatErrors.concat(errors.client);
  }
  if (errors.server !== "unchecked") {
    flatErrors = flatErrors.concat(errors.server);
  }
  return flatErrors;
}

export default function makeField<T>(
  Component: React.ComponentType<{|
    value: T,
    errors: $ReadOnlyArray<string>,
    onChange: T => void,
    onBlur: () => void,
  |}>
): Class<
  React.Component<{|
    link: FieldLink<T>,
    // TODO(zach): This shouldn't need to be optional
    validation?: Validation<T>,
  |}>
> {
  class Field extends React.Component<{|
    link: FieldLink<T>,
    validation: Validation<T>,
    formContext: FormContextPayload,
  |}> {
    static defaultProps = {
      validation: () => [],
    };

    onChange: T => void = (newValue: T) => {
      const [_, oldTree] = this.props.link.formState;

      this.props.link.onChange([
        newValue,
        mapRoot(
          ({errors, meta}) => ({
            errors: {
              client: this.props.validation(newValue),
              server: "unchecked",
            },
            meta: {...meta, changed: true},
          }),
          oldTree
        ),
      ]);
    };

    onBlur = () => {
      const [_, tree] = this.props.link.formState;

      this.props.link.onBlur(
        // TODO(zach): Not sure if we should blow away server errors here
        mapRoot(setExtrasTouched, tree)
      );
    };

    render() {
      const [value] = this.props.link.formState;
      const {meta, errors} = getExtras(this.props.link.formState);
      const flatErrors = this.props.formContext.shouldShowError(meta)
        ? getErrors(errors)
        : [];
      return (
        <Component
          value={value}
          errors={flatErrors}
          onChange={this.onChange}
          onBlur={this.onBlur}
        />
      );
    }
  }

  return withFormContext(Field);
}