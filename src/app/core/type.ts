import type Application from "../Application";


export type AddPrefix<T extends string, Prefix extends string> =
  `${Prefix}${T}`;

export type RemovePrefix<Prefixed extends string, Prefix extends string> =
  Prefixed extends AddPrefix<infer T, Prefix> ? T : never;


export type JSONSerializable = null | boolean | number | string | JSONSerializable[] | {
  [key: string | number]: JSONSerializable
}

export interface Sizeable {
  length: number
}

export type MapKey<T> = T extends Map<infer Type, unknown> ? Type : never;

export type MapValue<T> = T extends Map<unknown, infer Type> ? Type : never;


export type IsOptional<T> = T | undefined extends T ? true : false;

export type MakeRequired<T, Props extends keyof T> =
  Required<Pick<T, Props>> & Omit<T, Props>;

export type MakeOptional<T, Props extends keyof T> =
  Partial<Pick<T, Props>> & Omit<T, Props>;

export type OptionalProperties<T> = {
  [Key in keyof T]: IsOptional<T[Key]> extends true ? Key : never
}[keyof T] & PropertyKey

export type RequiredProperties<T> = Exclude<keyof T, OptionalProperties<T>>

export type SetOptionalUndefined<T> = T & {
  [Key in OptionalProperties<T>]?: undefined;
}

export type KeysByValueType<Type, FilterType> = {
  [Key in keyof Type]: [Type[Key]] extends [FilterType] ? Key : never;
}[keyof Type] & keyof Type

// TODO: Find better place
export interface AppBound {
  app: Application
}
