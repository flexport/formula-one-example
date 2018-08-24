// @flow

import * as React from "react";
import {FormContext} from "../Form";
import type {MetaField, FieldLink, Validation} from "../types";
import {leaf} from "../Tree";

type Props = {|
  ...FieldLink<number>,
  validation: Validation<number>,
  shouldShowError: MetaField => boolean,
|};

type State = {
  meta: MetaField,
};

// A dead simple number field
class NumberFieldInner extends React.Component<Props, State> {
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
    const {shouldShowError, errors, value} = this.props;
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

export default class NumberField extends React.Component<
  $Diff<Props, {shouldShowError: MetaField => boolean}>
> {
  render() {
    return (
      <FormContext.Consumer>
        {({shouldShowError}) => (
          <NumberFieldInner {...this.props} shouldShowError={shouldShowError} />
        )}
      </FormContext.Consumer>
    );
  }
}
