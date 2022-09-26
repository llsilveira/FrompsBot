import { ResultError } from "./error/ResultError";

export interface Success<T> { success: true, value: T }
export interface Fail<T extends ResultError> {
  success: false,
  error: T,
  throwError: () => void
}

export type ResultT<V = void, E extends ResultError | void = void> =
  E extends ResultError ? Success<V> | Fail<E> : Success<V>


export default class Result {

  public static success(): Success<void>
  public static success<V>(value: V): Success<V>
  public static success<V = void>(value?: V): Success<V> {
    return new Result._Success<V>(value as V);
  }

  public static fail<E extends ResultError>(error: E): Fail<E> {
    return new Result._Failure(error);
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

      throwError() {
        if (this.error instanceof Error) {
          throw this.error;
        }
        throw this.error;
      }
    };
}
