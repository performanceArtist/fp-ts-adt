import { Either } from 'fp-ts/lib/Either';

export type Pending = {
  type: 'pending';
};
export const pending: Pending = {
  type: 'pending',
};
export const isPending = (data: any): data is Pending =>
  data.type === 'pending';

export type Initial = {
  type: 'initial';
};
export const initial: Initial = {
  type: 'initial',
};
export const isInitial = (data: any): data is Initial =>
  data.type === 'initial';

export type RequestResult<T> = Either<Error | Pending | Initial, T>;
