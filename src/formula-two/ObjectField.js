// @flow strict

import * as React from "react";

import type {FieldLink, Validation, Extras} from "./types";
import {type FormContextPayload} from "./Form";
import withFormContext from "./withFormContext";
import invariant from "./utils/invariant";
import {
  type FormState,
  setChanged,
  replaceObjectChild,
  setExtrasTouched,
  objectChild,
  validate,
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
  onChildBlur: (string, ShapedTree<V, Extras>) => void
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
    // if (tree.type !== "object") {
    //   throw new Error("Tree doesn't have an object root.");
    // }
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

  render() {
    const links = makeLinks(
      this.props.link.formState,
      this.onChildChange,
      this.onChildBlur
    );
    return this.props.children(links);
  }
}

export default withFormContext(ObjectField);
