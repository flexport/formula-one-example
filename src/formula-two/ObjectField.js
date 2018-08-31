// @flow strict

import * as React from "react";

import type {
  FieldLink,
  Validation,
  OnChange,
  FormState,
  Err,
  OnBlur,
  MetaField,
} from "./types";
import {objectChild} from "./types";
import {type Tree} from "./Tree";
import {type FormContextPayload} from "./Form";
import withFormContext from "./withFormContext";
import invariant from "./utils/invariant";

type ToFieldLink = <T>(T) => FieldLink<T>;
type Links<T: {}> = $ObjMap<T, ToFieldLink>;

type Props<T: {}> = {|
  link: FieldLink<T>,
  formContext: FormContextPayload,
  validation: Validation<T>,
  children: (links: Links<T>) => React.Node,
|};

function makeLinks<T: {}>(
  formState: FormState<T>,
  onChange: OnChange<FormState<T>>,
  onChildBlur: (
    string,
    Tree<{
      errors: Err,
      meta: MetaField,
    }>
  ) => void
): Links<T> {
  const [value, tree] = formState;
  return Object.keys(value).reduce((memo, k) => {
    const l = {
      formState: objectChild(value[k], formState, k),
      onChange: ([childValue, childTree]) => {
        const newValue = {...value, [k]: childValue};

        invariant(
          formState[1].type === "object",
          "Got a non-object node in ObjectField link onChange()"
        );
        // TODO(zach): Don't do this manually
        const newTree = {
          type: "object",
          data: formState[1].data,
          children: {
            ...formState[1].children,
            [k]: childTree,
          },
        };
        onChange([newValue, newTree]);
      },
      onBlur: childTree => {
        onChildBlur(k, childTree);
      },
    };
    memo[k] = l;
    return {
      ...memo,
      [k]: l,
    };
  }, {});
}

class ObjectField<T: {}> extends React.Component<Props<T>> {
  static defaultProps = {
    validation: () => [],
  };

  constructor(props: Props<T>) {
    super(props);
    this._checkProps(props);
  }

  componentDidUpdate() {
    this._checkProps(this.props);
  }

  _checkProps(props: Props<T>) {
    const [_, tree] = props.link.formState;
    // TODO(zach): This probably isn't necessary if the typechecks work with ShapedTree
    if (tree.type !== "object") {
      throw new Error("Tree doesn't have an object root.");
    }
  }

  // notes change, runs validation
  _onChange: (FormState<T>) => void = ([newValue, newTree]: FormState<T>) => {
    const [oldValue, oldTree] = this.props.link.formState;

    const newMeta = {
      ...oldTree.data.meta,
      changed: true,
    };
    // When to clear server errors?
    const clientErrors = this.props.validation(newValue);
    const newErrors: Err = {
      client: clientErrors,
      server: [],
    };

    invariant(
      newTree.type === "object",
      "ObjectField got a non-object tree in _onChange"
    );
    this.props.link.onChange([
      newValue,
      {
        type: "object",
        data: {
          errors: newErrors,
          meta: newMeta,
        },
        children: newTree.children,
      },
    ]);
  };

  onChildBlur: (
    string,
    Tree<{
      errors: Err,
      meta: MetaField,
    }>
  ) => void = (key, childTree) => {
    const [_, tree] = this.props.link.formState;
    invariant(
      tree.type === "object",
      "Got a non-object node in onChildBlur() of ObjectField"
    );
    const newTree = {
      type: "object",
      data: {
        ...tree.data,
        meta: {
          ...tree.data.meta,
          touched: true,
        },
      },
      children: {
        ...tree.children,
        [key]: childTree,
      },
    };
    this.props.link.onBlur(newTree);
  };

  render() {
    const links = makeLinks(
      this.props.link.formState,
      this._onChange,
      this.onChildBlur
    );
    return this.props.children(links);
  }
}

export default withFormContext(ObjectField);
