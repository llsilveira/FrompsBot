import type Application from "../Application";

export type JSONSerializable = null | boolean | number | string | JSONSerializable[] | {
  [key: string | number]: JSONSerializable
}

export interface Sizeable {
  length: number
}

export interface AppBound {
  app: Application
}

export type RequiredProperties<T, Props extends keyof T> =
  Required<Pick<T, Props>> & Omit<T, Props>;

export type OptionalProperties<T, Props extends keyof T> =
  Partial<Pick<T, Props>> & Omit<T, Props>;


export type MapKey<T> = T extends Map<infer Type, unknown> ? Type : never;

export type MapValue<T> = T extends Map<unknown, infer Type> ? Type : never;

export type IsOptional<T> = T | undefined extends T ? true : false;
