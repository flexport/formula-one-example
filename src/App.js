// @flow strict
import React, { Component } from "react";

import {
  Form,
  ObjectField,
  ArrayField,
  ErrorsHelper,
  Field,
  FeedbackStrategies,
  type FieldLink,
  type Validation
} from "formula-one";

import NumberInput from "./inputs/NumberInput";
import StringInput from "./inputs/StringInput";

function NumberField({
  link,
  validation
}: {
  link: FieldLink<number>,
  validation: Validation<number>
}) {
  return (
    <Field link={link} validation={validation}>
      {(value, errors, onChange, onBlur) => (
        <NumberInput
          value={value}
          errors={errors}
          onChange={onChange}
          onBlur={onBlur}
        />
      )}
    </Field>
  );
}
NumberField.defaultProps = {
  validation: () => []
};

function StringField({
  link,
  validation
}: {
  link: FieldLink<string>,
  validation: Validation<string>
}) {
  return (
    <Field link={link} validation={validation}>
      {(value, errors, onChange, onBlur) => (
        <StringInput
          value={value}
          errors={errors}
          onChange={onChange}
          onBlur={onBlur}
        />
      )}
    </Field>
  );
}
StringField.defaultProps = {
  validation: () => []
};

function checkString(s: string): Array<string> {
  if (s === "") {
    return [];
  }
  if (!s.match(/^[a-z\s]*$/i)) {
    return ["Must be alpha"];
  }
  return [];
}

type Coproduct =
  | { side: "left", value: number }
  | { side: "right", value: string };
type Contingent = {
  options: string,
  selected: { [string]: boolean }
};
type FormState = {|
  n: number,
  s: string,
  contingent: Contingent,
  a: Array<string>,
  co: Coproduct
|};
type State = {
  value: FormState,
  error: null | { [path: string]: Array<string> }
};

function pieces(s: string): Array<string> {
  return s.split(",").filter(piece => piece.trim().length > 0);
}
function updateContingent(old: Contingent, neu: Contingent): null | Contingent {
  console.log(old, neu);
  const oldOptions = pieces(old.options);
  const newOptions = pieces(neu.options);

  let oldMatchesNew = true;
  for (let i = 0; i < oldOptions.length; i += 1) {
    if (oldOptions[i] !== newOptions[i]) {
      oldMatchesNew = false;
      break;
    }
  }
  if (oldOptions.length === newOptions.length && oldMatchesNew) {
    return null;
  }

  const newSelected = pieces(neu.options).reduce((memo, piece) => {
    memo[piece.trim()] = false;
    return memo;
  }, {});
  // Maintain checked state
  Object.keys(old.selected).forEach(oldKey => {
    if (newSelected.hasOwnProperty(oldKey)) {
      newSelected[oldKey] = old.selected[oldKey];
    }
  });

  return {
    options: neu.options,
    selected: newSelected
  };
}

class App extends Component<{}, State> {
  state = {
    value: {
      n: 232,
      s: "",
      contingent: {
        options: "",
        selected: {}
      },
      a: ["hello", "world", "!!!"],
      co: { side: "left", value: 42 }
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
        initialValue={(this.state.value: FormState)}
        feedbackStrategy={FeedbackStrategies.Always}
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
                      <ObjectField
                        link={links.contingent}
                        customChange={updateContingent}
                      >
                        {(links, { value }) => (
                          <React.Fragment>
                            <label>
                              Options (comma-separated)
                              <StringField link={links.options} />
                            </label>
                            <label>Select options</label>
                            <Field link={links.selected}>
                              {(value, errors, onChange, onBlur) =>
                                Object.keys(value).map(k => (
                                  <label key={k}>
                                    {k}
                                    <input
                                      type="checkbox"
                                      checked={value[k]}
                                      onChange={e => {
                                        onChange({
                                          ...value,
                                          [k]: e.currentTarget.checked
                                        });
                                      }}
                                    />
                                  </label>
                                ))
                              }
                            </Field>
                          </React.Fragment>
                        )}
                      </ObjectField>
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
                    <div>
                      <Field link={links.co}>
                        {/* TODO(zach): get to the bottom of the inference badness
                        that happens if onChange isn't explicitly typed */}
                        {(value, errors, onChange: Coproduct => void) => (
                          <React.Fragment>
                            <label>
                              Left
                              <input
                                type="radio"
                                onChange={e => {
                                  onChange({ side: "left", value: 0 });
                                }}
                                checked={value.side === "left"}
                              />
                            </label>
                            <label>
                              Right
                              <input
                                type="radio"
                                onChange={e => {
                                  onChange({ side: "right", value: "default" });
                                }}
                                checked={value.side === "right"}
                              />
                            </label>
                          </React.Fragment>
                        )}
                      </Field>
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
