// @flow

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
import {arrayChild, cleanErrors, cleanMeta} from "./types";
import {type Tree} from "./Tree";
import {removeAt, replaceAt, moveFromTo, insertAt} from "./utils/array";
import {type FormContextPayload, FormContext} from "./Form";
import invariant from "./utils/invariant";
import withFormContext from "./withFormContext";

type ToFieldLink = <T>(T) => FieldLink<T>;
type Links<E> = Array<$Call<ToFieldLink, E>>;

type Props<E> = {|
  ...$Exact<FieldLink<Array<E>>>,
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
    const [value, tree] = props.formState;
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
    const [oldValue, oldTree] = this.props.formState;

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

    this.props.onChange([newValue, newTree]);
  };

  onChildBlur: (
    number,
    Tree<{
      errors: Err,
      meta: MetaField,
    }>
  ) => void = (index, childTree) => {
    const [_, tree] = this.props.formState;
    invariant(
      tree.type === "array",
      "ArrayField got a non-array tree in onChildBlur"
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
      children: replaceAt(index, childTree, tree.children),
    };
    this.props.onBlur(newTree);
  };

  addChildField: (number, E) => void = (index: number, childValue: E) => {
    const [oldValue, oldTree] = this.props.formState;
    const newTODO = {
      errors: cleanErrors,
      meta: cleanMeta,
    };

    const newValue = insertAt(index, childValue, oldValue);
    const newTree = {
      type: "array",
      data: {
        ...oldTree.data,
        meta: {
          ...oldTree.data.meta,
          touched: true,
        },
      },
      children: insertAt(index, newTODO);
    }
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
