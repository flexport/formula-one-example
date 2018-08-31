// @flow strict
import React, {Component} from "react";

import Form from "./formula-two/Form";
import ObjectField from "./formula-two/ObjectField";
import ArrayField from "./formula-two/ArrayField";
import {type FormState} from "./formula-two/types";

import NumberInput from "./inputs/NumberInput";
import StringInput from "./inputs/StringInput";
import makeField from "./formula-two/makeField";

// XXX(zach): better ShapedTree
// XXX(zach): Clean up tree reconstructions
// XXX(zach): Rename Tree.js to tree.js
// XXX(zach): Name for type of OnBlur arg
// XXX(zach): <Field> HOC
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
        {(formState, onChange, onBlur, onSubmit) => (
          <React.Fragment>
            <ObjectField
              link={{
                formState,
                onChange,
                onBlur,
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
          </React.Fragment>
        )}
      </Form>
    );
  }
}

export default App;
