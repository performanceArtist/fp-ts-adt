import { either, eq } from 'fp-ts';
import { Either } from 'fp-ts/lib/Either';
import { Eq, eqStrict } from 'fp-ts/lib/Eq';
import { Option } from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/pipeable';

export type Pending = {
  type: 'pending';
};
const pending: Pending = {
  type: 'pending',
};
export const isPending = (data: any): data is Pending =>
  data.type === 'pending';

export type Initial = {
  type: 'initial';
};
const initial: Initial = {
  type: 'initial',
};
export const isInitial = (data: any): data is Initial =>
  data.type === 'initial';

export type RequestState = Error | Pending | Initial;
export type RequestResult<T> = Either<RequestState, T>;

const eqRequestState: Eq<RequestState> = {
  equals: (a, b) => {
    if (a instanceof Error && b instanceof Error) {
      return String(a) === String(b);
    } else {
      return (a as any).type === (b as any).type;
    }
  },
};

const getEq = <A>(eqa: Eq<A>): Eq<RequestResult<A>> =>
  either.getEq(eqRequestState, eqa);

const getStrictEq = <A>(): Eq<RequestResult<A>> =>
  either.getEq(eqRequestState, eqStrict);

const fromOption = (e: () => Error) => <T>(o: Option<T>): RequestResult<T> =>
  pipe(o, either.fromOption(e));

export const requestResult = {
  initial: either.left(initial),
  isInitial,
  pending: either.left(pending),
  isPending,
  success: <A>(value: A): RequestResult<A> => either.right(value),
  error: (error: Error): RequestResult<never> => either.left(error),
  eq,
  eqRequestState,
  getEq,
  getStrictEq,
  fromOption,
};
