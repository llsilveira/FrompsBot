import { ResultError } from "./error/ResultError";

export interface Success<T> { success: true, value: T }
export interface Fail<T extends ResultError> {
  success: false,
  error: T,
  message: string,
  throw: () => void
}

export type ResultT<V = void, E extends ResultError | void = void> =
  E extends ResultError ? Success<V> | Fail<E> : Success<V>


export default class Result {

  public static success(): Success<void>
  public static success<V>(value: V): Success<V>
  public static success<V = void>(value?: V): Success<V> {
    return new Result._Success<V>(value as V);
  }

  public static fail(message: string): Fail<ResultError>
  public static fail<E extends ResultError>(error: E): Fail<E>
  public static fail<E extends ResultError>(errorOrMessage: E | string): Fail<ResultError> {
    if (typeof errorOrMessage === "string") {
      return new Result._Failure(new ResultError(errorOrMessage));
    }
    return new Result._Failure(errorOrMessage);
  }

  private static _Success =
    class _Success<V> implements Success<V> {
      public readonly success = true;

      constructor(public readonly value: V) {
        this.value = value;
        Object.freeze(this);
      }
    };

  private static _Failure =
    class _Failure<E extends ResultError> implements Fail<E> {
      public readonly success = false;

      constructor(public readonly error: E) {
        this.error = error;
        Object.freeze(this);
      }

      get message() {
        return this.error.message;
      }

      throw() {
        if (this.error instanceof Error) {
          throw this.error;
        }
        throw this.error;
      }
    };
}
