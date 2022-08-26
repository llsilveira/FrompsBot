export default function* namedPropertyIterator(
  obj: { [index: string]: unknown }
) {
  for (const k in obj) yield [k, obj[k]];
}
