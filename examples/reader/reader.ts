import { Reader } from 'fp-ts/Reader';
import { reader } from 'fp-ts';
import { pipe } from 'fp-ts/lib/pipeable';
import { selector } from '../../src/selector';

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

{
  const ask = reader.ask<TodoDeps>();
  const askf = (deps: TodoDeps) => deps;

  const selector = (deps: TodoDeps) => {
    const todos = deps.todoService.getTodos();
    return { todos };
  };
  const asks = reader.asks(selector);
  const asksf = (deps: TodoDeps) => selector(deps);

  const map = pipe(reader.ask<TodoDeps>(), reader.map(selector));
  const mapf = pipe(reader.ask<TodoDeps>(), r => (deps: TodoDeps) =>
    selector(r(deps)),
  );

  const map2 = pipe(
    map,
    reader.map(({ todos }) => ({ todos, todosTotal: todos.length })),
  );
}

type User = {
  id: number;
};
type UserService = {
  getUser: () => User;
};
type UserDeps = {
  userService: UserService;
};

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

{
  const useTodoService = reader.asks((deps: TodoDeps) => {
    const todos = deps.todoService.getTodos();
    return { todos };
  });

  const useUserTodoService = (deps: UserDeps & TodoDeps) => {
    const todos = useTodoService(deps);
    const user = deps.userService.getUser();

    return { todos, user };
  };

  const useUserTodoService1 = pipe(
    combine(useTodoService, reader.ask<UserDeps>()),
    reader.map(([todos, userDeps]) => {
      const user = userDeps.userService.getUser();

      return { todos, user };
    }),
  );
}

const defer = <E extends object, A, K extends keyof E>(
  r: Reader<E, A>,
  ...keys: K[]
): Reader<Omit<E, K>, Reader<Pick<E, K>, A>> => (outer: any) => (inner: any) =>
  r({ ...outer, ...inner });

{
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
}

{
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
}

{
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
}
