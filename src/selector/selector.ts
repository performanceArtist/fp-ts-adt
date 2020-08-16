import { Monad2 } from 'fp-ts/lib/Monad';
import { pipeable, pipe } from 'fp-ts/lib/pipeable';
import { sequenceT, sequenceS } from 'fp-ts/lib/Apply';
import { AllKeys } from '../utils';
import { array } from 'fp-ts';
import { identity } from 'fp-ts/lib/function';
import { combine } from './combine';

type Unary<E, A> = (e: E) => A;
export type Selector<E, A> = {
  type: 'selector';
  run: Unary<E, A>;
};
const URI = 'Selector';
type URI = typeof URI;
declare module 'fp-ts/lib/HKT' {
  interface URItoKind2<E, A> {
    Selector: Selector<E, A>;
  }
}

const memo = <A, E extends any[]>(
  f: (...args: E) => A,
): ((...args: E) => A) => {
  let args: E | undefined = undefined;
  const id = Symbol();
  let result: A | symbol = id;

  return (...e) => {
    if (args && args.every((arg, index) => arg === e[index]) && result !== id) {
      return result as A;
    } else {
      args = e;
      result = f(...e);
      return result;
    }
  };
};

const from = <E = void, A = never>(f: Unary<E, A>): Selector<E, A> => ({
  type: 'selector',
  run: memo(f),
});

export const instanceSelector: Monad2<'Selector'> = {
  URI,
  map: (fa, f) => {
    const mf = memo(f);

    return {
      type: 'selector',
      run: e => mf(fa.run(e)),
    };
  },
  of: a => from(() => a),
  ap: (fab, fa) => {
    const fabm = instanceSelector.map(fab, memo);

    return {
      type: 'selector',
      run: e => fabm.run(e)(fa.run(e)),
    };
  },
  chain: (fa, f) => {
    const mf = memo(f);

    return {
      type: 'selector',
      run: e => mf(fa.run(e)).run(e),
    };
  },
};

const zipObject = <K extends string | number | symbol>(keys: Array<K>) => (
  ...values: Array<any>
) =>
  keys.reduce(
    (acc, key, index) => ({ [key]: values[index], ...acc }),
    {} as any,
  );

const keys = <O, K extends keyof O>(...ks: K[]) => <R>(
  f: (o: O) => R,
): Selector<AllKeys<O, K>, R> => {
  const zipObjectMemo = memo(zipObject(ks));
  const fMemo = memo(f);
  const run = ((object: any) =>
    pipe(zipObjectMemo(...ks.map(key => object[key])), fMemo)) as any;

  return {
    type: 'selector',
    run,
  };
};

const key = <A>() => <K extends string | symbol>(
  key: K,
): Selector<Record<K, A>, A> => {
  const mf = memo(identity);
  return from(o => mf(o[key]));
};

const id = <A>(): Selector<A, A> => from(identity);

const defer = <E, A, K extends keyof E>(
  s: Selector<E, A>,
  ...keys: K[]
): Selector<Omit<E, K>, Selector<Pick<E, K>, A>> =>
  selector.from(oe => selector.from(ie => s.run({ ...oe, ...ie } as any)));

export const selector = {
  ...instanceSelector,
  ...pipeable(instanceSelector),
  from,
  key,
  keys,
  id,
  defer,
  sequenceT: sequenceT(instanceSelector),
  sequenceS: sequenceS(instanceSelector),
  sequence: array.array.sequence(instanceSelector),
  combine,
};
