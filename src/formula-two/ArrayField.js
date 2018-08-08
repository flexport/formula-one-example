// @flow

import * as React from "react";

import type {ChangeFn, ArrayMap, ToError, FieldLink} from "./types";

type ToFieldLink = <T>(T) => FieldLink<T>;

type Links<E> = Array<$Call<ToFieldLink, E>>;
// type Errors<T> = $Call<$Map<ToError>, T>;

type Props<E, T: Array<E>> = {|
  value: T,
  onChange: ChangeFn<T>,
  // errors: Errors<T>,
  children: (
    links: Links<E>,
    {
      addField: (value: E) => void,
      removeField: (index: number) => void,
    }
  ) => React.Node,
|};

function makeLinks<E, T: Array<E>>(
  value: T,
  onChangeArr: ChangeFn<T>
): Links<E> {
  return value.map((x, i) => ({
    value: x,
    onChange: newValue =>
      onChangeArr([...value.slice(0, i), newValue, ...value.slice(i + 1)]),
  }));
}

export default class ArrayField<E, T: Array<E>> extends React.Component<
  Props<E, T>
> {
  render() {
    const {value, onChange} = this.props;
    const links = makeLinks(value, onChange);
    return this.props.children(links, {
      addField: newValue => onChange([...value, newValue]),
      removeField: index =>
        onChange([...value.slice(0, index), ...value.slice(index + 1)]),
    });
  }
}
