// @flow

import * as React from "react";
import {type FormContextPayload} from "../Form";
import type {MetaField, FieldLink, Validation} from "../types";
import {leaf} from "../Tree";
import withFormContext from "../withFormContext";

type Props = {|
  ...FieldLink<number>,
  validation: Validation<number>,
  formContext: FormContextPayload,
|};

type State = {
  meta: MetaField,
};

// A dead simple number field
class NumberField extends React.Component<Props, State> {
  static defaultProps = {
    validation: () => [],
  };

  state = {
    meta: {
      touched: false,
      changed: false,
      succeeded: false,
      asyncValidationInFlight: false,
    },
  };

  handleChange = (e: SyntheticEvent<HTMLInputElement>) => {
    const parsed = Number.parseFloat(e.currentTarget.value);
    this.props.onChange(parsed, leaf(this.props.validation(parsed)));
  };

  render() {
    const {
      formContext: {shouldShowError},
      errors,
      value,
    } = this.props;
    const showError =
      shouldShowError(this.state.meta) && errors.data.length > 0;
    return (
      <div style={{display: "inline-flex", flexDirection: "column"}}>
        <input
          type="text"
          style={showError ? {borderRadius: 1, borderColor: "red"} : {}}
          onChange={this.handleChange}
          value={value}
        />
        {showError &&
          errors.data.map(e => <div style={{color: "red"}}>{e}</div>)}
      </div>
    );
  }
}

export default withFormContext(NumberField);
