// @flow

import * as React from "react";

type Props = {|
  value: string,
  onChange: string => void,
|};
// A dead simple string field
export default class StringField extends React.Component<Props> {
  handleChange = (e: SyntheticEvent<HTMLInputElement>) => {
    this.props.onChange(e.currentTarget.value);
  };

  render() {
    return (
      <input
        type="text"
        onChange={this.handleChange}
        value={this.props.value}
      />
    );
  }
}
