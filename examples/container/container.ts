import { pipe } from 'fp-ts/lib/function';
import { container } from '../../src/container';

type Chung = { big: 'chungus' };

const dependsOnChung = container.create<{ a: number; chung: Chung }>()(
  'a',
  'chung',
);

const getChung = pipe(
  container.create<{
    b: string;
  }>()('b'),
  container.map((): Chung => ({ big: 'chungus' })),
);

const getA = pipe(
  container.create<{ c: string; chung: Chung }>()('c', 'chung'),
  container.map(() => 0),
);

// The main feature of `container` as opposed to `selector` is injection or call management.
// I.e. it does not matter in which order dependencies are provided.
// As long as any container in the injection chain has a resolver(bound to a key), it should work as expected(as stated by types).
const getResult = pipe(
  dependsOnChung,
  container.base,
  container.inject('chung', getChung),
  container.inject('a', getA),
  container.inject('c', container.of('')),
  container.resolve,
);

console.log(getResult({ b: '' }));

const aa = container.create<{ h: 5 }>()('h');
const bb = container.create<{ g: 6 }>()('g');

// same as `selector`, just a wrapper
const ab = pipe(
  container.combine(aa, bb),
  container.map(([a, b]) => a.h + b.g),
);

console.log(ab.value.run({ h: 5, g: 6 }));

// more akin to services used in medium-chat
// baseA and baseB represent core dependencies, applied at the very last step
// service creation is lazy, as there might be a need to use many instances

type MakeServiceA = (params: { config: string }) => 'A';

const serviceA = pipe(
  container.create<{ baseA: number }>()('baseA'),
  container.map((deps): MakeServiceA => () => 'A'),
);

type MakeServiceB = () => 'B';

const serviceB = pipe(
  container.create<{ baseB: number }>()('baseB'),
  container.map((deps): MakeServiceB => () => 'B'),
);

const useServices = pipe(
  container.create<{ serviceA: 'A'; serviceB: 'B' }>()('serviceA', 'serviceB'),
  container.map(() => 0),
);

const getServicesResult = pipe(
  useServices,
  container.base,
  container.inject(
    'serviceA',
    pipe(
      serviceA,
      container.map(getA => getA({ config: '' })),
    ),
  ),
  container.inject(
    'serviceB',
    pipe(
      serviceB,
      container.map(getB => getB()),
    ),
  ),
  container.inject('baseA', container.of(0)),
  container.inject('baseB', container.of(1)),
  container.resolve,
);

console.log(getServicesResult({}));
