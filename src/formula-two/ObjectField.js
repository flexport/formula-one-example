// @flow

import * as React from "react";

import type {ChangeFn, $Map, ToError, FieldLink} from "./types";

type ToFieldLink = <T>(T) => FieldLink<T>;

type Links<T> = $ObjMap<T, ToFieldLink>;
type Errors<T> = $Call<$Map<ToError>, T>;

type Props<T: {}> = {|
  value: T,
  onChange: ChangeFn<T>,
  // errors: Errors<T>,
  children: (links: Links<T>) => React.Node,
|};

function makeLinks<T: {}>(value: T, onChangeObj: ChangeFn<T>): Links<T> {
  return Object.keys(value).reduce((memo, k) => {
    memo[k] = {
      value: value[k],
      onChange: newValue => {
        onChangeObj({
          ...value,
          [k]: newValue,
        });
      },
    };
    return memo;
  }, {});
}

export default class ObjectField<T: {}> extends React.Component<Props<T>> {
  render() {
    const links = makeLinks(this.props.value, this.props.onChange);
    return this.props.children(links);
  }
}
