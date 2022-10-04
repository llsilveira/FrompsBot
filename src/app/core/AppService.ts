import AppModule from "../AppModule";
import { ResultError } from "./logic/error/ResultError";
import { ResultT } from "./logic/Result";
import { RemovePrefix } from "./type";


export type IService<S> = {
  /* Any string named method that does not start with '_' must return 'ResultT' */
  [Key in keyof S]: Key extends string
  ? RemovePrefix<Key, "_"> extends never
    ? S[Key] extends (...args: infer Args) => infer Ret
      ? [Ret] extends [ResultT<unknown, void | ResultError> | Promise<ResultT<unknown, void | ResultError>>]
        ? S[Key]
        : never
      : S[Key]
    : S[Key]
  : S[Key]
};


export default abstract class AppService
  extends AppModule
  implements IService<AppService> {}
