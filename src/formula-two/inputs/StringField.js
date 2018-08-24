// @flow

import * as React from "react";
import {FormContext} from "../Form";
import type {MetaField, FieldLink, Validation} from "../types";
import {leaf} from "../Tree";

type Props = {|
  ...FieldLink<string>,
  validation: Validation<string>,
  shouldShowError: MetaField => boolean,
|};

type State = {
  meta: MetaField,
};

// A dead simple string field
class StringFieldInner extends React.Component<Props, State> {
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
    const newValue = e.currentTarget.value;

    this.setState({
      meta: {
        ...this.state.meta,
        changed: true,
      },
    });

    this.props.onChange(newValue, leaf(this.props.validation(newValue)));
  };

  handleBlur = () => {
    this.setState({
      meta: {
        ...this.state.meta,
        touched: true,
      },
    });
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
          onBlur={this.handleBlur}
          value={value}
        />
        {showError &&
          errors.data.map(e => <div style={{color: "red"}}>{e}</div>)}
      </div>
    );
  }
}

export default class StringField extends React.Component<
  $Diff<Props, {shouldShowError: MetaField => boolean}>
> {
  render() {
    return (
      <FormContext.Consumer>
        {({shouldShowError}) => (
          <StringFieldInner {...this.props} shouldShowError={shouldShowError} />
        )}
      </FormContext.Consumer>
    );
  }
}
