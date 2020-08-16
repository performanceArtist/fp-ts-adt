import { selector } from './selector';
import { pipe } from 'fp-ts/lib/pipeable';
import { getSelectorM } from './selectorT';
import { option } from 'fp-ts';

describe('selector.from', () => {
  it('Should memoize a function without arguments', () => {
    const f = jest.fn() as () => any;
    const mf = selector.from(f);

    mf.run();
    mf.run();
    expect(f).toBeCalledTimes(1);
  });

  it('Should memoize a function with an argument', () => {
    const f = jest.fn() as (a: number) => number;
    const mf = selector.from(f);

    mf.run(0);
    mf.run(0);
    expect(f).toBeCalledTimes(1);
  });

  it('Should return a new value if the argument has changed', () => {
    const f = (a: number) => a + 1;
    const mf = selector.from(f);
    const a = mf.run(1);
    const b = mf.run(2);

    expect(a).toBe(2);
    expect(b).toBe(3);
  });
});

describe('selector monad', () => {
  describe('map', () => {
    const f = selector.from((a: number) => a + 1);
    const m = jest.fn() as (a: number) => number;
    const mf = pipe(f, selector.map(m));

    mf.run(0);
    mf.run(0);
    expect(m).toBeCalledTimes(1);
  });

  describe('ap', () => {
    const f = jest.fn() as (a: number) => number;
    const fa = selector.from((a: number) => a);
    const fab = selector.from((_: number) => f);
    const combined = pipe(fab, selector.ap(fa));

    combined.run(0);
    combined.run(0);
    expect(f).toBeCalledTimes(1);
  });

  describe('chain', () => {
    const ff = jest.fn() as (a: number) => number;
    const i = selector.from(ff);
    const fa = selector.from((a: number) => a);
    const combined = pipe(
      fa,
      selector.chain(e => i),
    );

    combined.run(0);
    combined.run(0);
    expect(ff).toBeCalledTimes(1);
  });
});

describe('selector.sequenceT', () => {
  const f1 = jest.fn() as (a: number) => 0;
  const f2 = jest.fn() as (a: number) => 1;
  const combined = selector.sequenceT(selector.from(f1), selector.from(f2));

  combined.run(0);
  combined.run(0);
  expect(f1).toBeCalledTimes(1);
  expect(f2).toBeCalledTimes(1);
});

describe('selector.combine', () => {
  it('typecasts array.sequence(selector)', () => {
    const a = selector.key<number>()('a');
    const b = selector.key<number>()('b');
    const ab = selector.combine(a, b);

    const r1 = ab.run({ a: 0, b: 0 });
    const r2 = ab.run({ a: 0, b: 0 });
    expect(r1).toBe(r2);
  });
});

describe('selector.key', () => {
  it('memoizes', () => {
    const f = jest.fn() as (b: number) => number;
    const outer = pipe(selector.key<number>()('test'), selector.map(f));

    outer.run({ test: 0 });
    outer.run({ test: 0 });
    expect(f).toBeCalledTimes(1);
  });
});

describe('selector.keys', () => {
  it('memoizes', () => {
    const f = jest.fn() as (a: { b: number }) => 0;
    const mf = pipe(f, selector.keys('b'));

    mf.run({ b: 0 });
    mf.run({ b: 0 });
    expect(f).toBeCalledTimes(1);
  });
});

describe('selectorT', () => {
  const selectorOption = getSelectorM(option.option);
  const f = selector.from(option.fromPredicate((e: number) => e > 0));

  it('map', () => {
    const fm = selectorOption.map(f, a => a + 1);

    const r1 = fm.run(1);
    const r2 = fm.run(1);
    expect(r1).toBe(r2);
  });

  it('ap', () => {
    const add = (a: number) => option.some((b: number) => a + b);
    const fab = selector.from(add);
    const combined = selectorOption.ap(fab, f);

    const r1 = combined.run(0);
    const r2 = combined.run(0);
    expect(r1).toBe(r2);
  });

  it('chain', () => {
    const cf = (a: number) => f;
    const combined = selectorOption.chain(f, cf);

    const r1 = combined.run(0);
    const r2 = combined.run(0);
    expect(r1).toBe(r2);
  });
});

describe('selector.defer', () => {
  const s = pipe(
    (a: { a: number; b: string }) => ({}),
    selector.keys('a', 'b'),
  );
  const combined = pipe(
    selector.defer(s, 'a'),
    selector.map(s => s.run({ a: 0 })),
  );

  const r1 = combined.run({ b: 'test' });
  const r2 = combined.run({ b: 'test' });
  expect(r1).toBe(r2);
});
