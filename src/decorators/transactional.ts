import Application from "../app/Application";
import type { AppBound } from "../app/core/type";


interface GetAppFunc<T> {(obj: T): Application}

type TransactionalReturn<T> = <C extends T, P extends unknown[], R>(
  target: C,
  key: keyof C,
  descriptor: TypedPropertyDescriptor<(this: C, ...args: P) => Promise<R>>
) => TypedPropertyDescriptor<(this: C, ...args: P) => Promise<R>>

// Type parameter here is to ensure that this function can only be called
// without parameters if the decorated object is AppBound
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function transactional<T extends AppBound> (): TransactionalReturn<T>;
export default function transactional<T>(getAppFunc: GetAppFunc<T>): TransactionalReturn<T>;
export default function transactional<T>(getAppFunc?: GetAppFunc<T>): TransactionalReturn<T> {

  const getApp: GetAppFunc<T> = getAppFunc ?
    getAppFunc :
    // obj is garanteed to be AppBound by the first overload
    ((obj: AppBound) => obj.app) as unknown as GetAppFunc<T>;

  return function transactional_decorator<C extends T, P extends unknown[], R>(
    target: C,
    key: keyof C,
    descriptor: TypedPropertyDescriptor<(this: C, ...args: P) => Promise<R>>
  ) {

    const { value: original } = descriptor;

    if (typeof original === "function") {

      const transactional_wrapper = async function transactional_wrapper(
        this: C, ...args: P
      ): Promise<R> {
        const app = getApp(this);
        const db = app.database;
        return await db.withTransaction(original.bind(this), ...args);
      };

      return {
        ...descriptor,
        value: transactional_wrapper
      };
    } else {
      throw new Error("You can only use 'transactional' to decorate methods!");
    }

  };
}
