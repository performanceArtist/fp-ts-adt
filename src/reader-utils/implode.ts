import { Reader } from 'fp-ts/lib/Reader';

export const implode = <E extends object, A, K extends keyof E>(
  r: Reader<E, A>,
  ...keys: K[]
): Reader<Omit<E, K>, Reader<Pick<E, K>, A>> => (outer: any) => (inner: any) =>
  r({ ...outer, ...inner });
