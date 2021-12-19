import { Selector, selector } from '../selector';
import { array, eq, monoid, record, set } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';
import { eqStrict } from 'fp-ts/lib/Eq';
import { Expand } from '../utils';

export type Container<O, A> = {
  value: Selector<O, A>;
  depKeys: Set<keyof O>;
};

export type ContainerDeps<C> = C extends Container<infer T, any> ? T : never;

export type ContainerValue<C> = C extends Container<any, infer T> ? T : never;

const create = <O>() => <K extends keyof O = never>(...keys: K[]) =>
  (({
    value: selector.keys<O>()(...keys),
    depKeys: set.fromArray(eq.eqString)(keys as string[]),
  } as any) as Container<O, O>);

const of = <A>(value: A): Container<{}, A> => ({
  value: selector.of(value),
  depKeys: set.empty,
});

export type BaseContainer<O, I extends PropertyKey, A> = Container<O, A> & {
  injections: Record<I, Container<any, any>>;
};

const base = <E, A>(
  container: Container<E, A>,
): BaseContainer<E, never, A> => ({
  ...container,
  injections: {},
});

const inject = <E1, K extends string, V>(key: K, value: Container<E1, V>) => <
  E extends Record<K, V>,
  I extends PropertyKey,
  A
>(
  r: BaseContainer<E, I, A>,
): BaseContainer<Expand<E1 & E>, I | K, A> => ({
  ...r,
  injections: { ...r.injections, [key]: value } as any,
});

const resolve = <E, I extends PropertyKey, A>(base: BaseContainer<E, I, A>) => (
  deps: Expand<Omit<E, I>>,
): A => {
  const { acc, left } = pipe(base.injections, record.toArray, entries =>
    loop(deps, entries),
  );

  if (left.length !== 0) {
    throw new Error(`Unresolved dependencies: ${left}`);
  }

  return base.value.run(acc as any);
};

const loop = (
  acc: object,
  entries: [string, Container<any, any>][],
): { acc: object; left: [string, Container<any, any>][] } =>
  pipe(
    entries,
    array.partition(([_, value]) =>
      pipe(Object.keys(acc), set.fromArray(eq.eqString), accSet =>
        set.isSubset(eq.eqStrict)(accSet)(value.depKeys),
      ),
    ),
    entries =>
      entries.right.length === 0
        ? { acc, left: entries.left }
        : pipe(
            entries.right,
            array.reduce(acc, (acc, [key, value]) => ({
              ...acc,
              [key]: value.value.run(acc),
            })),
            newAcc => loop(newAcc, entries.left),
          ),
  );

const map = <A, B>(f: (a: A) => B) => <E>(
  fa: Container<E, A>,
): Container<E, B> => ({ ...fa, value: pipe(fa.value, selector.map(f)) });

const defer = <E, A, K extends keyof E>(
  c: Container<E, A>,
  ...keys: K[]
): Container<Omit<E, K>, Container<Pick<E, K>, A>> => ({
  value: pipe(
    selector.defer(c.value, ...keys),
    selector.map(value => ({
      value,
      depKeys: set.fromArray(eqStrict)(keys) as any,
    })),
  ),
  depKeys: pipe(
    c.depKeys,
    set.filter(key => !keys.includes(key as K)),
  ) as any,
});

type Combine = {
  <A, RA, R>(a: Container<A, RA>): Container<A, [RA]>;
  <A, RA, B, RB, R>(a: Container<A, RA>, b: Container<B, RB>): Container<
    Expand<A & B>,
    [RA, RB]
  >;
  <A, RA, B, RB, C, RC>(
    a: Container<A, RA>,
    b: Container<B, RB>,
    c: Container<C, RC>,
  ): Container<Expand<A & B & C>, [RA, RB, RC]>;
  <A, RA, B, RB, C, RC, D, RD>(
    a: Container<A, RA>,
    b: Container<B, RB>,
    c: Container<C, RC>,
    d: Container<D, RD>,
  ): Container<Expand<A & B & C & D>, [RA, RB, RC, RD]>;
  <A, RA, B, RB, C, RC, D, RD, E, RE>(
    a: Container<A, RA>,
    b: Container<B, RB>,
    c: Container<C, RC>,
    d: Container<D, RD>,
    e: Container<E, RE>,
  ): Container<Expand<A & B & C & D & E>, [RA, RB, RC, RD, RE]>;
  <A, RA, B, RB, C, RC, D, RD, E, RE, F, RF>(
    a: Container<A, RA>,
    b: Container<B, RB>,
    c: Container<C, RC>,
    d: Container<D, RD>,
    e: Container<E, RE>,
    f: Container<F, RF>,
  ): Container<Expand<A & B & C & D & E & F>, [RA, RB, RC, RD, RE, RF]>;
  <A, RA, B, RB, C, RC, D, RD, E, RE, F, RF, G, RG>(
    a: Container<A, RA>,
    b: Container<B, RB>,
    c: Container<C, RC>,
    d: Container<D, RD>,
    e: Container<E, RE>,
    f: Container<F, RF>,
    g: Container<G, RG>,
  ): Container<Expand<A & B & C & D & E & F & G>, [RA, RB, RC, RD, RE, RF, RG]>;
};

const combine: Combine = (...args: Array<Container<any, any>>) =>
  ({
    value: selector.sequence(args.map(arg => arg.value)),
    depKeys: pipe(
      args,
      array.map(arg => arg.depKeys),
      monoid.fold(set.getUnionMonoid(eq.eqStrict)),
    ),
  } as any);

export const container = {
  create,
  of,
  inject,
  resolve,
  map,
  combine,
  base,
  defer,
};
