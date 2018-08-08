// @flow

export opaque type Maybe<T> = {present: true, value: T} | {present: false};

// constructors
export function just<T>(value: T): Maybe<T> {
  return {present: true, value};
}
export function nothing<T>(): Maybe<T> {
  return {present: false};
}

export function mapMaybe<A, B>(f: A => B, m: Maybe<A>): Maybe<B> {
  if (m.present) {
    return {present: true, value: f(m.value)};
  }
  return {present: false};
}

export function maybe<A, B>(def: B, f: A => B, m: Maybe<A>): B {
  if (m.present) {
    return f(m.value);
  }
  return def;
}
