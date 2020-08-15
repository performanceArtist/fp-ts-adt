import { Reader } from 'fp-ts/lib/Reader';
import { Expand } from '../utils';

type Combine = {
  <A, RA, R>(a: Reader<A, RA>): Reader<A, RA>;
  <A, RA, B, RB, R>(a: Reader<A, RA>, b: Reader<B, RB>): Reader<
    Expand<A & B>,
    [RA, RB]
  >;
  <A, RA, B, RB, C, RC>(
    a: Reader<A, RA>,
    b: Reader<B, RB>,
    c: Reader<C, RC>,
  ): Reader<Expand<A & B & C>, [RA, RB, RC]>;
  <A, RA, B, RB, C, RC, D, RD>(
    a: Reader<A, RA>,
    b: Reader<B, RB>,
    c: Reader<C, RC>,
    d: Reader<D, RD>,
  ): Reader<Expand<A & B & C & D>, [RA, RB, RC, RD]>;
  <A, RA, B, RB, C, RC, D, RD, E, RE>(
    a: Reader<A, RA>,
    b: Reader<B, RB>,
    c: Reader<C, RC>,
    d: Reader<D, RD>,
    e: Reader<E, RE>,
  ): Reader<Expand<A & B & C & D & E>, [RA, RB, RC, RD, RE]>;
  <A, RA, B, RB, C, RC, D, RD, E, RE, F, RF>(
    a: Reader<A, RA>,
    b: Reader<B, RB>,
    c: Reader<C, RC>,
    d: Reader<D, RD>,
    e: Reader<E, RE>,
    f: Reader<F, RF>,
  ): Reader<Expand<A & B & C & D & E & F>, [RA, RB, RC, RD, RE, RF]>;
  <A, RA, B, RB, C, RC, D, RD, E, RE, F, RF, G, RG>(
    a: Reader<A, RA>,
    b: Reader<B, RB>,
    c: Reader<C, RC>,
    d: Reader<D, RD>,
    e: Reader<E, RE>,
    f: Reader<F, RF>,
    g: Reader<G, RG>,
  ): Reader<Expand<A & B & C & D & E & F & G>, [RA, RB, RC, RD, RE, RF, RG]>;
};

export const combine: Combine = (...args: Array<Reader<any, any>>) => (
  e: object,
) => args.map(r => r(e)) as any;
