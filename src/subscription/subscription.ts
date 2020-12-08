export type Subscription = { unsubscribe: () => void };

const sequence = (...ss: Subscription[]): Subscription => ({
  unsubscribe: () => ss.forEach(s => s.unsubscribe()),
});

const empty: Subscription = { unsubscribe: () => {} };

export type Subscribable<T> = {
  subscribe: (callback: (state: T) => void) => Subscription;
};

const merge = <A, B extends Subscribable<A>>(s: B, sub: Subscription): B => ({
  ...s,
  subscribe: callback => {
    const originalSub = s.subscribe(callback);

    return {
      unsubscribe: () => {
        originalSub.unsubscribe();
        sub.unsubscribe();
      },
    };
  },
});

export const subscription = {
  sequence,
  empty,
  merge,
};
