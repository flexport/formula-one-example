// @flow

import * as React from "react";

import type {ChangeFn, ArrayMap, ToError, FieldLink} from "./types";

type ToFieldLink = <T>(T) => FieldLink<T>;

type Links<E, T: Array<E>> = Array<$Call<ToFieldLink, E>>;
// type Errors<T> = $Call<$Map<ToError>, T>;

type Props<E, T: Array<E>> = {|
  value: T,
  onChange: ChangeFn<T>,
  // errors: Errors<T>,
  children: (links: Links<E, T>) => React.Node,
|};

function makeLinks<E, T: Array<E>>(
  value: T,
  onChangeArr: ChangeFn<T>
): Links<E, T> {
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
    const links = makeLinks(this.props.value, this.props.onChange);
    return this.props.children(links);
  }
}
