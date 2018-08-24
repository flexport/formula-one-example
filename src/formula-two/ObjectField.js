// @flow

import * as React from "react";

import type {FieldLink, Errors, Validation, ObjErrors} from "./types";
import {setEq} from "./utils/set";
import type {MetaField} from "./types";
import {FormContext} from "./Form";
import invariant from "./utils/invariant";

type ToFieldLink = <T>(T) => FieldLink<T>;
// $FlowFixMe(zach): ???
type Links<T: {}> = $ObjMap<T, ToFieldLink>;

type ChildError = any;
type ToChildError = <T>(T) => ChildError;
type ChildrenErrors<T> = $ObjMap<T, ToChildError>;

type Props<T: {}> = {|
  ...FieldLink<T>,
  shouldShowError: MetaField => boolean,
  validation: Validation<T>,
  children: (links: Links<T>) => React.Node,
|};

type State = {
  meta: MetaField,
};

function makeLinks<T: {}>(
  value: T,
  errors: ObjErrors,
  onChange: (newValue: T, childrenErrors: ChildrenErrors<T>) => void,
  onBlur: () => void
): Links<T> {
  return Object.keys(value).reduce((memo, k) => {
    const l: FieldLink<*> = {
      value: value[k],
      errors: errors.children[k],
      onChange: (newValue, newErrors) => {
        onChange(
          {
            ...value,
            [k]: newValue,
          },
          {
            ...errors.children,
            [k]: newErrors,
          }
        );
      },
      onBlur,
    };
    memo[k] = l;
    return memo;
  }, {});
}

class ObjectFieldInner<T: {}> extends React.Component<Props<T>, State> {
  static defaultProps = {
    validation: () => [],
  };

  constructor(props: Props<T>) {
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

  componentDidUpdate() {
    this._checkProps(this.props);
  }

  _checkProps(props: Props<T>) {
    const {errors} = props;
    if (errors.type !== "object") {
      throw new Error("Error isn't an object node");
    }

    const valueKeys = new Set(Object.keys(props.value));
    const errorKeys = new Set(Object.keys(errors.children));

    if (!setEq(valueKeys, errorKeys)) {
      throw new Error("Value and error don't have the same keys");
    }
  }

  // notes change, runs validation
  _onChange: (T, ChildrenErrors<T>) => void = (
    newValue: T,
    childrenErrors: ChildrenErrors<T>
  ) => {
    const error = this.props.validation(newValue);
    this.setState({
      meta: {
        ...this.state.meta,
        changed: true,
      },
    });
    this.props.onChange(newValue, {
      type: "object",
      data: error,
      children: childrenErrors,
    });
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

  render() {
    invariant(
      this.props.errors.type === "object",
      "Errors isn't an object node in ObjectField render()"
    );
    const links = makeLinks(
      this.props.value,
      this.props.errors,
      this._onChange,
      this._onBlur
    );
    return this.props.children(links);
  }
}

export default class ObjectField<T: {}> extends React.Component<
  $Diff<
    React.ElementConfig<typeof ObjectFieldInner>,
    {shouldShowError: MetaField => boolean}
  >
> {
  render() {
    return (
      <FormContext.Consumer>
        {({shouldShowError}) => (
          <ObjectFieldInner {...this.props} shouldShowError={shouldShowError} />
        )}
      </FormContext.Consumer>
    );
  }
}
