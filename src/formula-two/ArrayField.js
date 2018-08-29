// @flow

import * as React from "react";

import type {
  Errors,
  FieldLink,
  FieldLinkProps,
  MetaField,
  Validation,
  ArrayNode,
  Err,
} from "./types";
import {removeAt, replaceAt, moveFromTo} from "./utils/array";
import {type FormContextPayload, FormContext} from "./Form";
import invariant from "./utils/invariant";
import withFormContext from "./withFormContext";

type ToFieldLink = <T>(T) => FieldLink<T>;
type Links<E> = Array<$Call<ToFieldLink, E>>;

type ChildrenErrors = Array<Errors>;

type Props<E> = {|
  ...FieldLinkProps<Array<E>>,
  formContext: FormContextPayload,
  validation: Validation<Array<E>>,
  children: (
    links: Links<E>,
    {
      addField: (value: E) => void,
      removeField: (index: number) => void,
      moveField: (oldIndex: number, newIndex: number) => void,
    }
  ) => React.Node,
|};

type State = {
  meta: MetaField,
};

function makeLinks<E>(
  value: Array<E>,
  errors: Errors,
  onChange: (newValue: Array<E>, childrenErrors: ChildrenErrors) => void,
  onBlur: () => void
): Links<E> {
  const e = errors;
  invariant(e.type === "array", "Errors is not an array node");
  return value.map((x, i) => ({
    value: x,
    errors: e.children[i],
    onChange: (newValue: E, newErrors: Errors) => {
      const nextValue = replaceAt(i, newValue, value);
      const nextChildrenErrors = replaceAt(i, newErrors, e.children);
      onChange(nextValue, nextChildrenErrors);
    },
    onBlur,
  }));
}

class ArrayField<E> extends React.Component<Props<E>, State> {
  static defaultProps = {
    validation: () => [],
  };

  constructor(props: Props<E>) {
    super(props);
    this._checkProps(props);

    this.state = {
      meta: {
        touched: false,
        changed: false,
        succeeded: false,
        asyncValidationInFlight: false,
      },
    };
  }

  _checkProps(props: Props<E>) {
    const {errors} = props;
    if (errors.type !== "array") {
      throw new Error("Error isn't an array node");
    }

    if (props.value.length !== errors.children.length) {
      throw new Error("Value doesn't have the same length as errors");
    }
  }

  componentDidUpdate() {
    this._checkProps(this.props);
  }

  _onChildrenChange: (Array<E>, ChildrenErrors) => void = (
    newValue,
    childrenErrors
  ) => {
    const error = this.props.validation(newValue);
    this._onChange(newValue, {
      type: "array",
      data: error,
      children: childrenErrors,
    });
  };

  _onChange: (Array<E>, Errors) => void = (newValue, errors) => {
    this.setState({
      meta: {
        ...this.state.meta,
        changed: true,
      },
    });
    this.props.onChange(newValue, errors);
  };

  _onBlur = () => {
    this.setState({
      meta: {
        ...this.state.meta,
        touched: true,
      },
    });
    this.props.onBlur();
  };

  validate(): ArrayNode<Err> {
    // TODO
    return {
      type: "array",
      data: [],
      children: [],
    };
  }

  render() {
    const {value, errors, onChange} = this.props;
    invariant(errors.type === "array", "Got a non-array node");

    const links = makeLinks(
      value,
      errors,
      this._onChildrenChange,
      this._onBlur
    );
    return this.props.children(links, {
      addField: newChildValue => {
        const newValue = [...value, newChildValue];
        // Can't really do this yet, there is no child?
        // better to flag that we need validation in future
        // or will validation occur on first render (does that count as a change?)
        const newError = this.validate();
        this._onChange(newValue, newError);
      },
      removeField: index => {
        const newValue = removeAt(index, value);
        const newError = {
          type: "array",
          data: this.props.validation(newValue),
          children: removeAt(index, errors.children),
        };
        this._onChange(newValue, newError);
      },
      moveField: (oldIndex: number, newIndex: number) => {
        const newValue = moveFromTo(oldIndex, newIndex, value);
        const newError = {
          type: "array",
          data: this.props.validation(newValue),
          children: moveFromTo(oldIndex, newIndex, errors.children),
        };
        this._onChange(newValue, newError);
      },
    });
  }
}

export default withFormContext(ArrayField);
