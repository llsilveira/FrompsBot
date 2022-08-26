import CheckError from "../errors/CheckError";


export type Constraint<T, E extends unknown[]> = {
  (obj: T, ...extraParams: E): boolean | Promise<boolean>
};

export type ParamMapper<A extends unknown[], E extends unknown[]> =
  (args: A) => E | Promise<E>;

export type ConstraintSpec<T, E extends unknown[], A extends unknown[]> =
  [Constraint<T, E>, ParamMapper<A, E>];


type CheckReturn<T, A extends unknown[]> = <C extends T, P extends A, R>(
  target: C,
  key: keyof C,
  descriptor: TypedPropertyDescriptor<(this: C, ...args: P) => Promise<R>>
) => TypedPropertyDescriptor<(this: C, ...args: P) => Promise<R>>


export default function check<
  T,
  E extends unknown[],
  A extends [...E, ...unknown[]]
>(
  constraint: Constraint<T, E>
): CheckReturn<T, A>;
export default function check<T, E extends unknown[], A extends unknown[]>(
  constraint: Constraint<T, E>, paramMapper: ParamMapper<A, E>
): CheckReturn<T, A>;
export default function check<T, E extends unknown[], A extends unknown[]>(
  constraint: Constraint<T, E>, paramMapper?: ParamMapper<A, E>
): CheckReturn<T, A> {

  const mapper = paramMapper ?
    paramMapper :
    // This is ok because the first function overload guarantees that if
    // paramMapper is not provided, then A extends [...E, ...unknown[]].
    ((args: [...A, ...unknown[]]) => args) as unknown as ParamMapper<A, E>;

  return function check_decorator<C extends T, P extends A, R>(
    target: C,
    key: keyof C,
    descriptor: TypedPropertyDescriptor<(this: C, ...args: P) => Promise<R>>
  ) {
    const { value: original } = descriptor;

    if (typeof original === "function") {

      const check_wrapper = async function check_wrapper(
        this: C, ...args: P
      ): Promise<R> {
        const params = await mapper(args);

        await doCheck(constraint, this, [...params]);
        return await original.apply(this, args);
      };

      return {
        ...descriptor,
        value: check_wrapper
      };
    } else {
      throw new Error("You can only use 'check' to decorate methods!");
    }
  };
}

async function doCheck<T, E extends unknown[]>(
  constraint: Constraint<T, E>, thisArg: T, parameters: [...E, ...unknown[]]
) {
  const value = await constraint(thisArg, ...(parameters as unknown as E));
  if (!value) {
    throw new CheckError(`Check failed: ${constraint.name}`);
  }
}
