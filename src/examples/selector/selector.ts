import { selector } from '../../selector';
import { pipe } from 'fp-ts/lib/pipeable';

{
  // selecting a "branch" from a nested state object(as in redux, but this is a common pattern)

  type Todo = {
    id: number;
    text: string;
  };
  type StateBranch = {
    data: {
      todos: Todo[];
    };
  };

  const root = selector.key<StateBranch>()('todoFeature');
  const data = pipe(
    root,
    selector.map(root => root.data),
  );
  const todos = pipe(
    data,
    selector.map(data => data.todos),
  );

  const globalState = {
    todoFeature: {
      data: {
        todos: [{ id: 0, text: 'test' }],
      },
    },
    otherFeature: {},
  };
  const todos1 = todos.run(globalState);
  const todos2 = todos.run({
    ...globalState,
    todoFeature: {
      data: {
        ...globalState.todoFeature.data,
      },
    },
  });

  console.log('Equality holds', todos1 === todos2);
}

{
  // a case for di using readers
  // all dependencies are stored on one level, so they could easily be resolved
  // the dependent entity doesn't have a particular key, so it selects a "slice"
  // or a "partial" from the global object

  type User = {
    id: number;
  };
  type Todo = {
    id: number;
    userId: number;
    text: string;
  };
  type UserService = {
    getUser: () => User;
  };
  type TodoService = {
    getTodos: () => Todo[];
  };

  type Dependencies = {
    userService: UserService;
    todoService: TodoService;
  };
  const todosByUser = pipe((deps: Dependencies) => {
    const { userService, todoService } = deps;

    const user = userService.getUser();
    const todos = todoService.getTodos();
    const filtered = todos.filter(todo => todo.userId === user.id);

    return {
      filtered,
    };
  }, selector.keys('todoService', 'userService'));

  const allDependencies = {
    todoService: {
      getTodos: () => [],
    },
    userService: {
      getUser: () => ({ id: 0 }),
    },
    someOtherService: {},
  };
  const modifiedDependencies = {
    ...allDependencies,
    someOtherService: {},
  };

  const todos1 = todosByUser.run(allDependencies);
  const todos2 = todosByUser.run(modifiedDependencies);

  console.log('Equality holds', todos1 === todos2);
}

// combine is basically the same as sequenceT(it's a typecast - it uses sequence under the hood, and does nothing else)
// the main purpose of it is to facilitate the type inference of the global(or any 'combined')
// reader environment(or selectors input in this case - selector has the same shape as reader)
// more concrete - if you have a selector from { a: string } and a selector from { b: number }, the combined selector
// would be a selector from { a: string, b: number }
// note that you have to use selection by key(s) from the object, otherwise the memoization would not work

{
  // e.g. you might want to get the whole input shape of several branches
  // and make a mapping from the branches eventual results to a new shape
  type Todo = {
    id: number;
    text: string;
  };
  type TodoBranch = {
    data: {
      todos: Todo[];
    };
  };
  const todoBranch = selector.key<TodoBranch>()('todoBranch');

  type User = {
    id: number;
  };
  type UserBranch = {
    data: {
      user: User;
    };
  };
  const userBranch = selector.key<UserBranch>()('userBranch');

  const combined = selector.combine(todoBranch, userBranch);
  // @ts-ignore
  const mapped = pipe(
    combined,
    selector.map(([todoBranch, userBranch]) => ({
      user: userBranch.data.user,
      todos: todoBranch.data.todos,
    })),
  );
}

{
  // in regards to the reader di it enables you to use memoization for your readers
  // and easily map the results to use dependencies, while retaining the memoization

  type User = {
    id: number;
  };
  type Todo = {
    id: number;
    userId: number;
    text: string;
  };
  type UserService = {
    getUser: () => User;
  };
  type TodoService = {
    getTodos: () => Todo[];
  };

  const dependsOnUser = pipe(
    (deps: { userService: UserService }) => 0,
    selector.keys('userService'),
  );
  const dependsOnTodo = pipe(
    (deps: { todoService: TodoService }) => 1,
    selector.keys('todoService'),
  );
  // @ts-ignore
  const dependsOnBoth = pipe(
    selector.combine(dependsOnUser, dependsOnTodo),
    selector.map(([userResult, todoResult]) => userResult + todoResult),
  );
}
