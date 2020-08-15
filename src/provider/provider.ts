import { Reader } from 'fp-ts/lib/Reader';
import { getReaderM } from 'fp-ts/lib/ReaderT';
import { reader } from 'fp-ts';
import { pipeable } from 'fp-ts/lib/pipeable';
import { sequenceT, sequenceS } from 'fp-ts/lib/Apply';
import { Monad3 } from 'fp-ts/lib/Monad';

export type Provider<E, A, B> = Reader<E, Reader<A, B>>;
const URI = 'Provider';
type URI = typeof URI;
declare module 'fp-ts/lib/HKT' {
  interface URItoKind3<R, E, A> {
    Provider: Provider<R, E, A>;
  }
}

export const instanceProvider: Monad3<'Provider'> = {
  URI,
  ...getReaderM(reader.reader),
};

export const provider = {
  ...instanceProvider,
  ...pipeable(instanceProvider),
  sequenceT: sequenceT(instanceProvider),
  sequenceS: sequenceS(instanceProvider),
};
