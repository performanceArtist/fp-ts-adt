import { Selector, selector } from '../selector';
import { Expand } from '../utils';

type Combine = {
  <A, RA, R>(a: Selector<A, RA>): Selector<A, [RA]>;
  <A, RA, B, RB, R>(a: Selector<A, RA>, b: Selector<B, RB>): Selector<
    Expand<A & B>,
    [RA, RB]
  >;
  <A, RA, B, RB, C, RC>(
    a: Selector<A, RA>,
    b: Selector<B, RB>,
    c: Selector<C, RC>,
  ): Selector<Expand<A & B & C>, [RA, RB, RC]>;
  <A, RA, B, RB, C, RC, D, RD>(
    a: Selector<A, RA>,
    b: Selector<B, RB>,
    c: Selector<C, RC>,
    d: Selector<D, RD>,
  ): Selector<Expand<A & B & C & D>, [RA, RB, RC, RD]>;
  <A, RA, B, RB, C, RC, D, RD, E, RE>(
    a: Selector<A, RA>,
    b: Selector<B, RB>,
    c: Selector<C, RC>,
    d: Selector<D, RD>,
    e: Selector<E, RE>,
  ): Selector<Expand<A & B & C & D & E>, [RA, RB, RC, RD, RE]>;
  <A, RA, B, RB, C, RC, D, RD, E, RE, F, RF>(
    a: Selector<A, RA>,
    b: Selector<B, RB>,
    c: Selector<C, RC>,
    d: Selector<D, RD>,
    e: Selector<E, RE>,
    f: Selector<F, RF>,
  ): Selector<Expand<A & B & C & D & E & F>, [RA, RB, RC, RD, RE, RF]>;
  <A, RA, B, RB, C, RC, D, RD, E, RE, F, RF, G, RG>(
    a: Selector<A, RA>,
    b: Selector<B, RB>,
    c: Selector<C, RC>,
    d: Selector<D, RD>,
    e: Selector<E, RE>,
    f: Selector<F, RF>,
    g: Selector<G, RG>,
  ): Selector<Expand<A & B & C & D & E & F & G>, [RA, RB, RC, RD, RE, RF, RG]>;
};

export const combine: Combine = (...args: Array<Selector<any, any>>) =>
  selector.sequence(args) as any;
