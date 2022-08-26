import v8 = require("v8");

export default function structuredClone<T>(obj: T): T {
  return v8.deserialize(v8.serialize(obj)) as T;
}
