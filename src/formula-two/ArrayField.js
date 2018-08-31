// @flow strict

import * as React from "react";

import type {
  FieldLink,
  MetaField,
  Validation,
  ArrayNode,
  Err,
  OnChange,
  FormState,
} from "./types";
import {arrayChild, cleanErrors, cleanMeta, treeFromValue} from "./types";
import {type Tree} from "./Tree";
import {removeAt, replaceAt, moveFromTo, insertAt} from "./utils/array";
import {type FormContextPayload, FormContext} from "./Form";
import invariant from "./utils/invariant";
import withFormContext from "./withFormContext";

type ToFieldLink = <T>(T) => FieldLink<T>;
type Links<E> = Array<$Call<ToFieldLink, E>>;

type Props<E> = {|
  link: FieldLink<Array<E>>,
  formContext: FormContextPayload,
  validation: Validation<Array<E>>,
  children: (
    links: Links<E>,
    {
      addField: (index: number, value: E) => void,
      removeField: (index: number) => void,
      moveField: (oldIndex: number, newIndex: number) => void,
    }
  ) => React.Node,
|};

function makeLinks<E>(
  formState: FormState<Array<E>>,
  onChildChange: (number, FormState<E>) => void,
  onChildBlur: (
    number,
    Tree<{
      errors: Err,
      meta: MetaField,
    }>
  ) => void
): Links<E> {
  const [oldValue, oldTree] = formState;
  return oldValue.map((x, i) => {
    return {
      formState: arrayChild(formState, i),
      onChange: childFormState => {
        onChildChange(i, childFormState);
      },
      onBlur: childTree => {
        onChildBlur(i, childTree);
      },
    };
  });
}

class ArrayField<E> extends React.Component<Props<E>> {
  static defaultProps = {
    validation: () => [],
  };

  constructor(props: Props<E>) {
    super(props);
    this._checkProps(props);
  }

  _checkProps(props: Props<E>) {
    const [value, tree] = props.link.formState;
    // TODO(zach): This probably isn't necessary if the typechecks work with ShapedTree
    if (tree.type !== "array") {
      throw new Error("Tree doesn't have an object root.");
    }
    if (tree.children.length !== value.length) {
      throw new Error("Tree has the wrong number of children");
    }
  }

  componentDidUpdate() {
    this._checkProps(this.props);
  }

  onChildChange: (number, FormState<E>) => void = (
    index: number,
    [childValue, childTree]: FormState<E>
  ) => {
    const [oldValue, oldTree] = this.props.link.formState;

    const newMeta = {
      ...oldTree.data.meta,
      changed: true,
    };
    const newValue = replaceAt(index, childValue, oldValue);

    invariant(
      oldTree.type === "array",
      "Got a non-array node in ArrayField's onChildChange"
    );
    const newTree = {
      type: "array",
      data: {
        ...oldTree.data,
        meta: newMeta,
      },
      children: replaceAt(index, childTree, oldTree.children),
    };

    this.props.link.onChange([newValue, newTree]);
  };

  onChildBlur: (
    number,
    Tree<{
      errors: Err,
      meta: MetaField,
    }>
  ) => void = (index, childTree) => {
    const [_, tree] = this.props.link.formState;
    invariant(
      tree.type === "array",
      "ArrayField got a non-array tree in onChildBlur()"
    );
    const newTree = {
      type: "array",
      data: {
        ...tree.data,
        meta: {
          ...tree.data.meta,
          touched: true,
        },
      },
      children: replaceAt(index, childTree, tree.children),
    };
    this.props.link.onBlur(newTree);
  };

  addChildField: (number, E) => void = (index: number, childValue: E) => {
    const [oldValue, oldTree] = this.props.link.formState;
    const cleanNode = {
      errors: cleanErrors,
      meta: cleanMeta,
    };

    const newValue = insertAt(index, childValue, oldValue);
    invariant(
      oldTree.type === "array",
      "ArrayField got a non-array node in addChildField()"
    );
    const newTree = {
      type: "array",
      data: {
        ...oldTree.data,
        meta: {
          ...oldTree.data.meta,
          touched: true,
          changed: true,
        },
      },
      children: insertAt(
        index,
        treeFromValue(childValue, cleanNode),
        oldTree.children
      ),
    };
    this.props.link.onChange([newValue, newTree]);
  };

  removeChildField = (index: number) => {
    const [oldValue, oldTree] = this.props.link.formState;

    const newValue = removeAt(index, oldValue);
    invariant(
      oldTree.type === "array",
      "ArrayField got a non-array node in removeChildField()"
    );
    const newTree = {
      type: "array",
      data: {
        ...oldTree.data,
        meta: {
          ...oldTree.data.meta,
          touched: true,
          changed: true,
        },
      },
      children: removeAt(index, oldTree.children),
    };
    this.props.link.onChange([newValue, newTree]);
  };

  moveChildField = (from: number, to: number) => {
    const [oldValue, oldTree] = this.props.link.formState;

    const newValue = moveFromTo(from, to, oldValue);
    invariant(
      oldTree.type === "array",
      "ArrayField got a non-array node in moveChildField()"
    );
    const newTree = {
      type: "array",
      data: {
        ...oldTree.data,
        meta: {
          ...oldTree.data.meta,
          touched: true,
          changed: true,
        },
      },
      children: moveFromTo(from, to, oldTree.children),
    };
    this.props.link.onChange([newValue, newTree]);
  };

  render() {
    const {formState} = this.props.link;

    const links = makeLinks(formState, this.onChildChange, this.onChildBlur);
    return this.props.children(links, {
      addField: this.addChildField,
      removeField: this.removeChildField,
      moveField: this.moveChildField,
    });
  }
}

export default withFormContext(ArrayField);
