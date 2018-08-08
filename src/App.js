// @flow
import React, {Component} from "react";

import ObjectField from "./formula-two/ObjectField";
import ArrayField from "./formula-two/ArrayField";
import NumberField from "./formula-two/inputs/NumberField";
import StringField from "./formula-two/inputs/StringField";

type FormState = {
  n: number,
  s: string,
  a: Array<string>,
};

type State = {
  value: FormState,
};

class App extends Component<{}, State> {
  state = {
    value: {
      n: 0,
      s: "",
      a: ["hello", "world"],
    },
  };

  handleChange = (newValue: FormState) => {
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
                <div>
                  <label>
                    Array
                    <ArrayField {...links.a}>
                      {(links, {addField, removeField}) => (
                        <React.Fragment>
                          {links.map((link, i) => (
                            <div>
                              <StringField {...link} />
                              <button onClick={() => removeField(i)}>x</button>
                            </div>
                          ))}
                          <button onClick={() => addField("zach")}>
                            Add zach
                          </button>
                        </React.Fragment>
                      )}
                    </ArrayField>
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
