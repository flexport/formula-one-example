// @flow strict

import * as React from "react";

import type {FieldLink, Validation, Extras} from "./types";
import {type FormContextPayload} from "./Form";
import withFormContext from "./withFormContext";
import {
  type FormState,
  setChanged,
  replaceObjectChild,
  setExtrasTouched,
  objectChild,
  validate,
  getExtras,
  setClientErrors,
} from "./formState";
import {
  type ShapedTree,
  mapRoot,
  dangerouslyReplaceObjectChild,
} from "./shapedTree";

type ToFieldLink = <T>(T) => FieldLink<T>;
type Links<T: {}> = $ObjMap<T, ToFieldLink>;

type Props<T: {}> = {|
  +link: FieldLink<T>,
  +formContext: FormContextPayload,
  +validation: Validation<T>,
  +children: (links: Links<T>) => React.Node,
|};

function makeLinks<T: {}, V>(
  formState: FormState<T>,
  onChildChange: (string, FormState<V>) => void,
  onChildBlur: (string, ShapedTree<V, Extras>) => void,
  onChildValidation: (string, ShapedTree<V, Extras>) => void
): Links<T> {
  const [value] = formState;
  return Object.keys(value).reduce((memo, k) => {
    const l = {
      formState: objectChild(k, formState),
      onChange: childFormState => {
        onChildChange(k, childFormState);
      },
      onBlur: childTree => {
        onChildBlur(k, childTree);
      },
      onValidation: childTree => {
        onChildValidation(k, childTree);
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

  onChildChange: <V>(string, FormState<V>) => void = <V>(
    key: string,
    newChild: FormState<V>
  ) => {
    this.props.link.onChange(
      setChanged(
        validate(
          this.props.validation,
          replaceObjectChild(key, newChild, this.props.link.formState)
        )
      )
    );
  };

  onChildBlur: <V>(string, ShapedTree<V, Extras>) => void = <V>(
    key: string,
    childTree: ShapedTree<V, Extras>
  ) => {
    const [_, tree] = this.props.link.formState;
    this.props.link.onBlur(
      mapRoot(
        setExtrasTouched,
        dangerouslyReplaceObjectChild(key, childTree, tree)
      )
    );
  };

  onChildValidation: <V>(string, ShapedTree<V, Extras>) => void = <V>(
    key: string,
    childTree: ShapedTree<V, Extras>
  ) => {
    const [_, tree] = this.props.link.formState;
    this.props.link.onValidation(
      dangerouslyReplaceObjectChild(key, childTree, tree)
    );
  };

  render() {
    const links = makeLinks(
      this.props.link.formState,
      this.onChildChange,
      this.onChildBlur,
      this.onChildValidation
    );
    return this.props.children(links);
  }
}

export default withFormContext(ObjectField);
