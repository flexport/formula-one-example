// @flow

import * as React from "react";

type Props = {|
  value: number,
  onChange: number => void,
|};
// A dead simple number field
export default class NumberField extends React.Component<Props> {
  handleChange = (e: SyntheticEvent<HTMLInputElement>) => {
    const parsed = Number.parseFloat(e.currentTarget.value);
    this.props.onChange(parsed);
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
