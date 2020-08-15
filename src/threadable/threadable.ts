import { URIS, Kind, URIS2, Kind2, HKT } from 'fp-ts/lib/HKT';
import { Monad1, Monad2, Monad } from 'fp-ts/lib/Monad';
import { Expand } from '../utils';

type GetThreadableApply = {
  <F extends URIS>(M: Monad1<F>): <A extends object>(
    fa: Kind<F, A>,
  ) => <B extends object>(f: (a: A) => Kind<F, B>) => Kind<F, Expand<A & B>>;
  <F extends URIS2>(M: Monad2<F>): <E, A extends object>(
    fa: Kind2<F, E, A>,
  ) => <B extends object>(
    f: (a: A) => Kind2<F, E, B>,
  ) => Kind2<F, E, Expand<A & B>>;
};
export const getThreadableApply: GetThreadableApply = <F>(M: Monad<F>) => <
  A extends object
>(
  fa: HKT<F, A>,
) => <B extends object>(f: (a: A) => HKT<F, B>) =>
  M.chain(fa, fa => M.map(f(fa), fb => ({ ...fb, ...fa })));

type GetThreadablePartial = {
  <F extends URIS>(M: Monad1<F>): <
    A extends object,
    B extends Partial<A>,
    R extends object
  >(
    fa: Kind<F, B>,
  ) => (
    f: (a: A) => Kind<F, R>,
  ) => (e: Expand<Omit<A, keyof B>>) => Kind<F, Expand<R & B>>;
  <F extends URIS2>(M: Monad2<F>): <
    A extends object,
    B extends Partial<A>,
    R extends object,
    E
  >(
    fa: Kind2<F, E, B>,
  ) => (
    f: (a: A) => Kind2<F, E, R>,
  ) => (e: Expand<Omit<A, keyof B>>) => Kind2<F, E, Expand<R & B>>;
};
export const getThreadablePartial: GetThreadablePartial = <F>(M: Monad<F>) => <
  A extends object,
  B extends Partial<A>,
  R extends object
>(
  fa: HKT<F, B>,
) => (f: (a: A) => HKT<F, R>) => (e: Omit<A, keyof B>) =>
  M.chain(fa, fa =>
    M.map(f(({ ...fa, ...e } as any) as A), fb => ({ ...fb, ...fa })),
  );

type GetThreadableInject = {
  <F extends URIS>(M: Monad1<F>): <
    A extends object,
    B extends Partial<A>,
    R extends object
  >(
    fa: Kind<F, B>,
  ) => (f: (a: A) => Kind<F, R>) => (e: Expand<Omit<A, keyof B>>) => Kind<F, R>;
  <F extends URIS2>(M: Monad2<F>): <
    A extends object,
    B extends Partial<A>,
    R extends object,
    E
  >(
    fa: Kind2<F, E, B>,
  ) => (
    f: (a: A) => Kind2<F, E, R>,
  ) => (e: Expand<Omit<A, keyof B>>) => Kind2<F, E, R>;
};
export const getThreadableInject: GetThreadableInject = <F>(M: Monad<F>) => <
  A extends object,
  B extends Partial<A>,
  R extends object
>(
  fa: HKT<F, B>,
) => (f: (a: A) => HKT<F, R>) => (e: Omit<A, keyof B>) =>
  M.chain(fa, fa => f(({ ...fa, ...e } as any) as A));

export const getThreadable1 = <F extends URIS>(M: Monad1<F>) => ({
  thread: getThreadableApply(M),
  threadPartial: getThreadablePartial(M),
  inject: getThreadableInject(M),
});

export const getThreadable2 = <F extends URIS2>(M: Monad2<F>) => ({
  thread: getThreadableApply(M),
  threadPartial: getThreadablePartial(M),
  inject: getThreadableInject(M),
});
