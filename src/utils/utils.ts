type MyPick = {
  <O, A extends keyof O>(a: A): (o: O) => O[A];
  <O, A extends keyof O>(...a: A[]): (o: O) => Pick<O, A>;
};

export const pick: MyPick = (...keys: any[]) => (o: any) =>
  keys.length === 1
    ? o[keys[0]]
    : keys.reduce((acc, key) => {
        acc[key] = o[key];
        return acc;
      }, {});
