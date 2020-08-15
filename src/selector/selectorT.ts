import { HKT, Kind, Kind2, Kind3, URIS, URIS2, URIS3 } from 'fp-ts/lib/HKT';
import { Monad, Monad1, Monad2, Monad3 } from 'fp-ts/lib/Monad';
import { selector } from './selector';
import { pipe } from 'fp-ts/lib/pipeable';

export type SelectorT<M, R, A> = {
  type: 'selector';
  run: (r: R) => HKT<M, A>;
};

export type SelectorM<M> = {
  map: <R, A, B>(ma: SelectorT<M, R, A>, f: (a: A) => B) => SelectorT<M, R, B>;
  of: <R, A>(a: A) => SelectorT<M, R, A>;
  ap: <R, A, B>(
    mab: SelectorT<M, R, (a: A) => B>,
    ma: SelectorT<M, R, A>,
  ) => SelectorT<M, R, B>;
  chain: <R, A, B>(
    ma: SelectorT<M, R, A>,
    f: (a: A) => SelectorT<M, R, B>,
  ) => SelectorT<M, R, B>;
};

export type SelectorT1<M extends URIS, R, A> = {
  type: 'selector';
  run: (r: R) => Kind<M, A>;
};

export type SelectorM1<M extends URIS> = {
  map: <R, A, B>(
    ma: SelectorT1<M, R, A>,
    f: (a: A) => B,
  ) => SelectorT1<M, R, B>;
  of: <R, A>(a: A) => SelectorT1<M, R, A>;
  ap: <R, A, B>(
    mab: SelectorT1<M, R, (a: A) => B>,
    ma: SelectorT1<M, R, A>,
  ) => SelectorT1<M, R, B>;
  chain: <R, A, B>(
    ma: SelectorT1<M, R, A>,
    f: (a: A) => SelectorT1<M, R, B>,
  ) => SelectorT1<M, R, B>;
};

export type SelectorT2<M extends URIS2, R, E, A> = {
  type: 'selector';
  run: (r: R) => Kind2<M, E, A>;
};

export type SelectorM2<M extends URIS2> = {
  map: <R, E, A, B>(
    ma: SelectorT2<M, R, E, A>,
    f: (a: A) => B,
  ) => SelectorT2<M, R, E, B>;
  of: <R, E, A>(a: A) => SelectorT2<M, R, E, A>;
  ap: <R, E, A, B>(
    mab: SelectorT2<M, R, E, (a: A) => B>,
    ma: SelectorT2<M, R, E, A>,
  ) => SelectorT2<M, R, E, B>;
  chain: <R, E, A, B>(
    ma: SelectorT2<M, R, E, A>,
    f: (a: A) => SelectorT2<M, R, E, B>,
  ) => SelectorT2<M, R, E, B>;
};

export type SelectorT3<M extends URIS3, R, U, E, A> = {
  type: 'selector';
  run: (r: R) => Kind3<M, U, E, A>;
};

export type SelectorM3<M extends URIS3> = {
  map: <R, U, E, A, B>(
    ma: SelectorT3<M, R, U, E, A>,
    f: (a: A) => B,
  ) => SelectorT3<M, R, U, E, B>;
  of: <R, U, E, A>(a: A) => SelectorT3<M, R, U, E, A>;
  ap: <R, U, E, A, B>(
    mab: SelectorT3<M, R, U, E, (a: A) => B>,
    ma: SelectorT3<M, R, U, E, A>,
  ) => SelectorT3<M, R, U, E, B>;
  chain: <R, U, E, A, B>(
    ma: SelectorT3<M, R, U, E, A>,
    f: (a: A) => SelectorT3<M, R, U, E, B>,
  ) => SelectorT3<M, R, U, E, B>;
};

export function getSelectorM<M extends URIS3>(M: Monad3<M>): SelectorM3<M>;
export function getSelectorM<M extends URIS2>(M: Monad2<M>): SelectorM2<M>;
export function getSelectorM<M extends URIS>(M: Monad1<M>): SelectorM1<M>;
export function getSelectorM<M>(M: Monad<M>): SelectorM<M>;
export function getSelectorM<M>(M: Monad<M>): SelectorM<M> {
  return {
    map: (ma, f) =>
      pipe(
        ma,
        selector.map(ma => M.map(ma, f)),
      ),
    of: a => selector.of(M.of(a)),
    ap: (mab, ma) => selector.from(e => M.ap(mab.run(e), ma.run(e))),
    chain: (ma, f) => selector.from(e => M.chain(ma.run(e), a => f(a).run(e))),
  };
}
