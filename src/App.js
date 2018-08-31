// @flow strict
import React, {Component} from "react";

import Form from "./formula-two/Form";
import ObjectField from "./formula-two/ObjectField";
import ArrayField from "./formula-two/ArrayField";
import Errors from "./formula-two/Errors";
import {type Tree, leaf} from "./formula-two/tree";
import {type ServerErrors} from "./formula-two/types";

import NumberInput from "./inputs/NumberInput";
import StringInput from "./inputs/StringInput";
import makeField from "./formula-two/makeField";

// XXX(zach): Librarification (exports)
// XXX(zach): Tests
// XXX(zach): Async validations
// XXX(zach): <Field> typing mystery
// XXX(zach): rename onFoo to handleFoo in some places

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
    a: Array<string>,
  |},
  error: Tree<ServerErrors>,
};

class App extends Component<{}, State> {
  state = {
    value: {
      n: 232,
      s: "",
      a: ["hello", "world", "!!!"],
    },
    error: {
      type: "object",
      data: ["This is a server error"],
      children: {
        n: leaf([]),
        s: leaf([]),
        a: {
          type: "array",
          data: [],
          children: [
            leaf([]),
            leaf([
              "This is a deeper server error",
              "And another deep server error",
            ]),
            leaf([]),
          ],
        },
      },
    },
  };

  resetServerErrors = () => {
    this.setState({error: null});
  };

  changeServerErrors = () => {
    this.setState({
      error: {
        type: "object",
        data: ["Zach is the best"],
        children: {
          n: leaf([]),
          s: leaf([]),
          a: {
            type: "array",
            data: [],
            children: [
              leaf(["Zach is the best", "Zach is the best"]),
              leaf(["Zach is the best"]),
              leaf([]),
            ],
          },
        },
      },
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
                          {(links, {addField, removeField, moveField}) => (
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
            <Errors link={link}>
              {({shouldShowErrors, flattened}) => {
                if (!shouldShowErrors) {
                  return null;
                }
                return (
                  <ul>
                    {flattened.map(e => (
                      <li style={{color: "red"}} key={e}>
                        {e}
                      </li>
                    ))}
                  </ul>
                );
              }}
            </Errors>
          </React.Fragment>
        )}
      </Form>
    );
  }
}

export default App;
