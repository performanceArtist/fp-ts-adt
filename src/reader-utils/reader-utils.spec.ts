import { readerUtils }from './index';

describe('readerUtils.combine', () => {
  it('typecasts array.sequence(reader)', () => {
    const a = (e: { a: number }) => e.a;
    const b = (e: { b: number }) => e.b;
    const c = readerUtils.combine(a, b);

    expect(c({ a: 0, b: 1 })).toEqual([0, 1]);
  })
});
