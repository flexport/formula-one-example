// @flow
import React, {Component} from "react";

import ObjectField from "./formula-two/ObjectField";
import NumberField from "./formula-two/inputs/NumberField";
import StringField from "./formula-two/inputs/StringField";

class App extends Component<{}, {value: {n: number, s: string}}> {
  state = {
    value: {
      n: 0,
      s: "",
    },
  };

  handleChange = (newValue: {n: number, s: string}) => {
    this.setState({value: newValue});
  };

  render() {
    return (
      <div className="App">
        <ObjectField value={this.state.value} onChange={this.handleChange}>
          {links => {
            return (
              <React.Fragment>
                <div>
                  <label>
                    Number
                    <NumberField {...links.n} />
                  </label>
                </div>
                <div>
                  <label>
                    String
                    <StringField {...links.s} />
                  </label>
                </div>
              </React.Fragment>
            );
          }}
        </ObjectField>
      </div>
    );
  }
}

export default App;
