# Reader DI primer

What is `Reader`?

Here is how its definition looks in `fp-ts`:

```ts
export interface Reader<R, A> {
  (r: R): A
}
```

As you can see, `Reader` technically is any function that takes one argument. Conceptually this function is supposed to receive a read-only "environment". Let's say we are working with this particular environment:

```ts
type Todo = {
  id: number;
  userId: number;
  text: string;
};

type TodoService = {
  getTodos: () => Todo[];
};

type TodoDeps = {
  todoService: TodoService;
};
```

There are several main operations used to work with `Reader`, which can be easily broken down by writing them with a function-only equivalent.

"ask" for an environment or initialize a `Reader`:

```ts
const ask = reader.ask<TodoDeps>();
const askf = (deps: TodoDeps) => deps;
```

Initialize a `Reader` with a selector(any function working with an environment):

```ts
const selector = (deps: TodoDeps) => {
  const todos = deps.todoService.getTodos();
  return { todos };
};
const asks = reader.asks(selector);
const asksf = (deps: TodoDeps) => selector(deps);
```

Alternatively to `asks`, we can use `map` to transform the value of a `Reader` to achieve the same effect:

```ts
const map = pipe(reader.ask<TodoDeps>(), reader.map(selector));
const mapf = pipe(reader.ask<TodoDeps>(), r => (deps: TodoDeps) =>
  selector(r(deps)),
);
```

As you can see, `map` amounts to left-to-right composition. And of course, it can be used again to further modify a value:

```ts
const map2 = pipe(
  map,
  reader.map(({ todos }) => ({ todos, todosTotal: todos.length })),
);
```

Ultimately, `Reader` doesn't do anything special. It is a very thin abstraction.

Now consider this case: what if we need to use a `Reader` value inside of another `Reader` that has different dependencies? This is an especially common case for `React` components. We might want to render a component with a dependency inside of another component, which may also have its own dependencies.

Here is the second environment to be used:

```ts
type User = {
  id: number;
};
type UserService = {
  getUser: () => User;
};
type UserDeps = {
  userService: UserService;
};
```

And here is how you can do this "manually":

```ts
const useTodoService = reader.asks((deps: TodoDeps) => {
  const todos = deps.todoService.getTodos();
  return { todos };
});

const useUserTodoService = (deps: UserDeps & TodoDeps) => {
  const todos = useTodoService(deps);
  const user = deps.userService.getUser();

  return { todos, user };
};
```

Notice that there is a certain pattern here: dependencies object type is created using `&`, then, since the object already contains `TodoDeps`, we can pass it to the function we need to use(`useTodoService`). This process can be automated utilizing a function that creates a function taking the combined dependencies, which are then passed to each `Reader` to form a result:

```ts
type Combine = {
  <A, RA, R>(a: Reader<A, RA>): Reader<A, [RA]>;
  <A, RA, B, RB, R>(a: Reader<A, RA>, b: Reader<B, RB>): Reader<
    A & B,
    [RA, RB]
  >;
  <A, RA, B, RB, C, RC>(
    a: Reader<A, RA>,
    b: Reader<B, RB>,
    c: Reader<C, RC>,
  ): Reader<A & B & C, [RA, RB, RC]>;
};
const combine: Combine = (...args: Array<Reader<any, any>>) => deps =>
  args.map(r => r(deps)) as any;
```

Same result achieved using `combine`:

```ts
const useUserTodoService1 = pipe(
  combine(useTodoService, reader.ask<UserDeps>()),
  reader.map(([todos, userDeps]) => {
    const user = userDeps.userService.getUser();

    return { todos, user };
  }),
);
```

There is yet another problem: what if we need to pass one dependency to `Reader`, while its environment object contains multiple ones? This can be solved by creating a `Reader` inside of a `Reader`. The outer `Reader` will take dependencies, omitting the keys, values to which we want to provide, while the inner `Reader` will only take an object with the aforementioned keys.

```ts
const defer = <E extends object, A, K extends keyof E>(
  r: Reader<E, A>,
  ...keys: K[]
): Reader<Omit<E, K>, Reader<Pick<E, K>, A>> => (outer: any) => (inner: any) =>
  r({ ...outer, ...inner });
```

The usage example:

```ts
const useManyDeps = reader.asks((deps: TodoDeps & UserDeps) => {
  const todos = deps.todoService.getTodos();
  const user = deps.userService.getUser();

  return { todos, user };
});
const todoServiceApplied = pipe(
  defer(useManyDeps, 'todoService'),
  reader.map(innerReader => {
    const { todos, user } = innerReader({
      todoService: { getTodos: () => [] },
    });
    return { todos, user };
  }),
);
const result = todoServiceApplied({
  userService: { getUser: () => ({ id: 0 }) },
});
```

That is about it regarding `Reader`. You can get a better intuition by using it to inject dependencies to your `React` components and to the dependencies themselves. There is but one problem.

Consider this case:

```ts
const useTodoService = reader.asks((deps: TodoDeps) => {
  const todos = deps.todoService.getTodos();
  return { todos };
});

const useUserService = reader.asks((deps: UserDeps) => {
  const user = deps.userService.getUser();

  return { user };
});

const useAll = pipe(
  combine(useTodoService, useUserService),
  reader.map(([{ todos }, { user }]) => ({ todos, user })),
);

const userService: UserService = {
  getUser: () => ({ id: 0 }),
};
const todoService: TodoService = {
  getTodos: () => [],
};

const result1 = useAll({ userService, todoService });
const result2 = useAll({ userService, todoService: { getTodos: () => [] } });
```

In the second result, `todoService` has changed, but `userService` has stayed the same. Regardless, both `useTodoService` and `useUserService` will be called twice. This is not desirable - there is no need to recreate the result of `useUserService` the second time around. Though with this example it seems like a minor problem, it is a lot more apparent when the functions do more work. Not to mention, if a function creates a `React` component, it will cause an unmount(since the reference to the component will change).

The solution is yet another abstraction - `Selector`. `Selector` is used to represent a function with memoizing capabilities. Under the hood it's nothing but an object with a `run` field, containing this function. This is done in order to distinguish it from other functions.

```ts
export type Selector<E, A> = {
  type: 'selector';
  run: (e: E) => A;
};
```

While `Selector` is very general and can be used in a variety of ways, it is also imbued with some of the same capabilities as the described `Reader` toolkit(`combine`, `map` and `defer`). It also provides a `keys` function, which is a specialized version of `ask`. `keys` ensures that the inner function will only be called if any of the keys described by object type have changed.

Here is how you can rewrite the example using `Selector`:

```ts
const useTodoService = pipe(
  selector.keys<TodoDeps>()('todoService'),
  selector.map(deps => {
    const todos = deps.todoService.getTodos();
    return { todos };
  }),
);

const useUserService = pipe(
  selector.keys<UserDeps>()('userService'),
  selector.map(deps => {
    const user = deps.userService.getUser();

    return { user };
  }),
);

const useAll = pipe(
  selector.combine(useTodoService, useUserService),
  selector.map(([{ todos }, { user }]) => ({ todos, user })),
);

const userService: UserService = {
  getUser: () => ({ id: 0 }),
};
const todoService: TodoService = {
  getTodos: () => [],
};

const result1 = useAll.run({ userService, todoService });
const result2 = useAll.run({
  userService,
  todoService: { getTodos: () => [] },
});
```

The only difference is in how `useTodoService` and `useUserService` are created. The other functions are acting as you would expect from `Reader`. So as long you are initializing your "readers" with `keys` and mapping them with `map`, the values won't be recreated.
