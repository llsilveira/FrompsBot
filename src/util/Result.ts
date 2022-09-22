export interface Success<T = void> { success: true, value: T }
export interface Fail { success: false, errorMessage: string }

export type Result<SuccessType = void, CanFail extends boolean = false> =
  CanFail extends true ? Success<SuccessType> | Fail : Success<SuccessType>

export function success(): Success<void>
export function success<V>(value: V): Success<V>
export function success<V = void>(value?: V): Success<V> {
  return Object.freeze({ success: true, value: value as V });
}

export function fail(errorMessage: string): Fail {
  return Object.freeze({ success: false, errorMessage });
}
