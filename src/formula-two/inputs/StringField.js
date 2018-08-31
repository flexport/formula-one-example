// @flow

import * as React from "react";
import {type FormContextPayload} from "../Form";
import type {MetaField, FieldLink, Validation} from "../types";
import {leaf} from "../Tree";
import withFormContext from "../withFormContext";

type Props = {|
  ...FieldLink<string>,
  validation: Validation<string>,
  formContext: FormContextPayload,
|};

// A dead simple string field
class StringField extends React.Component<Props> {
  static defaultProps = {
    validation: () => [],
  };

  handleChange = (e: SyntheticEvent<HTMLInputElement>) => {
    const newValue = e.currentTarget.value;
    this.props.onChange([
      newValue,
      leaf({
        errors: {
          client: this.props.validation(newValue),
          server: "unchecked",
        },
        meta: {
          ...this.props.formState[1].data.meta,
          changed: true,
        },
      }),
    ]);
  };

  handleBlur = () => {
    const [value, tree] = this.props.formState;
    const newMeta = {
      ...tree.data.meta,
      touched: true,
    };
    this.props.onBlur(
      leaf({
        // TODO(zach): Not sure if we should blow away server errors here
        errors: {
          client: this.props.validation(value),
          server: "unchecked",
        },
        meta: newMeta,
      })
    );
  };

  getErrors() {
    const {errors} = this.props.formState[1].data;
    let flatErrors = [];
    if (errors.client !== "pending") {
      flatErrors = flatErrors.concat(errors.client);
    }
    if (errors.server !== "unchecked") {
      flatErrors = flatErrors.concat(errors.server);
    }
    return flatErrors;
  }

  render() {
    const {
      formContext: {shouldShowError},
      formState: [value, tree],
    } = this.props;
    const showError =
      shouldShowError(tree.data.meta) && this.getErrors().length > 0;
    return (
      <div style={{display: "inline-flex", flexDirection: "column"}}>
        <input
          type="text"
          style={showError ? {borderRadius: 1, borderColor: "red"} : {}}
          onChange={this.handleChange}
          onBlur={this.handleBlur}
          value={value}
        />
        {showError &&
          this.getErrors().map(e => <div style={{color: "red"}}>{e}</div>)}
      </div>
    );
  }
}

export default withFormContext(StringField);
