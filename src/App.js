// @flow strict
import React, {Component} from "react";

import Form from "./formula-two/Form";
import ObjectField from "./formula-two/ObjectField";
import ArrayField from "./formula-two/ArrayField";
import Errors from "./formula-two/Errors";

import NumberInput from "./inputs/NumberInput";
import StringInput from "./inputs/StringInput";
import makeField from "./formula-two/makeField";

// XXX(zach): <Field> typing mystery
// XXX(zach): rename onFoo to handleFoo in some places

const NumberField = makeField(NumberInput);
const StringField = makeField(StringInput);

function checkString(s: string): Array<string> {
  if (s === "") {
    return [];
  }
  if (!s.match(/^[a-z]*$/i)) {
    return ["Must be alphanumeric"];
  }
  return [];
}
// function makeErrors(x: FormState): Errors {
//   return {
//     type: "object",
//     data: [],
//     children: {
//       n: {type: "leaf", data: []},
//       s: {type: "leaf", data: []},
//       a: {
//         type: "array",
//         data: [],
//         children: x.a.map(c => ({type: "leaf", data: [] /*checkString(c)*/})),
//       },
//     },
//   };
// }

type State = {
  value: {|
    n: number,
    s: string,
    a: Array<string>,
  |},
};

class App extends Component<{}, State> {
  state = {
    value: {
      n: 0,
      s: "",
      a: ["hello", "world", "!!!"],
    },
    // error: makeErrors({
    //   n: 0,
    //   s: "",
    //   a: ["hello", "world", "!!!"],
    // }),
  };

  render() {
    return (
      <Form
        serverErrors={null}
        initialValue={this.state.value}
        feedbackStrategy="OnFirstBlur"
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
            <Errors link={link}>
              {({shouldShowErrors, flattened}) => {
                if (!shouldShowErrors) {
                  return null;
                }
                return (
                  <ul>
                    {flattened.map(e => (
                      <li>{e}</li>
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
