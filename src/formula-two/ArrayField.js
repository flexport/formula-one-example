// @flow strict

import * as React from "react";

import type {FieldLink, Validation, Extras} from "./types";
import {cleanErrors, cleanMeta} from "./types";
import {
  type ShapedTree,
  treeFromValue,
  dangerouslyReplaceArrayChild,
  mapRoot,
  dangerouslySetChildren,
  shapedArrayChildren,
} from "./shapedTree";
import {removeAt, moveFromTo, insertAt} from "./utils/array";
import {type FormContextPayload} from "./Form";
import withFormContext from "./withFormContext";
import {
  type FormState,
  replaceArrayChild,
  setTouched,
  setChanged,
  setExtrasTouched,
  arrayChild,
  validate,
  getExtras,
  setClientErrors,
} from "./formState";

type ToFieldLink = <T>(T) => FieldLink<T>;
type Links<E> = Array<$Call<ToFieldLink, E>>;

type Props<E> = {|
  +link: FieldLink<Array<E>>,
  +formContext: FormContextPayload,
  +validation: Validation<Array<E>>,
  +children: (
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
  onChildBlur: (number, ShapedTree<E, Extras>) => void,
  onChildValidation: (number, ShapedTree<E, Extras>) => void
): Links<E> {
  const [oldValue] = formState;
  return oldValue.map((x, i) => {
    return {
      formState: arrayChild(i, formState),
      onChange: childFormState => {
        onChildChange(i, childFormState);
      },
      onBlur: childTree => {
        onChildBlur(i, childTree);
      },
      onValidation: childTree => {
        onChildValidation(i, childTree);
      },
    };
  });
}

class ArrayField<E> extends React.Component<Props<E>> {
  static defaultProps = {
    validation: () => [],
  };

  validate() {
    const [value] = this.props.link.formState;
    const {errors} = getExtras(this.props.link.formState);
    if (errors.client === "pending") {
      this.props.link.onValidation(
        setClientErrors(
          this.props.validation(value),
          this.props.link.formState
        )[1]
      );
    }
  }

  componentDidMount() {
    this.validate();
  }

  onChildChange: (number, FormState<E>) => void = (
    index: number,
    newChild: FormState<E>
  ) => {
    // TODO(zach): validation
    this.props.link.onChange(
      setChanged(
        validate(
          this.props.validation,
          replaceArrayChild(index, newChild, this.props.link.formState)
        )
      )
    );
  };

  onChildBlur: (number, ShapedTree<E, Extras>) => void = (index, childTree) => {
    const [_, tree] = this.props.link.formState;
    this.props.link.onBlur(
      mapRoot(
        setExtrasTouched,
        dangerouslyReplaceArrayChild(index, childTree, tree)
      )
    );
  };

  onChildValidation: (number, ShapedTree<E, Extras>) => void = (
    index,
    childTree
  ) => {
    const [_, tree] = this.props.link.formState;
    this.props.link.onValidation(
      dangerouslyReplaceArrayChild(index, childTree, tree)
    );
  };

  addChildField: (number, E) => void = (index: number, childValue: E) => {
    const [oldValue, oldTree] = this.props.link.formState;
    const cleanNode = {
      errors: cleanErrors,
      meta: cleanMeta,
    };

    const newValue = insertAt(index, childValue, oldValue);
    const newTree = dangerouslySetChildren(
      insertAt(
        index,
        treeFromValue(childValue, cleanNode),
        shapedArrayChildren(oldTree)
      ),
      oldTree
    );

    this.props.link.onChange(setChanged(setTouched([newValue, newTree])));
  };

  removeChildField = (index: number) => {
    const [oldValue, oldTree] = this.props.link.formState;

    const newValue = removeAt(index, oldValue);
    const newTree = dangerouslySetChildren(
      removeAt(index, shapedArrayChildren(oldTree)),
      oldTree
    );

    this.props.link.onChange(setChanged(setTouched([newValue, newTree])));
  };

  moveChildField = (from: number, to: number) => {
    const [oldValue, oldTree] = this.props.link.formState;

    const newValue = moveFromTo(from, to, oldValue);
    const newTree = dangerouslySetChildren(
      moveFromTo(from, to, shapedArrayChildren(oldTree)),
      oldTree
    );
    this.props.link.onChange(setChanged(setTouched([newValue, newTree])));
  };

  render() {
    const {formState} = this.props.link;

    const links = makeLinks(
      formState,
      this.onChildChange,
      this.onChildBlur,
      this.onChildValidation
    );
    return this.props.children(links, {
      addField: this.addChildField,
      removeField: this.removeChildField,
      moveField: this.moveChildField,
    });
  }
}

export default withFormContext(ArrayField);
