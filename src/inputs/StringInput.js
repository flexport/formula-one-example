// @flow strict

import * as React from "react";

type Props = {|
  value: string,
  onChange: string => void,
  onBlur: () => void,
  errors: $ReadOnlyArray<string>,
|};

// A dead simple number field
export default class StringInput extends React.Component<Props> {
  handleChange = (e: SyntheticEvent<HTMLInputElement>) => {
    this.props.onChange(e.currentTarget.value);
  };

  render() {
    const {value, onBlur, errors} = this.props;
    return (
      <div style={{display: "inline-flex", flexDirection: "column"}}>
        <input
          type="text"
          style={errors.length > 0 ? {borderRadius: 1, borderColor: "red"} : {}}
          onChange={this.handleChange}
          onBlur={onBlur}
          value={value}
        />
        {errors.map(e => (
          <div style={{color: "red"}}>{e}</div>
        ))}
      </div>
    );
  }
}
