export type Expand<T> = {} & { [P in keyof T]: T[P] };
export type ToVoidS<T> = keyof T extends never ? void : T;
export type ToVoidT<T extends any[]> = T[0] extends undefined ? void : T;
export type Exact<A extends object, B extends A> = A &
  Record<Exclude<keyof B, keyof A>, never>;
export type AllKeys<O, K extends keyof O> = Expand<
  Exact<{ [key in K]: O[key] }, O>
>;
declare const brand: unique symbol;
export type Brand<B> = {
  [brand]: B;
};
export type Branded<A, B> = A & Brand<B>;
