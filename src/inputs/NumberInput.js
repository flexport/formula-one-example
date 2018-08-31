// @flow strict

import * as React from "react";

type Props = {|
  value: number,
  onChange: number => void,
  onBlur: () => void,
  errors: $ReadOnlyArray<string>,
|};

// A dead simple number field
export default class NumberInput extends React.Component<Props> {
  handleChange = (e: SyntheticEvent<HTMLInputElement>) => {
    const parsed = Number.parseFloat(e.currentTarget.value);
    this.props.onChange(parsed);
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
          <div key={e} style={{color: "red"}}>
            {e}
          </div>
        ))}
      </div>
    );
  }
}
