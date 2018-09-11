// @flow strict
import React, { Component } from "react";

import {
  Form,
  ObjectField,
  ArrayField,
  ErrorsHelper,
  makeField
} from "formula-one";

import NumberInput from "./inputs/NumberInput";
import StringInput from "./inputs/StringInput";

const NumberField = makeField(NumberInput);
const StringField = makeField(StringInput);

function checkString(s: string): Array<string> {
  if (s === "") {
    return [];
  }
  if (!s.match(/^[a-z\s]*$/i)) {
    return ["Must be alpha"];
  }
  return [];
}

type State = {
  value: {|
    n: number,
    s: string,
    a: Array<string>
  |},
  error: null | { [path: string]: Array<string> }
};

class App extends Component<{}, State> {
  state = {
    value: {
      n: 232,
      s: "",
      a: ["hello", "world", "!!!"]
    },
    error: {
      "/": ["This is a server error"],
      "/a/1": ["This is a deeper server error", "And another deep server error"]
    }
  };

  resetServerErrors = () => {
    this.setState({ error: null });
  };

  changeServerErrors = () => {
    this.setState({
      error: {
        "/": ["A different root error"],
        "/n": ["An error on the number"],
        "/a/0": [
          "One error on an array element",
          "Another error on an array element"
        ],
        "/a/1": ["An error on a different array element"]
      }
    });
  };

  render() {
    return (
      <Form
        serverErrors={this.state.error}
        initialValue={this.state.value}
        feedbackStrategy="Always"
        onSubmit={value => {
          console.log("SUBMITTED", value);
        }}
      >
        {(link, onSubmit) => (
          <React.Fragment>
            <ObjectField
              link={link}
              validation={v => {
                if (v.s === "" || v.a.some(x => x === "")) {
                  return ["No blank string values"];
                }
                return [];
              }}
            >
              {links => {
                return (
                  <React.Fragment>
                    <div>
                      <label>
                        Number
                        <NumberField link={links.n} />
                      </label>
                    </div>
                    <div>
                      <label>
                        String
                        <StringField link={links.s} />
                      </label>
                    </div>
                    <div>
                      <label>
                        Array
                        <ArrayField link={links.a}>
                          {(links, { addField, removeField, moveField }) => (
                            <React.Fragment>
                              {links.map((link, i) => (
                                <div key={i}>
                                  <StringField
                                    link={link}
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
                              <button
                                onClick={() => addField(links.length, "zach")}
                              >
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
            <button onClick={onSubmit}>Submit</button>
            <button onClick={this.resetServerErrors}>
              Clear server errors
            </button>
            <button onClick={this.changeServerErrors}>
              Different server errors
            </button>
            <ErrorsHelper link={link}>
              {({ shouldShowErrors, flattened }) => {
                if (!shouldShowErrors) {
                  return null;
                }
                return (
                  <ul>
                    {flattened.map(e => (
                      <li style={{ color: "red" }} key={e}>
                        {e}
                      </li>
                    ))}
                  </ul>
                );
              }}
            </ErrorsHelper>
          </React.Fragment>
        )}
      </Form>
    );
  }
}

export default App;
