import EnhancedSet from "./EnhancedSet";

export default function arrayIntersection<T>(array1: T[], array2: T[]): T[] {
  return Array.from(
    (new EnhancedSet(array1)).intersection(new EnhancedSet(array2))
  );
}
