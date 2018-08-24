// @flow
import React, {Component} from "react";

import Form from "./formula-two/Form";
import ObjectField from "./formula-two/ObjectField";
import ArrayField from "./formula-two/ArrayField";
import NumberField from "./formula-two/inputs/NumberField";
import StringField from "./formula-two/inputs/StringField";

import type {Errors, FieldLink} from "./formula-two/types";

function checkString(s: string): Array<string> {
  if (s === "") {
    return [];
  }
  if (!s.match(/^[a-z]*$/i)) {
    return ["Must be alphanumeric"];
  }
  return [];
}
function makeErrors(x: FormState): Errors {
  return {
    type: "object",
    data: [],
    children: {
      n: {type: "leaf", data: []},
      s: {type: "leaf", data: []},
      a: {
        type: "array",
        data: [],
        children: x.a.map(c => ({type: "leaf", data: [] /*checkString(c)*/})),
      },
    },
  };
}

type FormState = {
  n: number,
  s: string,
  a: Array<string>,
};

type State = {
  value: FormState,
  error: Errors,
};

class App extends Component<{}, State> {
  state = {
    value: {
      n: 0,
      s: "",
      a: ["hello", "world", "!!!"],
    },
    error: makeErrors({
      n: 0,
      s: "",
      a: ["hello", "world", "!!!"],
    }),
  };

  render() {
    return (
      <Form
        serverErrors={makeErrors(this.state.value)}
        initialValue={this.state.value}
        feedbackStrategy="OnFirstBlur"
        onSubmit={value => {
          console.log("SUBMITTED", value);
        }}
      >
        {(formState, errors, onChange, onSubmit) => (
          <ObjectField
            value={formState}
            errors={errors}
            onChange={onChange}
            onBlur={() => {}}
          >
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
                        {(links, {addField, removeField, moveField}) => (
                          <React.Fragment>
                            {links.map((link, i) => (
                              <div>
                                <StringField
                                  {...link}
                                  validation={checkString}
                                />
                                <button onClick={() => removeField(i)}>
                                  x
                                </button>
                                {i > 0 && (
                                  <button onClick={() => moveField(i, i - 1)}>
                                    ^
                                  </button>
                                )}
                                {i < links.length - 1 && (
                                  <button onClick={() => moveField(i, i + 1)}>
                                    v
                                  </button>
                                )}
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
        )}
      </Form>
    );
  }
}

export default App;
