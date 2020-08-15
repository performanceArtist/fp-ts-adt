import { getThreadable1 } from './threadable';
import { option } from 'fp-ts';
import { pipe } from 'fp-ts/lib/pipeable';

describe('Threadable', () => {
  const test = getThreadable1(option.option);
  const testFunction = (input: { a: number; b: number }) =>
    option.some({
      c: input.a + input.b,
    });

  describe('thread', () => {
    it('Should add the provided properties to the result', () => {
      const result = pipe(
        testFunction,
        test.thread(option.some({ a: 1, b: 1 })),
      );
      expect(result).toStrictEqual(option.some({ a: 1, b: 1, c: 2 }));
    });
  });

  describe('threadPartial', () => {
    it('Should add the provided properties to the result upon running the fully applied function', () => {
      const partial = pipe(
        testFunction,
        test.threadPartial(option.some({ a: 1 })),
      );
      const result = partial({ b: 1 });
      expect(result).toEqual(option.some({ a: 1, c: 2 }));
    });
  });

  describe('inject', () => {
    it('Should not add the propeties to the result, only creates a partial function', () => {
      const partial = pipe(testFunction, test.inject(option.some({ a: 1 })));
      const result = partial({ b: 1 });
      expect(result).toEqual(option.some({ c: 2 }));
    });
  });
});
