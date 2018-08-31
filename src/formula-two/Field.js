// @flow strict

import * as React from "react";
import type {FieldLink, Validation, Err} from "./types";
import {mapRoot} from "./shapedTree";
import {type FormContextPayload} from "./Form";
import withFormContext from "./withFormContext";
import {setExtrasTouched, getExtras} from "./formState";

type Props<T> = {|
  link: FieldLink<T>,
  validation: Validation<T>,
  formContext: FormContextPayload,
  children: (
    value: T,
    errors: $ReadOnlyArray<string>,
    onChange: (T) => void,
    onBlur: () => void
  ) => React.Node,
|};

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

class Field<T> extends React.Component<Props<T>> {
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
    return this.props.children(value, flatErrors, this.onChange, this.onBlur);
  }
}

export default withFormContext(Field);
