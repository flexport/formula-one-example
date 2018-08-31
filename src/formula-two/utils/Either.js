// @flow strict

export opaque type Either<L, R> =
  | {isLeft: true, left: L}
  | {isLeft: false, right: R};

export function left<L, R>(value: L): Either<L, R> {
  return {isLeft: true, left: value};
}
export function right<L, R>(value: R): Either<L, R> {
  return {isLeft: false, right: value};
}
